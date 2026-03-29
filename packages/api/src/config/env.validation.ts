import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

const logger = new Logger('EnvValidation')

export function validateEnv(config: ConfigService) {
  const warnings: string[] = []

  if (!config.get<string>('OPENWEATHER_API_KEY')) {
    warnings.push('OPENWEATHER_API_KEY is not set — primary provider disabled')
  }

  if (!config.get<string>('ACCUWEATHER_API_KEY')) {
    warnings.push(
      'ACCUWEATHER_API_KEY is not set — accuweather fallback disabled'
    )
  }

  if (warnings.length === 2) {
    warnings.push(
      'Only Weather.gov (US-only) is available. Set at least OPENWEATHER_API_KEY for global coverage.'
    )
  }

  warnings.forEach((w) => logger.warn(w))
}
