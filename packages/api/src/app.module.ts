import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerGuard } from '@nestjs/throttler'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { CacheModule } from '@nestjs/cache-manager'
import { WeatherModule } from './weather/weather.module'
import { HealthModule } from './health/health.module'
import { GlobalExceptionFilter } from './common/filters/http-exception.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { RequestContextMiddleware } from './common/context/request-context.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]), // 30req x min
    CacheModule.register({ isGlobal: true, ttl: 300000 }), // 5 min
    WeatherModule,
    HealthModule
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*path')
  }
}
