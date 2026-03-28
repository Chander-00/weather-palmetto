import type { WeatherAlert } from '@/types/weather'

interface WeatherAlertsProps {
  alerts: WeatherAlert[]
}

const severityStyles = {
  info: 'bg-blue-900/40 border-blue-500/50 text-blue-200',
  warning: 'bg-yellow-900/40 border-yellow-500/50 text-yellow-200',
  danger: 'bg-red-900/40 border-red-500/50 text-red-200'
}

const severityIcons = {
  info: '\u{2139}\u{FE0F}',
  warning: '\u{26A0}\u{FE0F}',
  danger: '\u{1F6A8}'
}

export function WeatherAlerts({ alerts }: WeatherAlertsProps) {
  if (!alerts.length) return null

  return (
    <div className="flex flex-col gap-2 mb-6">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${severityStyles[alert.severity]}`}
        >
          <span className="text-lg">{severityIcons[alert.severity]}</span>
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
      ))}
    </div>
  )
}
