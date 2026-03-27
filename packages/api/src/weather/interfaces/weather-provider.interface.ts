export interface Coordinates {
  lat: number
  lon: number
}

export interface WeatherCondition {
  main: string
  description: string
  icon: string
}

export interface NormalizedWeather {
  provider: string
  location: {
    name: string
    country: string
    coordinates: Coordinates
  }
  current: {
    temperature: number
    feelsLike: number
    humidity: number
    pressure: number
    windSpeed: number
    windDirection: number
    visibility: number
    uvIndex: number | null
    condition: WeatherCondition
  }
  forecast: ForecastDay[]
}

export interface ForecastDay {
  date: string
  temperatureHigh: number
  temperatureLow: number
  humidity: number
  windSpeed: number
  condition: WeatherCondition
}

export interface WeatherProvider {
  readonly name: string
  readonly priority: number
  getWeatherByCity(city: string): Promise<NormalizedWeather>
  getWeatherByCoordinates(lat: number, lon: number): Promise<NormalizedWeather>
  isAvailable(): boolean
}
