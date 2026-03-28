import {
  Controller,
  Get,
  Query,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { WeatherService } from './weather.service'
import { WeatherQueryDto } from './dto/weather-query.dto'
import { WeatherResponseDto } from './dto/weather-response.dto'

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({ summary: 'Get weather data by city name or coordinates' })
  @ApiResponse({ status: 200, type: WeatherResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 404, description: 'City not found' })
  @ApiResponse({ status: 500, description: 'All weather providers failed' })
  async getWeather(
    @Query() query: WeatherQueryDto
  ): Promise<WeatherResponseDto> {
    if (!query.city && (query.lat === undefined || query.lon === undefined)) {
      throw new BadRequestException(
        'Provide either a city name or lat/lon coordinates'
      )
    }

    try {
      if (query.city) {
        return await this.weatherService.getWeatherByCity(
          query.city,
          query.units
        )
      }
      return await this.weatherService.getWeatherByCoordinates(
        query.lat!,
        query.lon!,
        query.units
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch weather data'

      if (this.isNotFoundError(message)) {
        throw new NotFoundException(
          `Could not find weather data for "${query.city || `${query.lat},${query.lon}`}"`
        )
      }

      throw new InternalServerErrorException(
        'Unable to fetch weather data. Please try again later.'
      )
    }
  }

  private isNotFoundError(message: string): boolean {
    const lower = message.toLowerCase()
    return (
      lower.includes('not found') ||
      lower.includes('404') ||
      lower.includes('no results')
    )
  }
}
