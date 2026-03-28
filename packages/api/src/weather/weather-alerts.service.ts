import { Injectable } from '@nestjs/common'
import type {
  WeatherAlert,
  CurrentWeather,
  HourlyForecast
} from '@weather-app/shared'

@Injectable()
export class WeatherAlertsService {
  generate(current: CurrentWeather, hourly: HourlyForecast[]): WeatherAlert[] {
    const alerts: WeatherAlert[] = []

    this.checkTemperature(current, alerts)
    this.checkWind(current, alerts)
    this.checkVisibility(current, alerts)
    this.checkHumidity(current, alerts)
    this.checkUV(current, alerts)
    this.checkUpcomingConditions(current, hourly, alerts)

    return alerts
  }

  private checkTemperature(
    current: CurrentWeather,
    alerts: WeatherAlert[]
  ): void {
    if (current.temperature >= 100) {
      alerts.push({
        severity: 'danger',
        message: 'Extreme heat — stay indoors and drink plenty of water'
      })
    } else if (current.temperature >= 90) {
      alerts.push({
        severity: 'warning',
        message:
          'Heat advisory — stay hydrated and avoid prolonged sun exposure'
      })
    }

    if (current.temperature <= 10) {
      alerts.push({
        severity: 'danger',
        message: 'Extreme cold — risk of frostbite, limit time outdoors'
      })
    } else if (current.temperature <= 32) {
      alerts.push({
        severity: 'warning',
        message: 'Freeze warning — watch for icy roads and pipes'
      })
    }
  }

  private checkWind(current: CurrentWeather, alerts: WeatherAlert[]): void {
    if (current.windSpeed >= 40) {
      alerts.push({
        severity: 'danger',
        message: 'High wind warning — secure loose objects, avoid driving'
      })
    } else if (current.windSpeed >= 25) {
      alerts.push({
        severity: 'warning',
        message: 'Wind advisory — gusts may affect travel'
      })
    }
  }

  private checkVisibility(
    current: CurrentWeather,
    alerts: WeatherAlert[]
  ): void {
    if (current.visibility < 1000) {
      alerts.push({
        severity: 'warning',
        message: 'Low visibility — use caution while driving'
      })
    }
  }

  private checkHumidity(
    current: CurrentWeather,
    alerts: WeatherAlert[]
  ): void {
    if (current.humidity >= 90) {
      alerts.push({
        severity: 'info',
        message: 'Very high humidity — may feel hotter than actual temperature'
      })
    }
  }

  private checkUV(current: CurrentWeather, alerts: WeatherAlert[]): void {
    if (current.uvIndex !== null && current.uvIndex >= 8) {
      alerts.push({
        severity: 'warning',
        message: 'High UV index — wear sunscreen and protective clothing'
      })
    }
  }

  private checkUpcomingConditions(
    current: CurrentWeather,
    hourly: HourlyForecast[],
    alerts: WeatherAlert[]
  ): void {
    if (!hourly.length) return

    const currentCondition = current.condition.main.toLowerCase()
    const isCurrentlyRaining =
      currentCondition.includes('rain') ||
      currentCondition.includes('drizzle') ||
      currentCondition.includes('shower')
    const isCurrentlySnowing =
      currentCondition.includes('snow') ||
      currentCondition.includes('sleet')

    for (let i = 0; i < hourly.length; i++) {
      const entry = hourly[i]
      const hoursAhead = this.hoursUntil(entry.time)
      if (hoursAhead <= 0) continue

      const condition = entry.condition.main.toLowerCase()
      const hasRain =
        condition.includes('rain') ||
        condition.includes('drizzle') ||
        condition.includes('shower') ||
        entry.precipitationChance >= 60

      if (hasRain && !isCurrentlyRaining) {
        const label = hoursAhead === 1 ? '1 hour' : `${hoursAhead} hours`
        alerts.push({
          severity: 'info',
          message: `Rain expected within ${label} — consider bringing an umbrella`
        })
        break
      }
    }

    for (let i = 0; i < hourly.length; i++) {
      const entry = hourly[i]
      const hoursAhead = this.hoursUntil(entry.time)
      if (hoursAhead <= 0) continue

      const condition = entry.condition.main.toLowerCase()
      const hasSnow =
        condition.includes('snow') ||
        condition.includes('sleet') ||
        condition.includes('blizzard')

      if (hasSnow && !isCurrentlySnowing) {
        const label = hoursAhead === 1 ? '1 hour' : `${hoursAhead} hours`
        alerts.push({
          severity: 'warning',
          message: `Snow expected within ${label} — plan accordingly`
        })
        break
      }
    }

    for (let i = 0; i < hourly.length; i++) {
      const entry = hourly[i]
      const hoursAhead = this.hoursUntil(entry.time)
      if (hoursAhead <= 0) continue

      const condition = entry.condition.main.toLowerCase()
      if (
        condition.includes('thunder') ||
        condition.includes('storm')
      ) {
        const label = hoursAhead === 1 ? '1 hour' : `${hoursAhead} hours`
        alerts.push({
          severity: 'danger',
          message: `Thunderstorms expected within ${label} — seek shelter if outdoors`
        })
        break
      }
    }
  }

  private hoursUntil(isoTime: string): number {
    const target = new Date(isoTime).getTime()
    const now = Date.now()
    return Math.round((target - now) / (1000 * 60 * 60))
  }
}
