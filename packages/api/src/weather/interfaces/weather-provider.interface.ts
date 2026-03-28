import type { WeatherData } from '@weather-app/shared'

export type {
  WeatherData as NormalizedWeather,
  ForecastDay,
  WeatherCondition,
  Coordinates,
  CurrentWeather
} from '@weather-app/shared'

export interface WeatherProvider {
  readonly name: string
  readonly priority: number
  getWeatherByCity(city: string): Promise<WeatherData>
  getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData>
  isAvailable(): boolean
}
