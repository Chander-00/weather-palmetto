import { ApiProperty } from '@nestjs/swagger'

class CoordinatesDto {
  @ApiProperty({ example: 51.5074 })
  lat: number

  @ApiProperty({ example: -0.1278 })
  lon: number
}

class LocationDto {
  @ApiProperty({ example: 'London' })
  name: string

  @ApiProperty({ example: 'GB' })
  country: string

  @ApiProperty()
  coordinates: CoordinatesDto
}

class ConditionDto {
  @ApiProperty({ example: 'Clouds' })
  main: string

  @ApiProperty({ example: 'overcast clouds' })
  description: string

  @ApiProperty({ example: '04d' })
  icon: string
}

class CurrentWeatherDto {
  @ApiProperty({ example: 15.2 })
  temperature: number

  @ApiProperty({ example: 13.8 })
  feelsLike: number

  @ApiProperty({ example: 72 })
  humidity: number

  @ApiProperty({ example: 1013 })
  pressure: number

  @ApiProperty({ example: 5.4 })
  windSpeed: number

  @ApiProperty({ example: 220 })
  windDirection: number

  @ApiProperty({ example: 10000 })
  visibility: number

  @ApiProperty({ example: 3.5, nullable: true })
  uvIndex: number | null

  @ApiProperty()
  condition: ConditionDto
}

class ForecastDayDto {
  @ApiProperty({ example: '2024-03-15' })
  date: string

  @ApiProperty({ example: 18.5 })
  temperatureHigh: number

  @ApiProperty({ example: 12.3 })
  temperatureLow: number

  @ApiProperty({ example: 65 })
  humidity: number

  @ApiProperty({ example: 4.2 })
  windSpeed: number

  @ApiProperty()
  condition: ConditionDto
}

export class WeatherResponseDto {
  @ApiProperty({ example: 'openweather' })
  provider: string

  @ApiProperty()
  location: LocationDto

  @ApiProperty()
  current: CurrentWeatherDto

  @ApiProperty({ type: [ForecastDayDto] })
  forecast: ForecastDayDto[]
}
