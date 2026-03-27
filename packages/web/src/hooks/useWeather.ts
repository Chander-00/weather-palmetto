import { useState, useCallback } from 'react';
import type { WeatherData } from '@/types/weather';
import { fetchWeatherByCity, fetchWeatherByCoordinates } from '@/services/weather-api';

interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  searchByCity: (city: string, units?: 'metric' | 'imperial') => Promise<void>;
  searchByLocation: (units?: 'metric' | 'imperial') => Promise<void>;
  units: 'metric' | 'imperial';
  setUnits: (units: 'metric' | 'imperial') => void;
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<'metric' | 'imperial'>('imperial');

  const searchByCity = useCallback(async (city: string, unitOverride?: 'metric' | 'imperial') => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherByCity(city, unitOverride ?? units);
      setWeather(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [units]);

  const searchByLocation = useCallback(async (unitOverride?: 'metric' | 'imperial') => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });

      const { latitude, longitude } = position.coords;
      const data = await fetchWeatherByCoordinates(latitude, longitude, unitOverride ?? units);
      setWeather(data);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        setError('Location access denied. Please search by city name instead.');
      } else {
        const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [units]);

  return { weather, loading, error, searchByCity, searchByLocation, units, setUnits };
}
