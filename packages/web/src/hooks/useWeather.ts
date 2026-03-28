import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { WeatherData } from '@/types/weather'
import axios from 'axios'
import {
  fetchWeatherByCity,
  fetchWeatherByCoordinates
} from '@/services/weather-api'

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000

interface UseWeatherReturn {
  weather: WeatherData | null
  compareWeather: WeatherData | null
  loading: boolean
  compareLoading: boolean
  error: string | null
  compareError: string | null
  lastUpdated: Date | null
  searchByCity: (city: string) => Promise<void>
  searchByLocation: () => Promise<void>
  searchCompareCity: (city: string) => Promise<void>
  clearCompare: () => void
  units: 'metric' | 'imperial'
  setUnits: (units: 'metric' | 'imperial') => void
}

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message
  }
  if (err instanceof Error) return err.message
  return 'Failed to fetch weather data'
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
    })),
    hourly: data.hourly.map((hour) => ({
      ...hour,
      temperature: toC(hour.temperature)
    }))
  }
}

export function useWeather(): UseWeatherReturn {
  const [rawWeather, setRawWeather] = useState<WeatherData | null>(null)
  const [rawCompareWeather, setRawCompareWeather] =
    useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [compareLoading, setCompareLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compareError, setCompareError] = useState<string | null>(null)
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const lastCityRef = useRef<string | null>(null)

  const weather = useMemo(() => {
    if (!rawWeather) return null
    return units === 'metric' ? toMetric(rawWeather) : rawWeather
  }, [rawWeather, units])

  const compareWeather = useMemo(() => {
    if (!rawCompareWeather) return null
    return units === 'metric' ? toMetric(rawCompareWeather) : rawCompareWeather
  }, [rawCompareWeather, units])

  const searchByCity = useCallback(async (city: string) => {
    setLoading(true)
    setError(null)
    lastCityRef.current = city
    try {
      const data = await fetchWeatherByCity(city)
      setRawWeather(data)
      setLastUpdated(new Date())
    } catch (err) {
      setRawWeather(null)
      setError(extractErrorMessage(err))
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
      setLastUpdated(new Date())
      lastCityRef.current = data.location.name
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        setError('Location access denied. Please search by city name instead.')
      } else {
        setRawWeather(null)
        setError(extractErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const searchCompareCity = useCallback(async (city: string) => {
    setCompareLoading(true)
    setCompareError(null)
    try {
      const data = await fetchWeatherByCity(city)
      setRawCompareWeather(data)
    } catch (err) {
      setRawCompareWeather(null)
      setCompareError(extractErrorMessage(err))
    } finally {
      setCompareLoading(false)
    }
  }, [])

  const clearCompare = useCallback(() => {
    setRawCompareWeather(null)
    setCompareError(null)
  }, [])

  useEffect(() => {
    if (!lastCityRef.current) return

    const interval = setInterval(() => {
      const city = lastCityRef.current
      if (city) {
        fetchWeatherByCity(city)
          .then((data) => {
            setRawWeather(data)
            setLastUpdated(new Date())
          })
          .catch(() => {})
      }
    }, AUTO_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [rawWeather])

  return {
    weather,
    compareWeather,
    loading,
    compareLoading,
    error,
    compareError,
    lastUpdated,
    searchByCity,
    searchByLocation,
    searchCompareCity,
    clearCompare,
    units,
    setUnits
  }
}
