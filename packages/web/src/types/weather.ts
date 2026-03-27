export interface Coordinates {
  lat: number;
  lon: number;
}

export interface WeatherCondition {
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  uvIndex: number | null;
  condition: WeatherCondition;
}

export interface ForecastDay {
  date: string;
  temperatureHigh: number;
  temperatureLow: number;
  humidity: number;
  windSpeed: number;
  condition: WeatherCondition;
}

export interface WeatherData {
  provider: string;
  location: {
    name: string;
    country: string;
    coordinates: Coordinates;
  };
  current: CurrentWeather;
  forecast: ForecastDay[];
}
