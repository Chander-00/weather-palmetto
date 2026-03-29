import { NestFactory } from '@nestjs/core'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as compression from 'compression'
import helmet from 'helmet'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { AppModule } from './app.module'
import { ContextualLogger } from './common/logger/contextual-logger'
import { validateEnv } from './config/env.validation'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(new ContextualLogger())
  const logger = new Logger('Bootstrap')
  const config = app.get(ConfigService)
  const isDev = config.get<string>('NODE_ENV') !== 'production'

  validateEnv(config)

  app.use(helmet())
  app.use(compression())

  const corsOrigin = isDev
    ? '*'
    : config.get<string>('CORS_ORIGIN', '')

  if (!isDev && !config.get<string>('CORS_ORIGIN')) {
    logger.error(
      'CORS_ORIGIN is not set in production — refusing to start. Set CORS_ORIGIN in your environment.'
    )
    process.exit(1)
  }

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET']
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  )

  app.setGlobalPrefix('api')

  app.enableShutdownHooks()

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Weather API')
    .setDescription(
      'Weather data aggregation API with multi-provider fallback'
    )
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)

  if (isDev) {
    try {
      writeFileSync(
        join(__dirname, '..', 'swagger.json'),
        JSON.stringify(document, null, 2)
      )
      logger.log('Swagger spec written to swagger.json')
    } catch {
      logger.warn('Could not write swagger.json — read-only filesystem?')
    }

    SwaggerModule.setup('api/docs', app, document)
    logger.log('Swagger docs available at /api/docs')
  }

  const port = config.get<number>('PORT', 3001)
  await app.listen(port)
  logger.log(`Server running on port ${port}`)
}

bootstrap()
