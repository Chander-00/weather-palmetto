import { Injectable, Logger, Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import {
  WeatherProvider,
  NormalizedWeather
} from './interfaces/weather-provider.interface'
import { OpenWeatherProvider } from './providers/openweather.provider'
import { AccuWeatherProvider } from './providers/accuweather.provider'
import { WeatherGovProvider } from './providers/weathergov.provider'
import { WeatherAlertsService } from './weather-alerts.service'
import { CircuitBreaker } from './circuit-breaker'

const MAX_RETRIES = 2
const RETRY_BASE_DELAY_MS = 500

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name)
  private readonly providers: WeatherProvider[]
  private readonly circuits: Map<string, CircuitBreaker>

  constructor(
    private readonly openWeather: OpenWeatherProvider,
    private readonly accuWeather: AccuWeatherProvider,
    private readonly weatherGov: WeatherGovProvider,
    private readonly alertsService: WeatherAlertsService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {
    this.providers = [this.openWeather, this.accuWeather, this.weatherGov].sort(
      (a, b) => a.priority - b.priority
    )

    this.circuits = new Map(
      this.providers.map((p) => [
        p.name,
        new CircuitBreaker(p.name, {
          failureThreshold: 3,
          resetTimeoutMs: 30_000
        })
      ])
    )
  }

  async getWeatherByCity(
    city: string,
    units: string = 'imperial'
  ): Promise<NormalizedWeather> {
    const cacheKey = `weather:city:${city.toLowerCase()}:${units}`
    const cached = await this.cache.get<NormalizedWeather>(cacheKey)
    if (cached) {
      this.logger.log(`Cache hit for city: ${city}`)
      return cached
    }

    this.logger.log(`Fetching weather for city: ${city}`)
    const result = await this.fetchWithFallback((provider) =>
      provider.getWeatherByCity(city)
    )

    result.alerts = this.alertsService.generate(result.current, result.hourly)

    if (units === 'metric') {
      this.convertToMetric(result)
    }

    await this.cache.set(cacheKey, result, 300000)
    return result
  }

  async getWeatherByCoordinates(
    lat: number,
    lon: number,
    units: string = 'imperial'
  ): Promise<NormalizedWeather> {
    const cacheKey = `weather:coords:${lat.toFixed(2)},${lon.toFixed(2)}:${units}`
    const cached = await this.cache.get<NormalizedWeather>(cacheKey)
    if (cached) {
      this.logger.log(`Cache hit for coords: ${lat}, ${lon}`)
      return cached
    }

    this.logger.log(`Fetching weather for coords: ${lat}, ${lon}`)
    const result = await this.fetchWithFallback((provider) =>
      provider.getWeatherByCoordinates(lat, lon)
    )

    result.alerts = this.alertsService.generate(result.current, result.hourly)

    if (units === 'metric') {
      this.convertToMetric(result)
    }

    await this.cache.set(cacheKey, result, 300000)
    return result
  }

  private async fetchWithFallback(
    fetcher: (provider: WeatherProvider) => Promise<NormalizedWeather>
  ): Promise<NormalizedWeather> {
    const errors: string[] = []
    const availableProviders = this.providers.filter((p) => p.isAvailable())

    if (!availableProviders.length) {
      throw new Error('No weather providers are configured')
    }

    for (const provider of availableProviders) {
      const circuit = this.circuits.get(provider.name)!

      if (!circuit.shouldAllow()) {
        this.logger.warn(
          `Circuit OPEN for ${provider.name}, skipping`
        )
        errors.push(`${provider.name}: circuit open`)
        continue
      }

      try {
        const result = await this.retryWithBackoff(
          () => fetcher(provider),
          provider.name
        )
        circuit.onSuccess()
        this.logger.log(`Successfully fetched weather from ${provider.name}`)
        return result
      } catch (error) {
        circuit.onFailure()
        const message = error instanceof Error ? error.message : String(error)
        this.logger.warn(`Provider ${provider.name} failed: ${message}`)
        errors.push(`${provider.name}: ${message}`)
      }
    }

    throw new Error(`All weather providers failed: ${errors.join('; ')}`)
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    providerName: string
  ): Promise<T> {
    let lastError: Error | undefined
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (this.isNonRetryable(lastError)) {
          throw lastError
        }

        if (attempt < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY_MS * 2 ** attempt
          this.logger.warn(
            `Retry ${attempt + 1}/${MAX_RETRIES} for ${providerName} in ${delay}ms`
          )
          await this.sleep(delay)
        }
      }
    }
    throw lastError!
  }

  private isNonRetryable(error: Error): boolean {
    const msg = error.message.toLowerCase()
    return (
      msg.includes('not found') ||
      msg.includes('404') ||
      msg.includes('401') ||
      msg.includes('403') ||
      msg.includes('invalid api key')
    )
  }

  // Exposed as protected for testability
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private convertToMetric(weather: NormalizedWeather): void {
    const toC = (f: number) => Math.round(((f - 32) * 5) / 9)

    weather.current.temperature = toC(weather.current.temperature)
    weather.current.feelsLike = toC(weather.current.feelsLike)
    weather.current.windSpeed = Math.round(weather.current.windSpeed * 1.60934)

    for (const day of weather.forecast) {
      day.temperatureHigh = toC(day.temperatureHigh)
      day.temperatureLow = toC(day.temperatureLow)
      day.windSpeed = Math.round(day.windSpeed * 1.60934)
    }

    for (const hour of weather.hourly) {
      hour.temperature = toC(hour.temperature)
    }
  }
}
