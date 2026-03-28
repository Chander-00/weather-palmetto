import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  MaxLength,
  ValidateIf
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class WeatherQueryDto {
  @ApiPropertyOptional({
    description: 'City name to search for',
    example: 'London'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ValidateIf((o) => !o.lat && !o.lon)
  city?: string

  @ApiPropertyOptional({ description: 'Latitude', example: 51.5074 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  @ValidateIf((o) => !o.city)
  lat?: number

  @ApiPropertyOptional({ description: 'Longitude', example: -0.1278 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  @ValidateIf((o) => !o.city)
  lon?: number

  @ApiPropertyOptional({
    description: 'Temperature unit',
    enum: ['metric', 'imperial'],
    default: 'imperial'
  })
  @IsOptional()
  @IsString()
  units?: 'metric' | 'imperial' = 'imperial'
}
