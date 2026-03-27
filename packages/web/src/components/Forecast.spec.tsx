import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Forecast } from './Forecast'
import type { ForecastDay } from '@/types/weather'

const mockForecast: ForecastDay[] = [
  {
    date: new Date().toISOString().split('T')[0],
    temperatureHigh: 65,
    temperatureLow: 50,
    humidity: 60,
    windSpeed: 5,
    condition: { main: 'Clear', description: 'clear sky', icon: '01d' }
  }
]

describe('Forecast', () => {
  it('renders forecast title', () => {
    render(<Forecast forecast={mockForecast} units="imperial" />)
    expect(screen.getByText('5-Day Forecast')).toBeInTheDocument()
  })

  it('displays today label for current date', () => {
    render(<Forecast forecast={mockForecast} units="imperial" />)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('renders nothing when forecast is empty', () => {
    const { container } = render(<Forecast forecast={[]} units="imperial" />)
    expect(container.innerHTML).toBe('')
  })
})
