import type { CurrentWeather as CurrentWeatherType } from '@/types/weather';

interface WeatherDetailsProps {
  current: CurrentWeatherType;
  units: 'metric' | 'imperial';
}

function getWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
}

export function WeatherDetails({ current, units }: WeatherDetailsProps) {
  const speedUnit = units === 'metric' ? 'km/h' : 'mph';
  const visibilityKm = (current.visibility / 1000).toFixed(1);

  const details = [
    { label: 'Humidity', value: `${current.humidity}%`, icon: '\u{1F4A7}' },
    { label: 'Wind', value: `${current.windSpeed} ${speedUnit} ${getWindDirection(current.windDirection)}`, icon: '\u{1F4A8}' },
    { label: 'Pressure', value: `${current.pressure} hPa`, icon: '\u{1F4CA}' },
    { label: 'Visibility', value: `${visibilityKm} km`, icon: '\u{1F441}' },
    { label: 'UV Index', value: current.uvIndex !== null ? String(current.uvIndex) : 'N/A', icon: '\u{2600}\u{FE0F}' },
    { label: 'Feels Like', value: `${current.feelsLike}\u{00B0}`, icon: '\u{1F321}\u{FE0F}' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
      {details.map((detail) => (
        <div
          key={detail.label}
          className="bg-bg-card rounded-xl p-5 flex flex-col items-center gap-1.5 transition-all duration-200 hover:bg-bg-card-hover hover:-translate-y-0.5"
        >
          <span className="text-2xl">{detail.icon}</span>
          <span className="text-xs text-text-secondary uppercase tracking-wide">{detail.label}</span>
          <span className="text-lg font-semibold">{detail.value}</span>
        </div>
      ))}
    </div>
  );
}
