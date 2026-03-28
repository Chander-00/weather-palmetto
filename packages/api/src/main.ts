import { NestFactory } from '@nestjs/core'
import { Logger, ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as compression from 'compression'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { validateEnv } from './config/env.validation'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')

  validateEnv()

  app.use(helmet())
  app.use(compression())

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Weather API')
      .setDescription(
        'Weather data aggregation API with multi-provider fallback'
      )
      .setVersion('1.0')
      .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('api/docs', app, document)
    logger.log('Swagger docs available at /api/docs')
  }

  const port = process.env.PORT || 3001
  await app.listen(port)
  logger.log(`Server running on port ${port}`)
}

bootstrap()
