import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import {
  WeatherProvider,
  NormalizedWeather,
  ForecastDay,
  HourlyForecast
} from '../interfaces/weather-provider.interface'

interface OpenWeatherCondition {
  main: string
  description: string
  icon: string
}

interface OpenWeatherForecastEntry {
  dt_txt: string
  main: { temp: number; humidity: number }
  wind: { speed: number }
  weather: OpenWeatherCondition[]
  pop: number
}

interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastEntry[]
}

interface OpenWeatherCurrentResponse {
  name: string
  coord: { lat: number; lon: number }
  sys: { country: string }
  main: { temp: number; feels_like: number; humidity: number; pressure: number }
  wind: { speed: number; deg: number }
  visibility: number
  weather: OpenWeatherCondition[]
}

const BASE_URL = 'https://api.openweathermap.org/data/2.5'

@Injectable()
export class OpenWeatherProvider implements WeatherProvider {
  readonly name = 'openweather'
  readonly priority = 1
  private readonly apiKey: string
  private readonly logger = new Logger(OpenWeatherProvider.name)

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('OPENWEATHER_API_KEY', '')
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async getWeatherByCity(city: string): Promise<NormalizedWeather> {
    this.logger.log(`Fetching weather by city: ${city}`)
    try {
      const [current, forecast] = await Promise.all([
        axios.get(`${BASE_URL}/weather`, {
          params: { q: city, appid: this.apiKey, units: 'imperial' }
        }),
        axios.get(`${BASE_URL}/forecast`, {
          params: { q: city, appid: this.apiKey, units: 'imperial' }
        })
      ])

      return this.normalize(current.data, forecast.data)
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
      const [current, forecast] = await Promise.all([
        axios.get(`${BASE_URL}/weather`, {
          params: { lat, lon, appid: this.apiKey, units: 'imperial' }
        }),
        axios.get(`${BASE_URL}/forecast`, {
          params: { lat, lon, appid: this.apiKey, units: 'imperial' }
        })
      ])

      return this.normalize(current.data, forecast.data)
    } catch (error) {
      this.logger.error(
        `Failed to fetch weather for coordinates ${lat}, ${lon}: ${error instanceof Error ? error.message : error}`
      )
      throw error
    }
  }

  private normalize(
    current: OpenWeatherCurrentResponse,
    forecast: OpenWeatherForecastResponse
  ): NormalizedWeather {
    const dailyMap = new Map<string, OpenWeatherForecastEntry[]>()

    for (const entry of forecast.list) {
      const date = entry.dt_txt.split(' ')[0]
      if (!dailyMap.has(date)) dailyMap.set(date, [])
      dailyMap.get(date)!.push(entry)
    }

    const forecastDays: ForecastDay[] = Array.from(dailyMap.entries())
      .slice(0, 5)
      .map(([date, entries]) => {
        const temps = entries.map((e) => e.main.temp)
        const midday =
          entries.find((e) => e.dt_txt.includes('12:00')) || entries[0]

        return {
          date,
          temperatureHigh: Math.round(Math.max(...temps)),
          temperatureLow: Math.round(Math.min(...temps)),
          humidity: midday.main.humidity,
          windSpeed: midday.wind.speed,
          condition: {
            main: midday.weather[0].main,
            description: midday.weather[0].description,
            icon: midday.weather[0].icon
          }
        }
      })

    const hourly: HourlyForecast[] = forecast.list
      .slice(0, 8)
      .map((entry: OpenWeatherForecastEntry) => ({
        time: entry.dt_txt,
        temperature: Math.round(entry.main.temp),
        condition: {
          main: entry.weather[0].main,
          description: entry.weather[0].description,
          icon: entry.weather[0].icon
        },
        precipitationChance: Math.round((entry.pop || 0) * 100)
      }))

    return {
      provider: this.name,
      location: {
        name: current.name,
        country: current.sys.country,
        coordinates: { lat: current.coord.lat, lon: current.coord.lon }
      },
      current: {
        temperature: Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        windSpeed: current.wind.speed,
        windDirection: current.wind.deg,
        visibility: current.visibility,
        uvIndex: null,
        condition: {
          main: current.weather[0].main,
          description: current.weather[0].description,
          icon: current.weather[0].icon
        }
      },
      forecast: forecastDays,
      hourly,
      alerts: []
    }
  }
}
