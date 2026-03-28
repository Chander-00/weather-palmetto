import { describe, it, expect } from 'vitest'
import { WeatherAlertsService } from './weather-alerts.service'
import type { CurrentWeather, HourlyForecast } from '@weather-app/shared'

const baseWeather: CurrentWeather = {
  temperature: 72,
  feelsLike: 70,
  humidity: 50,
  pressure: 1013,
  windSpeed: 5,
  windDirection: 180,
  visibility: 10000,
  uvIndex: null,
  condition: { main: 'Clear', description: 'clear sky', icon: '01d' }
}

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

describe('WeatherAlertsService', () => {
  const service = new WeatherAlertsService()

  it('returns no alerts for mild weather', () => {
    expect(service.generate(baseWeather, [])).toEqual([])
  })

  it('returns heat advisory for 90+', () => {
    const alerts = service.generate({ ...baseWeather, temperature: 95 }, [])
    expect(alerts).toHaveLength(1)
    expect(alerts[0].severity).toBe('warning')
    expect(alerts[0].message).toContain('Heat advisory')
  })

  it('returns extreme heat for 100+', () => {
    const alerts = service.generate({ ...baseWeather, temperature: 105 }, [])
    expect(alerts[0].severity).toBe('danger')
    expect(alerts[0].message).toContain('Extreme heat')
  })

  it('returns freeze warning for 32 and below', () => {
    const alerts = service.generate({ ...baseWeather, temperature: 30 }, [])
    expect(alerts[0].severity).toBe('warning')
    expect(alerts[0].message).toContain('Freeze')
  })

  it('returns extreme cold for 10 and below', () => {
    const alerts = service.generate({ ...baseWeather, temperature: 5 }, [])
    expect(alerts).toHaveLength(1)
    expect(alerts[0].severity).toBe('danger')
    expect(alerts[0].message).toContain('Extreme cold')
  })

  it('returns high wind warning for 40+ mph', () => {
    const alerts = service.generate({ ...baseWeather, windSpeed: 45 }, [])
    expect(alerts[0].severity).toBe('danger')
    expect(alerts[0].message).toContain('High wind')
  })

  it('returns low visibility warning', () => {
    const alerts = service.generate({ ...baseWeather, visibility: 500 }, [])
    expect(alerts[0].message).toContain('visibility')
  })

  it('returns high UV warning', () => {
    const alerts = service.generate({ ...baseWeather, uvIndex: 9 }, [])
    expect(alerts[0].message).toContain('UV')
  })

  it('returns multiple alerts for extreme conditions', () => {
    const alerts = service.generate(
      {
        ...baseWeather,
        temperature: 105,
        windSpeed: 50,
        humidity: 95
      },
      []
    )
    expect(alerts.length).toBeGreaterThanOrEqual(3)
  })

  it('warns about upcoming rain when currently clear', () => {
    const hourly: HourlyForecast[] = [
      {
        time: hoursFromNow(3),
        temperature: 70,
        condition: { main: 'Rain', description: 'light rain', icon: '10d' },
        precipitationChance: 80
      }
    ]
    const alerts = service.generate(baseWeather, hourly)
    const rainAlert = alerts.find((a) => a.message.includes('Rain expected'))
    expect(rainAlert).toBeDefined()
    expect(rainAlert!.severity).toBe('info')
    expect(rainAlert!.message).toContain('3 hours')
  })

  it('does not warn about rain when already raining', () => {
    const rainyWeather = {
      ...baseWeather,
      condition: { main: 'Rain', description: 'rain', icon: '10d' }
    }
    const hourly: HourlyForecast[] = [
      {
        time: hoursFromNow(3),
        temperature: 70,
        condition: { main: 'Rain', description: 'rain', icon: '10d' },
        precipitationChance: 80
      }
    ]
    const alerts = service.generate(rainyWeather, hourly)
    expect(alerts.find((a) => a.message.includes('Rain expected'))).toBeUndefined()
  })

  it('warns about upcoming thunderstorms', () => {
    const hourly: HourlyForecast[] = [
      {
        time: hoursFromNow(2),
        temperature: 75,
        condition: {
          main: 'Thunderstorm',
          description: 'thunderstorm',
          icon: '11d'
        },
        precipitationChance: 90
      }
    ]
    const alerts = service.generate(baseWeather, hourly)
    const stormAlert = alerts.find((a) =>
      a.message.includes('Thunderstorms')
    )
    expect(stormAlert).toBeDefined()
    expect(stormAlert!.severity).toBe('danger')
  })
})
