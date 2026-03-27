import { Logger } from '@nestjs/common'

const logger = new Logger('EnvValidation')

export function validateEnv() {
  const warnings: string[] = []

  if (!process.env.OPENWEATHER_API_KEY) {
    warnings.push('OPENWEATHER_API_KEY is not set — primary provider disabled')
  }

  if (!process.env.ACCUWEATHER_API_KEY) {
    warnings.push(
      'ACCUWEATHER_API_KEY is not set — accuweather fallback disabled'
    )
  }

  if (warnings.length) {
    warnings.forEach((w) => logger.warn(w))
  }

  if (!process.env.OPENWEATHER_API_KEY && !process.env.ACCUWEATHER_API_KEY) {
    logger.warn(
      'Only Weather.gov (US-only) is available. Set at least OPENWEATHER_API_KEY for global coverage.'
    )
  }
}
