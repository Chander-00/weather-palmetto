import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import { requestContext } from './request-context'

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string) || randomUUID()
    res.setHeader('X-Request-Id', requestId)
    requestContext.run({ requestId }, () => next())
  }
}
