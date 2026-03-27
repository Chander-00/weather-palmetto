import { getWeatherIcon } from '@/services/weather-icons'

interface WeatherIconProps {
  condition: string
  size?: number
  className?: string
}

export function WeatherIcon({
  condition,
  size = 64,
  className = ''
}: WeatherIconProps) {
  const svg = getWeatherIcon(condition)

  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
