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

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name)
  private readonly providers: WeatherProvider[]

  constructor(
    private readonly openWeather: OpenWeatherProvider,
    private readonly accuWeather: AccuWeatherProvider,
    private readonly weatherGov: WeatherGovProvider,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {
    this.providers = [this.openWeather, this.accuWeather, this.weatherGov].sort(
      (a, b) => a.priority - b.priority
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
      try {
        const result = await fetcher(provider)
        this.logger.log(`Successfully fetched weather from ${provider.name}`)
        return result
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.logger.warn(`Provider ${provider.name} failed: ${message}`)
        errors.push(`${provider.name}: ${message}`)
      }
    }

    throw new Error(`All weather providers failed: ${errors.join('; ')}`)
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
  }
}
