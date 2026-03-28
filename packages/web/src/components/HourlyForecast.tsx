import type { HourlyForecast as HourlyForecastType } from '@/types/weather'
import { WeatherIcon } from '@/components/WeatherIcon'

interface HourlyForecastProps {
  hourly: HourlyForecastType[]
  units: 'metric' | 'imperial'
}

function formatTime(isoTime: string): string {
  const date = new Date(isoTime)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true
  })
}

export function HourlyForecast({ hourly, units }: HourlyForecastProps) {
  const tempUnit = units === 'metric' ? 'C' : 'F'

  if (!hourly.length) return null

  return (
    <div className="bg-bg-secondary rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-text-secondary mb-4">
        Next Hours
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {hourly.map((entry, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex flex-col items-center gap-2 py-4 px-4 bg-bg-card rounded-xl min-w-[5rem] transition-all duration-200 hover:bg-bg-card-hover hover:-translate-y-0.5"
          >
            <span className="text-xs font-semibold text-text-secondary">
              {formatTime(entry.time)}
            </span>
            <WeatherIcon condition={entry.condition.main} size={36} />
            <span className="text-sm font-semibold">
              {entry.temperature}&deg;{tempUnit}
            </span>
            {entry.precipitationChance > 0 && (
              <span className="text-xs text-blue-400">
                {entry.precipitationChance}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
