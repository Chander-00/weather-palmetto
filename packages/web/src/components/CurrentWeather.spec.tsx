import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CurrentWeather } from './CurrentWeather'
import type { WeatherData } from '@/types/weather'

const mockData: WeatherData = {
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

describe('CurrentWeather', () => {
  it('displays location name', () => {
    render(<CurrentWeather data={mockData} units="imperial" />)
    expect(screen.getByText('London, GB')).toBeInTheDocument()
  })

  it('displays temperature with correct unit', () => {
    render(<CurrentWeather data={mockData} units="imperial" />)
    expect(screen.getByText('59')).toBeInTheDocument()
  })

  it('displays weather description', () => {
    render(<CurrentWeather data={mockData} units="imperial" />)
    expect(screen.getByText('overcast clouds')).toBeInTheDocument()
  })
})
