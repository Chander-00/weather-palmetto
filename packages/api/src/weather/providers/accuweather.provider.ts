import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import {
  WeatherProvider,
  NormalizedWeather,
  ForecastDay
} from '../interfaces/weather-provider.interface'

interface AccuWeatherLocation {
  Key: string
  LocalizedName: string
  Country: { ID: string }
  GeoPosition: { Latitude: number; Longitude: number }
}

interface AccuWeatherDayDetail {
  RelativeHumidity?: { Average: number }
  Wind?: { Speed: { Value: number } }
  IconPhrase?: string
  LongPhrase?: string
  Icon?: number
}

interface AccuWeatherDailyForecast {
  Date: string
  Temperature: {
    Maximum: { Value: number }
    Minimum: { Value: number }
  }
  Day?: AccuWeatherDayDetail
}

interface AccuWeatherForecastResponse {
  DailyForecasts: AccuWeatherDailyForecast[]
}

interface AccuWeatherCurrentCondition {
  Temperature: { Imperial: { Value: number } }
  RealFeelTemperature?: { Imperial?: { Value: number } }
  RelativeHumidity?: number
  Pressure?: { Imperial?: { Value: number } }
  Wind?: {
    Speed?: { Imperial?: { Value: number } }
    Direction?: { Degrees: number }
  }
  Visibility?: { Imperial?: { Value: number } }
  UVIndex?: number
  WeatherText: string
  WeatherIcon: number
}

const BASE_URL = 'https://dataservice.accuweather.com'

@Injectable()
export class AccuWeatherProvider implements WeatherProvider {
  readonly name = 'accuweather'
  readonly priority = 2
  private readonly apiKey: string
  private readonly logger = new Logger(AccuWeatherProvider.name)

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('ACCUWEATHER_API_KEY', '')
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async getWeatherByCity(city: string): Promise<NormalizedWeather> {
    this.logger.log(`Fetching weather by city: ${city}`)
    try {
      const searchResponse = await axios.get(
        `${BASE_URL}/locations/v1/cities/search`,
        {
          params: { apikey: this.apiKey, q: city }
        }
      )

      if (!searchResponse.data.length) {
        throw new Error(`City "${city}" not found on AccuWeather`)
      }

      const location = searchResponse.data[0]
      return this.fetchWeatherByLocationKey(location)
    } catch (error) {
      this.logger.error(
        `Failed to fetch weather for city "${city}": ${error instanceof Error ? error.message : error}`
      )
      throw error
    }
  }

  async getWeatherByCoordinates(
    lat: number,
    lon: number
  ): Promise<NormalizedWeather> {
    this.logger.log(`Fetching weather by coordinates: ${lat}, ${lon}`)
    try {
      const searchResponse = await axios.get(
        `${BASE_URL}/locations/v1/cities/geoposition/search`,
        {
          params: { apikey: this.apiKey, q: `${lat},${lon}` }
        }
      )

      if (!searchResponse.data?.Key) {
        throw new Error(
          `No AccuWeather location found for coordinates ${lat}, ${lon}`
        )
      }

      return this.fetchWeatherByLocationKey(searchResponse.data)
    } catch (error) {
      this.logger.error(
        `Failed to fetch weather for coordinates ${lat}, ${lon}: ${error instanceof Error ? error.message : error}`
      )
      throw error
    }
  }

  private async fetchWeatherByLocationKey(
    location: AccuWeatherLocation
  ): Promise<NormalizedWeather> {
    const locationKey = location.Key

    const [current, forecast] = await Promise.all([
      axios.get(`${BASE_URL}/currentconditions/v1/${locationKey}`, {
        params: { apikey: this.apiKey, details: true }
      }),
      axios.get(`${BASE_URL}/forecasts/v1/daily/5day/${locationKey}`, {
        params: { apikey: this.apiKey, details: true }
      })
    ])

    return this.normalize(location, current.data[0], forecast.data)
  }

  private normalize(
    location: AccuWeatherLocation,
    current: AccuWeatherCurrentCondition,
    forecast: AccuWeatherForecastResponse
  ): NormalizedWeather {
    const forecastDays: ForecastDay[] = forecast.DailyForecasts.slice(0, 5).map(
      (day: AccuWeatherDailyForecast) => ({
        date: new Date(day.Date).toISOString().split('T')[0],
        temperatureHigh: Math.round(day.Temperature.Maximum.Value),
        temperatureLow: Math.round(day.Temperature.Minimum.Value),
        humidity: day.Day?.RelativeHumidity?.Average ?? 0,
        windSpeed: day.Day?.Wind?.Speed?.Value ?? 0,
        condition: {
          main: day.Day?.IconPhrase ?? 'Unknown',
          description: day.Day?.LongPhrase ?? day.Day?.IconPhrase ?? 'Unknown',
          icon: String(day.Day?.Icon ?? 1)
        }
      })
    )

    return {
      provider: this.name,
      location: {
        name: location.LocalizedName,
        country: location.Country?.ID ?? '',
        coordinates: {
          lat: location.GeoPosition.Latitude,
          lon: location.GeoPosition.Longitude
        }
      },
      current: {
        temperature: Math.round(current.Temperature.Imperial.Value),
        feelsLike: Math.round(
          current.RealFeelTemperature?.Imperial?.Value ??
            current.Temperature.Imperial.Value
        ),
        humidity: current.RelativeHumidity ?? 0,
        pressure: current.Pressure?.Imperial?.Value ?? 0,
        windSpeed: current.Wind?.Speed?.Imperial?.Value ?? 0,
        windDirection: current.Wind?.Direction?.Degrees ?? 0,
        visibility: current.Visibility?.Imperial?.Value
          ? current.Visibility.Imperial.Value * 1609.34
          : 10000,
        uvIndex: current.UVIndex ?? null,
        condition: {
          main: current.WeatherText,
          description: current.WeatherText,
          icon: String(current.WeatherIcon)
        }
      },
      forecast: forecastDays,
      hourly: [],
      alerts: []
    }
  }
}
