import { useState, useCallback, useRef } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { CurrentWeather } from '@/components/CurrentWeather'
import { WeatherDetails } from '@/components/WeatherDetails'
import { HourlyForecast } from '@/components/HourlyForecast'
import { Forecast } from '@/components/Forecast'
import { UnitToggle } from '@/components/UnitToggle'
import { ErrorMessage } from '@/components/ErrorMessage'
import { WeatherAlerts } from '@/components/WeatherAlerts'
import { WeatherMap } from '@/components/WeatherMap'
import { ShareCard } from '@/components/ShareCard'
import { useWeather } from '@/hooks/useWeather'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { useFavorites } from '@/hooks/useFavorites'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export function App() {
  const {
    weather,
    compareWeather,
    loading,
    compareLoading,
    error,
    compareError,
    lastUpdated,
    searchByCity,
    searchByLocation,
    searchCompareCity,
    clearCompare,
    units,
    setUnits
  } = useWeather()

  const { history, addEntry, clearHistory } = useSearchHistory()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const [isComparing, setIsComparing] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = useCallback(
    (city: string) => {
      searchByCity(city)
      addEntry(city)
    },
    [searchByCity, addEntry]
  )

  const handleCompareSearch = useCallback(
    (city: string) => {
      searchCompareCity(city)
      addEntry(city)
    },
    [searchCompareCity, addEntry]
  )

  const handleCloseCompare = useCallback(() => {
    setIsComparing(false)
    clearCompare()
  }, [clearCompare])

  useKeyboardShortcuts({
    onFocusSearch: () => searchInputRef.current?.focus(),
    onClear: () => searchInputRef.current?.blur()
  })

  const isCompareMode = isComparing || !!compareWeather

  return (
    <div
      className={`mx-auto px-4 sm:px-6 py-8 ${isCompareMode ? 'max-w-6xl' : 'max-w-3xl'} transition-all duration-300`}
    >
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-linear-to-br from-accent to-purple-400 bg-clip-text text-transparent">
          Weather App
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          {weather && !isCompareMode && (
            <>
              <button
                onClick={() => setShowShareCard(true)}
                className="py-2 px-3 sm:px-4 bg-bg-card text-text-secondary text-sm rounded-lg hover:bg-bg-card-hover hover:text-text-primary transition-all duration-200"
                title="Share weather"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="16"
                  height="16"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
              <button
                onClick={() => setIsComparing(true)}
                className="py-2 px-3 sm:px-4 bg-bg-card text-text-secondary text-sm rounded-lg hover:bg-bg-card-hover hover:text-text-primary transition-all duration-200"
              >
                Compare
              </button>
            </>
          )}
          <UnitToggle units={units} onToggle={setUnits} />
        </div>
      </header>

      <SearchBar
        ref={searchInputRef}
        onSearch={handleSearch}
        onLocationSearch={searchByLocation}
        loading={loading}
      />

      {isCompareMode && (
        <div className="flex gap-2 sm:gap-3 mb-8 items-start">
          <div className="flex-1 min-w-0">
            <SearchBar
              onSearch={handleCompareSearch}
              onLocationSearch={() => {}}
              loading={compareLoading}
            />
          </div>
          <button
            onClick={handleCloseCompare}
            className="mt-2.5 p-2.5 bg-bg-secondary text-text-secondary hover:text-error hover:bg-bg-card rounded-xl transition-all shrink-0"
            title="Close comparison"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="18"
              height="18"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {(history.length > 0 || favorites.length > 0) && (
        <div className="flex flex-wrap gap-2 -mt-4 mb-6">
          {favorites.map((city) => (
            <button
              key={`fav-${city}`}
              onClick={() => handleSearch(city)}
              className="px-3 py-1.5 bg-accent/15 text-accent text-sm rounded-full hover:bg-accent/25 transition-all duration-200 border border-accent/30"
            >
              {city}
            </button>
          ))}
          {history
            .filter(
              (city) =>
                !favorites.some(
                  (f) => f.toLowerCase() === city.toLowerCase()
                )
            )
            .map((city) => (
              <button
                key={`hist-${city}`}
                onClick={() => handleSearch(city)}
                className="px-3 py-1.5 bg-bg-card text-text-secondary text-sm rounded-full hover:bg-accent/20 hover:text-accent transition-all duration-200 border border-transparent hover:border-accent/30"
              >
                {city}
              </button>
            ))}
          <button
            onClick={clearHistory}
            className="px-3 py-1.5 text-text-secondary/50 text-xs rounded-full hover:text-error transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-4 py-12 text-text-secondary">
          <div className="w-10 h-10 border-3 border-bg-card border-t-accent rounded-full animate-spin" />
          <p>Fetching weather data...</p>
        </div>
      )}

      {error && (
        <ErrorMessage message={error} onRetry={() => searchByLocation()} />
      )}

      {weather && !loading && (
        <main>
          <div
            className={
              isCompareMode
                ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                : ''
            }
          >
            <div>
              <WeatherAlerts alerts={weather.alerts} />
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() =>
                    toggleFavorite(weather.location.name)
                  }
                  className={`text-sm px-3 py-1 rounded-lg transition-all ${
                    isFavorite(weather.location.name)
                      ? 'bg-accent/20 text-accent'
                      : 'bg-bg-card text-text-secondary hover:text-accent'
                  }`}
                >
                  {isFavorite(weather.location.name)
                    ? 'Favorited'
                    : 'Add to favorites'}
                </button>
              </div>
              <CurrentWeather data={weather} units={units} />
              <WeatherDetails current={weather.current} units={units} />
            </div>

            {compareWeather && (
              <div>
                <WeatherAlerts alerts={compareWeather.alerts} />
                <div className="mb-2 h-8" />
                <CurrentWeather data={compareWeather} units={units} />
                <WeatherDetails
                  current={compareWeather.current}
                  units={units}
                />
              </div>
            )}

            {compareError && (
              <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-error/30 min-h-[200px]">
                <p className="text-error text-sm">{compareError}</p>
              </div>
            )}

            {isComparing &&
              !compareWeather &&
              !compareLoading &&
              !compareError && (
                <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-bg-card-hover min-h-[200px]">
                  <p className="text-text-secondary">
                    Search a city to compare
                  </p>
                </div>
              )}

            {compareLoading && (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="w-8 h-8 border-3 border-bg-card border-t-accent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <HourlyForecast hourly={weather.hourly} units={units} />
          <Forecast forecast={weather.forecast} units={units} />
          <WeatherMap data={weather} compareData={compareWeather} units={units} />

          <div className="text-center text-xs text-text-secondary opacity-60 py-2">
            <p>Data from {weather.provider}</p>
            {lastUpdated && (
              <p>
                Last updated{' '}
                {lastUpdated.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
                {' \u00B7 auto-refreshes every 5 min'}
              </p>
            )}
          </div>
        </main>
      )}

      {!weather && !loading && !error && (
        <div className="flex flex-col items-center gap-6 py-16 text-text-secondary">
          <svg
            className="opacity-40"
            viewBox="-1 -1 26 26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            width="64"
            height="64"
          >
            <path d="M2 15.2c0-2.4 1.3-4.5 3.3-5.6a6.5 6.5 0 0 1 12.5-1.8A5 5 0 0 1 20 13a5 5 0 0 1-2 9.5H5a5 5 0 0 1-3-9.3Z" />
          </svg>
          <p>Search for a city to get started</p>
          <p className="text-xs opacity-50">
            Press / or Ctrl+K to focus search
          </p>
        </div>
      )}

      {showShareCard && weather && (
        <ShareCard
          data={weather}
          units={units}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </div>
  )
}
