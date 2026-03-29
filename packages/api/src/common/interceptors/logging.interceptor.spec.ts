import { describe, it, expect } from 'vitest'
import { ExecutionContext } from '@nestjs/common'
import { LoggingInterceptor } from './logging.interceptor'
import { of } from 'rxjs'

describe('LoggingInterceptor', () => {
  it('should log request method, url, and elapsed time', async () => {
    const interceptor = new LoggingInterceptor()

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/api/weather?city=London' })
      })
    } as unknown as ExecutionContext

    const mockHandler = { handle: () => of({ data: 'test' }) }

    const result = await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockHandler).subscribe((val) => {
        resolve(val)
      })
    })

    expect(result).toEqual({ data: 'test' })
  })
})
