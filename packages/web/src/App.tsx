import { SearchBar } from '@/components/SearchBar';
import { CurrentWeather } from '@/components/CurrentWeather';
import { WeatherDetails } from '@/components/WeatherDetails';
import { Forecast } from '@/components/Forecast';
import { UnitToggle } from '@/components/UnitToggle';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useWeather } from '@/hooks/useWeather';

export function App() {
  const { weather, loading, error, searchByCity, searchByLocation, units, setUnits } = useWeather();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-br from-accent to-purple-400 bg-clip-text text-transparent">
          Weather App
        </h1>
        <UnitToggle units={units} onToggle={setUnits} />
      </header>

      <SearchBar onSearch={searchByCity} onLocationSearch={searchByLocation} loading={loading} />

      {loading && (
        <div className="flex flex-col items-center gap-4 py-12 text-text-secondary">
          <div className="w-10 h-10 border-3 border-bg-card border-t-accent rounded-full animate-spin" />
          <p>Fetching weather data...</p>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={() => searchByLocation()} />}

      {weather && !loading && (
        <main>
          <CurrentWeather data={weather} units={units} />
          <WeatherDetails current={weather.current} units={units} />
          <Forecast forecast={weather.forecast} units={units} />
          <p className="text-center text-xs text-text-secondary opacity-60 py-2">
            Data from {weather.provider}
          </p>
        </main>
      )}

      {!weather && !loading && !error && (
        <div className="flex flex-col items-center gap-6 py-16 text-text-secondary">
          <svg className="opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
            <path d="M2 15.2c0-2.4 1.3-4.5 3.3-5.6a6.5 6.5 0 0 1 12.5-1.8A5 5 0 0 1 20 13a5 5 0 0 1-2 9.5H5a5 5 0 0 1-3-9.3Z" />
          </svg>
          <p>Search for a city to get started</p>
        </div>
      )}
    </div>
  );
}
