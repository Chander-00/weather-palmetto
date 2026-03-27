import type { ForecastDay } from '@/types/weather'
import { WeatherIcon } from '@/components/WeatherIcon'

interface ForecastProps {
  forecast: ForecastDay[]
  units: 'metric' | 'imperial'
}

function formatDay(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  const diffDays = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export function Forecast({ forecast, units }: ForecastProps) {
  const tempUnit = units === 'metric' ? 'C' : 'F'

  if (!forecast.length) return null

  return (
    <div className="bg-bg-secondary rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-text-secondary mb-4">
        5-Day Forecast
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {forecast.map((day) => (
          <div
            key={day.date}
            className="flex flex-col items-center gap-2 py-4 px-2 bg-bg-card rounded-xl transition-all duration-200 hover:bg-bg-card-hover hover:-translate-y-0.5"
          >
            <span className="text-sm font-semibold">{formatDay(day.date)}</span>
            <WeatherIcon condition={day.condition.main} size={48} />
            <span className="text-xs text-text-secondary text-center">
              {day.condition.main}
            </span>
            <div className="flex gap-2 text-sm">
              <span className="font-semibold">
                {day.temperatureHigh}&deg;{tempUnit}
              </span>
              <span className="text-text-secondary">
                {day.temperatureLow}&deg;{tempUnit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
