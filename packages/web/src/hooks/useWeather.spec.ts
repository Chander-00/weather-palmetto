import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWeather } from './useWeather'

vi.mock('@/services/weather-api', () => ({
  fetchWeatherByCity: vi.fn(),
  fetchWeatherByCoordinates: vi.fn()
}))

import { fetchWeatherByCity } from '@/services/weather-api'

const mockImperialData = {
  provider: 'openweather',
  location: {
    name: 'London',
    country: 'GB',
    coordinates: { lat: 51.5, lon: -0.12 }
  },
  current: {
    temperature: 77,
    feelsLike: 75,
    humidity: 60,
    pressure: 1013,
    windSpeed: 10,
    windDirection: 180,
    visibility: 10000,
    uvIndex: null,
    condition: { main: 'Clear', description: 'clear sky', icon: '01d' }
  },
  forecast: [
    {
      date: '2026-03-27',
      temperatureHigh: 82,
      temperatureLow: 68,
      humidity: 55,
      windSpeed: 8,
      condition: { main: 'Clear', description: 'clear sky', icon: '01d' }
    }
  ],
  hourly: [],
  alerts: []
}

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('defaults to metric units', () => {
    const { result } = renderHook(() => useWeather())
    expect(result.current.units).toBe('metric')
  })

  it('starts with no weather data', () => {
    const { result } = renderHook(() => useWeather())
    expect(result.current.weather).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('converts imperial data to metric on the client', async () => {
    ;(fetchWeatherByCity as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockImperialData
    )

    const { result } = renderHook(() => useWeather())

    await act(async () => {
      await result.current.searchByCity('London')
    })

    expect(result.current.weather!.current.temperature).toBe(25)
    expect(result.current.weather!.current.feelsLike).toBe(24)
  })

  it('returns raw imperial data when units set to imperial', async () => {
    ;(fetchWeatherByCity as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockImperialData
    )

    const { result } = renderHook(() => useWeather())

    act(() => {
      result.current.setUnits('imperial')
    })

    await act(async () => {
      await result.current.searchByCity('London')
    })

    expect(result.current.weather!.current.temperature).toBe(77)
  })

  it('toggles units without refetching', async () => {
    ;(fetchWeatherByCity as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockImperialData
    )

    const { result } = renderHook(() => useWeather())

    await act(async () => {
      await result.current.searchByCity('London')
    })

    expect(fetchWeatherByCity).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.setUnits('imperial')
    })

    expect(fetchWeatherByCity).toHaveBeenCalledTimes(1)
    expect(result.current.weather!.current.temperature).toBe(77)
  })

  it('sets error on fetch failure', async () => {
    ;(fetchWeatherByCity as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    )

    const { result } = renderHook(() => useWeather())

    await act(async () => {
      await result.current.searchByCity('London')
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.weather).toBeNull()
  })
})
