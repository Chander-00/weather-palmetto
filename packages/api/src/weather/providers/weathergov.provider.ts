import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import {
  WeatherProvider,
  NormalizedWeather,
  ForecastDay
} from '../interfaces/weather-provider.interface'

const BASE_URL = 'https://api.weather.gov'
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const REQUEST_TIMEOUT_MS = 10_000

interface WeatherGovMeasurement {
  value: number | null
  unitCode?: string
}

interface WeatherGovObservation {
  temperature: WeatherGovMeasurement
  windSpeed: WeatherGovMeasurement
  windChill?: WeatherGovMeasurement
  windDirection: WeatherGovMeasurement
  relativeHumidity: WeatherGovMeasurement
  barometricPressure: WeatherGovMeasurement
  visibility: WeatherGovMeasurement
}

interface WeatherGovForecastPeriod {
  startTime: string
  temperature: number
  isDaytime: boolean
  windSpeed: string
  shortForecast: string
  detailedForecast: string
  probabilityOfPrecipitation?: { value: number }
}

const headers = {
  'User-Agent': '(weather-app, contact@weather-app.dev)',
  Accept: 'application/geo+json'
}

@Injectable()
export class WeatherGovProvider implements WeatherProvider {
  readonly name = 'weathergov'
  readonly priority = 3
  private readonly logger = new Logger(WeatherGovProvider.name)

  isAvailable(): boolean {
    return true
  }

  async getWeatherByCity(city: string): Promise<NormalizedWeather> {
    const geoResponse = await axios.get(GEOCODING_URL, {
      params: { name: city, count: 1, language: 'en', format: 'json' },
      timeout: REQUEST_TIMEOUT_MS
    })

    if (!geoResponse.data.results?.length) {
      throw new Error(`City "${city}" not found`)
    }

    const { latitude, longitude, name, country_code } =
      geoResponse.data.results[0]
    return this.fetchWeather(latitude, longitude, name, country_code)
  }

  async getWeatherByCoordinates(
    lat: number,
    lon: number
  ): Promise<NormalizedWeather> {
    return this.fetchWeather(lat, lon, 'Unknown', 'US')
  }

  private async fetchWeather(
    lat: number,
    lon: number,
    cityName: string,
    country: string
  ): Promise<NormalizedWeather> {
    const pointsResponse = await axios.get(
      `${BASE_URL}/points/${lat.toFixed(4)},${lon.toFixed(4)}`,
      { headers, timeout: REQUEST_TIMEOUT_MS }
    )
    const { forecastOffice, gridX, gridY, relativeLocation } =
      pointsResponse.data.properties

    const resolvedCity = relativeLocation?.properties?.city || cityName
    const resolvedState = relativeLocation?.properties?.state || country

    if (
      typeof forecastOffice !== 'string' ||
      !forecastOffice.startsWith(BASE_URL)
    ) {
      throw new Error('Invalid forecast office URL from Weather.gov')
    }

    const stationsUrl = `${forecastOffice}/stations`

    const [forecastResponse, hourlyResponse, stationsResponse] =
      await Promise.all([
        axios.get(
          `${BASE_URL}/gridpoints/${pointsResponse.data.properties.gridId}/${gridX},${gridY}/forecast`,
          { headers, timeout: REQUEST_TIMEOUT_MS }
        ),
        axios
          .get(
            `${BASE_URL}/gridpoints/${pointsResponse.data.properties.gridId}/${gridX},${gridY}/forecast/hourly`,
            { headers, timeout: REQUEST_TIMEOUT_MS }
          )
          .catch(() => null),
        axios.get(stationsUrl, { headers, timeout: REQUEST_TIMEOUT_MS }).catch(() => null)
      ])

    let currentObservation: WeatherGovObservation | null = null
    if (stationsResponse?.data?.features?.length) {
      const stationId =
        stationsResponse.data.features[0].properties.stationIdentifier
      try {
        const obsResponse = await axios.get(
          `${BASE_URL}/stations/${stationId}/observations/latest`,
          { headers, timeout: REQUEST_TIMEOUT_MS }
        )
        currentObservation = obsResponse.data.properties
      } catch {
        this.logger.warn(
          'Failed to fetch station observations, using forecast data'
        )
      }
    }

    return this.normalize(
      resolvedCity,
      resolvedState,
      lat,
      lon,
      currentObservation,
      forecastResponse.data.properties.periods,
      hourlyResponse?.data?.properties?.periods || []
    )
  }

