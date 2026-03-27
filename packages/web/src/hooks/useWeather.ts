import { useState, useCallback, useMemo } from 'react'
import type { WeatherData } from '@/types/weather'
import {
  fetchWeatherByCity,
  fetchWeatherByCoordinates
} from '@/services/weather-api'

interface UseWeatherReturn {
  weather: WeatherData | null
  loading: boolean
  error: string | null
  searchByCity: (city: string) => Promise<void>
  searchByLocation: () => Promise<void>
  units: 'metric' | 'imperial'
  setUnits: (units: 'metric' | 'imperial') => void
}

function toMetric(data: WeatherData): WeatherData {
  const toC = (f: number) => Math.round(((f - 32) * 5) / 9)
  const toKmh = (mph: number) => Math.round(mph * 1.60934)

  return {
    ...data,
    current: {
      ...data.current,
      temperature: toC(data.current.temperature),
      feelsLike: toC(data.current.feelsLike),
      windSpeed: toKmh(data.current.windSpeed)
    },
    forecast: data.forecast.map((day) => ({
      ...day,
      temperatureHigh: toC(day.temperatureHigh),
      temperatureLow: toC(day.temperatureLow),
      windSpeed: toKmh(day.windSpeed)
    }))
  }
}

export function useWeather(): UseWeatherReturn {
  const [rawWeather, setRawWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric')

  const weather = useMemo(() => {
    if (!rawWeather) return null
    return units === 'metric' ? toMetric(rawWeather) : rawWeather
  }, [rawWeather, units])

  const searchByCity = useCallback(async (city: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeatherByCity(city)
      setRawWeather(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch weather data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const searchByLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000
          })
        }
      )

      const { latitude, longitude } = position.coords
      const data = await fetchWeatherByCoordinates(latitude, longitude)
      setRawWeather(data)
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        setError('Location access denied. Please search by city name instead.')
      } else {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch weather data'
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    weather,
    loading,
    error,
    searchByCity,
    searchByLocation,
    units,
    setUnits
  }
}
