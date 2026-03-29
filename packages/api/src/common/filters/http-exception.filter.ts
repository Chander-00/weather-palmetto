import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import { getRequestId } from '../context/request-context'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)
  private readonly isDev: boolean

  constructor(private readonly config: ConfigService) {
    this.isDev = config.get<string>('NODE_ENV') !== 'production'
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const { status, message } = this.getErrorDetails(exception)

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception instanceof Error ? exception.stack : undefined
      )
    } else {
      this.logger.warn(`${request.method} ${request.url} ${status}: ${message}`)
    }

    response.status(status).json({
      statusCode: status,
      message,
      trace_id: getRequestId(),
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(this.isDev && exception instanceof Error
        ? { stack: exception.stack }
        : {})
    })
  }

  private getErrorDetails(e: unknown): { status: number; message: string } {
    return {
      status:
        e instanceof HttpException
          ? e.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      message: e instanceof HttpException ? e.message : 'Internal server error'
    }
  }
}
