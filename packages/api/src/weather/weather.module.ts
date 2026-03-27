import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { OpenWeatherProvider } from './providers/openweather.provider';
import { AccuWeatherProvider } from './providers/accuweather.provider';
import { WeatherGovProvider } from './providers/weathergov.provider';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, OpenWeatherProvider, AccuWeatherProvider, WeatherGovProvider],
  exports: [WeatherService],
})
export class WeatherModule {}
