import axios from 'axios'
import type { WeatherData } from '@/types/weather'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000
})

export async function fetchWeatherByCity(city: string): Promise<WeatherData> {
  const { data } = await api.get<WeatherData>('/weather', {
    params: { city }
  })
  return data
}

export async function fetchWeatherByCoordinates(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const { data } = await api.get<WeatherData>('/weather', {
    params: { lat, lon }
  })
  return data
}
