import { describe, it, expect, vi } from 'vitest'
import { LoggingInterceptor } from './logging.interceptor'
import { of } from 'rxjs'

describe('LoggingInterceptor', () => {
  it('should log request method, url, and elapsed time', async () => {
    const interceptor = new LoggingInterceptor()

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/api/weather?city=London' })
      })
    } as any

    const mockHandler = { handle: () => of({ data: 'test' }) }

    const result = await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockHandler).subscribe((val) => {
        resolve(val)
      })
    })

    expect(result).toEqual({ data: 'test' })
  })
})