  private fahrenheitValue(temp: WeatherGovMeasurement | undefined): number {
    if (!temp?.value && temp?.value !== 0) return 0
    if (temp.unitCode?.includes('degC') || temp.unitCode?.includes('celsius')) {
      return Math.round((temp.value * 9) / 5 + 32)
    }
    return Math.round(temp.value)
  }

  private normalize(
    city: string,
    country: string,
    lat: number,
    lon: number,
    observation: WeatherGovObservation | null,
    forecastPeriods: WeatherGovForecastPeriod[],
    hourlyPeriods: WeatherGovForecastPeriod[]
  ): NormalizedWeather {
    const current = forecastPeriods[0]

    const currentTemp = observation
      ? this.fahrenheitValue(observation.temperature)
      : current.temperature

    const currentWind = observation?.windSpeed?.value
      ? Math.round(observation.windSpeed.value * 0.621371)
      : parseFloat(current.windSpeed) || 0

    const dailyMap = new Map<
      string,
      { highs: number[]; lows: number[]; period: WeatherGovForecastPeriod }
    >()

    for (const period of forecastPeriods) {
      const date = new Date(period.startTime).toISOString().split('T')[0]
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { highs: [], lows: [], period })
      }
      const entry = dailyMap.get(date)!
      if (period.isDaytime) {
        entry.highs.push(period.temperature)
      } else {
        entry.lows.push(period.temperature)
      }
    }

    const forecastDays: ForecastDay[] = Array.from(dailyMap.entries())
      .slice(0, 5)
      .map(([date, { highs, lows, period }]) => ({
        date,
        temperatureHigh: highs.length ? Math.max(...highs) : period.temperature,
        temperatureLow: lows.length
          ? Math.min(...lows)
          : period.temperature - 10,
        humidity: observation?.relativeHumidity?.value ?? 0,
        windSpeed: parseFloat(period.windSpeed) || 0,
        condition: {
          main: period.shortForecast,
          description: period.detailedForecast || period.shortForecast,
          icon: this.mapIcon(period.shortForecast)
        }
      }))

    return {
      provider: this.name,
      location: {
        name: city,
        country,
        coordinates: { lat, lon }
      },
      current: {
        temperature: currentTemp,
        feelsLike: observation
          ? this.fahrenheitValue(
              observation.windChill || observation.temperature
            )
          : currentTemp,
        humidity: observation?.relativeHumidity?.value ?? 0,
        pressure: observation?.barometricPressure?.value
          ? Math.round(observation.barometricPressure.value / 100)
          : 1013,
        windSpeed: currentWind,
        windDirection: observation?.windDirection?.value ?? 0,
        visibility: observation?.visibility?.value ?? 10000,
        uvIndex: null,
        condition: {
          main: current.shortForecast,
          description: current.detailedForecast || current.shortForecast,
          icon: this.mapIcon(current.shortForecast)
        }
      },
      forecast: forecastDays,
      hourly: hourlyPeriods.slice(0, 8).map((period: WeatherGovForecastPeriod) => ({
        time: period.startTime,
        temperature: period.temperature,
        condition: {
          main: period.shortForecast,
          description: period.detailedForecast || period.shortForecast,
          icon: this.mapIcon(period.shortForecast)
        },
        precipitationChance: period.probabilityOfPrecipitation?.value ?? 0
      })),
      alerts: []
    }
  }

  private mapIcon(forecast: string): string {
    const lower = forecast.toLowerCase()
    if (lower.includes('sunny') || lower.includes('clear')) return '01d'
    if (lower.includes('partly')) return '02d'
    if (lower.includes('cloudy') || lower.includes('overcast')) return '04d'
    if (lower.includes('rain') || lower.includes('shower')) return '10d'
    if (lower.includes('thunder') || lower.includes('storm')) return '11d'
    if (lower.includes('snow') || lower.includes('sleet')) return '13d'
    if (lower.includes('fog') || lower.includes('mist')) return '50d'
    return '03d'
  }
}
