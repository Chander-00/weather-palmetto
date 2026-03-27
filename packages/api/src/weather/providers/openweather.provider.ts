import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  WeatherProvider,
  NormalizedWeather,
  ForecastDay,
} from '../interfaces/weather-provider.interface';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

@Injectable()
export class OpenWeatherProvider implements WeatherProvider {
  readonly name = 'openweather';
  readonly priority = 1;
  private readonly apiKey: string;
  private readonly logger = new Logger(OpenWeatherProvider.name);

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('OPENWEATHER_API_KEY', '');
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async getWeatherByCity(city: string): Promise<NormalizedWeather> {
    const [current, forecast] = await Promise.all([
      axios.get(`${BASE_URL}/weather`, {
        params: { q: city, appid: this.apiKey, units: 'imperial' },
      }),
      axios.get(`${BASE_URL}/forecast`, {
        params: { q: city, appid: this.apiKey, units: 'imperial' },
      }),
    ]);

    return this.normalize(current.data, forecast.data);
  }

  async getWeatherByCoordinates(lat: number, lon: number): Promise<NormalizedWeather> {
    const [current, forecast] = await Promise.all([
      axios.get(`${BASE_URL}/weather`, {
        params: { lat, lon, appid: this.apiKey, units: 'imperial' },
      }),
      axios.get(`${BASE_URL}/forecast`, {
        params: { lat, lon, appid: this.apiKey, units: 'imperial' },
      }),
    ]);

    return this.normalize(current.data, forecast.data);
  }

  private normalize(current: any, forecast: any): NormalizedWeather {
    const dailyMap = new Map<string, any[]>();

    for (const entry of forecast.list) {
      const date = entry.dt_txt.split(' ')[0];
      if (!dailyMap.has(date)) dailyMap.set(date, []);
      dailyMap.get(date)!.push(entry);
    }

    const forecastDays: ForecastDay[] = Array.from(dailyMap.entries())
      .slice(0, 5)
      .map(([date, entries]) => {
        const temps = entries.map((e) => e.main.temp);
        const midday = entries.find((e) => e.dt_txt.includes('12:00')) || entries[0];

        return {
          date,
          temperatureHigh: Math.round(Math.max(...temps)),
          temperatureLow: Math.round(Math.min(...temps)),
          humidity: midday.main.humidity,
          windSpeed: midday.wind.speed,
          condition: {
            main: midday.weather[0].main,
            description: midday.weather[0].description,
            icon: midday.weather[0].icon,
          },
        };
      });

    return {
      provider: this.name,
      location: {
        name: current.name,
        country: current.sys.country,
        coordinates: { lat: current.coord.lat, lon: current.coord.lon },
      },
      current: {
        temperature: Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        windSpeed: current.wind.speed,
        windDirection: current.wind.deg,
        visibility: current.visibility,
        uvIndex: null,
        condition: {
          main: current.weather[0].main,
          description: current.weather[0].description,
          icon: current.weather[0].icon,
        },
      },
      forecast: forecastDays,
    };
  }
}
