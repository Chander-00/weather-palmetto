import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WeatherService } from './weather.service'
import { OpenWeatherProvider } from './providers/openweather.provider'
import { AccuWeatherProvider } from './providers/accuweather.provider'
import { WeatherGovProvider } from './providers/weathergov.provider'
import { NormalizedWeather } from './interfaces/weather-provider.interface'

const mockWeatherData: NormalizedWeather = {
  provider: 'openweather',
  location: {
    name: 'London',
    country: 'GB',
    coordinates: { lat: 51.5, lon: -0.12 }
  },
  current: {
    temperature: 59,
    feelsLike: 57,
    humidity: 72,
    pressure: 1013,
    windSpeed: 5,
    windDirection: 220,
    visibility: 10000,
    uvIndex: null,
    condition: { main: 'Clouds', description: 'overcast clouds', icon: '04d' }
  },
  forecast: [],
  hourly: [],
  alerts: []
}

describe('WeatherService', () => {
  let service: WeatherService
  let openWeather: Partial<OpenWeatherProvider>
  let accuWeather: Partial<AccuWeatherProvider>
  let weatherGov: Partial<WeatherGovProvider>
  let mockAlertsService: { generate: ReturnType<typeof vi.fn> }
  let mockCache: {
    get: ReturnType<typeof vi.fn>
    set: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    openWeather = {
      name: 'openweather',
      priority: 1,
      isAvailable: vi.fn().mockReturnValue(true),
      getWeatherByCity: vi.fn().mockResolvedValue(mockWeatherData),
      getWeatherByCoordinates: vi.fn().mockResolvedValue(mockWeatherData)
    }

    accuWeather = {
      name: 'accuweather',
      priority: 2,
      isAvailable: vi.fn().mockReturnValue(true),
      getWeatherByCity: vi
        .fn()
        .mockResolvedValue({ ...mockWeatherData, provider: 'accuweather' }),
      getWeatherByCoordinates: vi
        .fn()
        .mockResolvedValue({ ...mockWeatherData, provider: 'accuweather' })
    }

    weatherGov = {
      name: 'weathergov',
      priority: 3,
      isAvailable: vi.fn().mockReturnValue(true),
      getWeatherByCity: vi
        .fn()
        .mockResolvedValue({ ...mockWeatherData, provider: 'weathergov' }),
      getWeatherByCoordinates: vi
        .fn()
        .mockResolvedValue({ ...mockWeatherData, provider: 'weathergov' })
    }

    mockAlertsService = {
      generate: vi.fn().mockReturnValue([])
    }

    mockCache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined)
    }

    service = new WeatherService(
      openWeather as any,
      accuWeather as any,
      weatherGov as any,
      mockAlertsService as any,
      mockCache as any
    )
  })

  it('should return data from the primary provider', async () => {
    const result = await service.getWeatherByCity('London')
    expect(result.provider).toBe('openweather')
    expect(openWeather.getWeatherByCity).toHaveBeenCalledWith('London')
  })

  it('should fallback to second provider when primary fails', async () => {
    ;(
      openWeather.getWeatherByCity as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('API down'))
    const result = await service.getWeatherByCity('London')
    expect(result.provider).toBe('accuweather')
  })

  it('should fallback to third provider when first two fail', async () => {
    ;(
      openWeather.getWeatherByCity as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('fail'))
    ;(
      accuWeather.getWeatherByCity as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('fail'))
    const result = await service.getWeatherByCity('London')
    expect(result.provider).toBe('weathergov')
  })

  it('should throw when all providers fail', async () => {
    ;(
      openWeather.getWeatherByCity as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('fail'))
    ;(
      accuWeather.getWeatherByCity as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('fail'))
    ;(
      weatherGov.getWeatherByCity as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('fail'))
    await expect(service.getWeatherByCity('London')).rejects.toThrow(
      'All weather providers failed'
    )
  })

  it('should return cached data when available', async () => {
    mockCache.get.mockResolvedValue(mockWeatherData)
    const result = await service.getWeatherByCity('London')
    expect(result).toEqual(mockWeatherData)
    expect(openWeather.getWeatherByCity).not.toHaveBeenCalled()
  })

  it('should convert to metric when requested', async () => {
    const result = await service.getWeatherByCity('London', 'metric')
    expect(result.current.temperature).toBe(15)
  })

  it('should skip unavailable providers', async () => {
    ;(openWeather.isAvailable as ReturnType<typeof vi.fn>).mockReturnValue(
      false
    )
    const result = await service.getWeatherByCity('London')
    expect(result.provider).toBe('accuweather')
    expect(openWeather.getWeatherByCity).not.toHaveBeenCalled()
  })

  it('should work with coordinates', async () => {
    const result = await service.getWeatherByCoordinates(51.5, -0.12)
    expect(result.provider).toBe('openweather')
    expect(openWeather.getWeatherByCoordinates).toHaveBeenCalledWith(
      51.5,
      -0.12
    )
  })
})
