import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { BadRequestException } from '@nestjs/common';

const mockWeatherData = {
  provider: 'openweather',
  location: { name: 'London', country: 'GB', coordinates: { lat: 51.5, lon: -0.12 } },
  current: {
    temperature: 59,
    feelsLike: 57,
    humidity: 72,
    pressure: 1013,
    windSpeed: 5,
    windDirection: 220,
    visibility: 10000,
    uvIndex: null,
    condition: { main: 'Clouds', description: 'overcast clouds', icon: '04d' },
  },
  forecast: [],
};

describe('WeatherController', () => {
  let controller: WeatherController;
  let service: Partial<WeatherService>;

  beforeEach(() => {
    service = {
      getWeatherByCity: vi.fn().mockResolvedValue(mockWeatherData),
      getWeatherByCoordinates: vi.fn().mockResolvedValue(mockWeatherData),
    };
    controller = new WeatherController(service as WeatherService);
  });

  it('should fetch weather by city', async () => {
    const result = await controller.getWeather({ city: 'London', units: 'imperial' });
    expect(result.location.name).toBe('London');
    expect(service.getWeatherByCity).toHaveBeenCalledWith('London', 'imperial');
  });

  it('should fetch weather by coordinates', async () => {
    const result = await controller.getWeather({ lat: 51.5, lon: -0.12, units: 'imperial' });
    expect(result).toEqual(mockWeatherData);
    expect(service.getWeatherByCoordinates).toHaveBeenCalledWith(51.5, -0.12, 'imperial');
  });

  it('should throw BadRequest when no city or coords provided', async () => {
    await expect(controller.getWeather({ units: 'imperial' })).rejects.toThrow(BadRequestException);
  });
});
