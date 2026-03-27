import type { WeatherData } from '@/types/weather';
import { WeatherIcon } from '@/components/WeatherIcon';

interface CurrentWeatherProps {
  data: WeatherData;
  units: 'metric' | 'imperial';
}

export function CurrentWeather({ data, units }: CurrentWeatherProps) {
  const tempUnit = units === 'metric' ? 'C' : 'F';

  return (
    <div className="bg-gradient-to-br from-bg-card to-bg-secondary rounded-2xl p-8 mb-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-4 mb-4">
        <WeatherIcon
          condition={data.current.condition.main}
          size={96}
          className="drop-shadow-[0_2px_8px_rgba(108,99,255,0.3)]"
        />
        <div className="flex items-start">
          <span className="text-7xl sm:text-8xl font-bold leading-none">{data.current.temperature}</span>
          <span className="text-2xl text-text-secondary mt-2">&deg;{tempUnit}</span>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold">
          {data.location.name}, {data.location.country}
        </h2>
        <p className="capitalize text-text-secondary text-lg">{data.current.condition.description}</p>
        <p className="text-text-secondary text-sm mt-1">
          Feels like {data.current.feelsLike}&deg;{tempUnit}
        </p>
      </div>
    </div>
  );
}
