import { useRef, useCallback } from 'react'
import html2canvas from 'html2canvas'
import type { WeatherData } from '@/types/weather'
import { WeatherIcon } from '@/components/WeatherIcon'

interface ShareCardProps {
  data: WeatherData
  units: 'metric' | 'imperial'
  onClose: () => void
}

export function ShareCard({ data, units, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const tempUnit = units === 'metric' ? 'C' : 'F'

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#0f1023',
      scale: 2
    })
    const link = document.createElement('a')
    link.download = `weather-${data.location.name.toLowerCase()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }, [data.location.name])

  const handleCopy = useCallback(async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#0f1023',
      scale: 2
    })
    canvas.toBlob(async (blob) => {
      if (!blob) return
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
    })
  }, [])

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-primary rounded-2xl p-6 max-w-md w-full">
        <div
          ref={cardRef}
          className="bg-linear-to-br from-bg-card to-bg-secondary rounded-2xl p-8"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <WeatherIcon
              condition={data.current.condition.main}
              size={72}
            />
            <div>
              <div className="flex items-start">
                <span className="text-6xl font-bold leading-none text-text-primary">
                  {data.current.temperature}
                </span>
                <span className="text-xl text-text-secondary mt-1">
                  &deg;{tempUnit}
                </span>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            {data.location.name}, {data.location.country}
          </h2>
          <p className="capitalize text-text-secondary">
            {data.current.condition.description}
          </p>
          <div className="flex gap-6 mt-4 text-sm text-text-secondary">
            <span>Humidity {data.current.humidity}%</span>
            <span>Wind {data.current.windSpeed} {units === 'metric' ? 'km/h' : 'mph'}</span>
          </div>
          <p className="text-xs text-text-secondary/40 mt-4">
            Weather App
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent-hover transition-all"
          >
            Download
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 bg-bg-card text-text-secondary rounded-xl font-medium text-sm hover:bg-bg-card-hover hover:text-text-primary transition-all"
          >
            Copy
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-bg-card text-text-secondary rounded-xl text-sm hover:bg-bg-card-hover hover:text-text-primary transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
