import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GlobalExceptionFilter } from './http-exception.filter'
import { HttpException, HttpStatus } from '@nestjs/common'

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter
  let mockResponse: { status: ReturnType<typeof vi.fn> }
  let mockJson: ReturnType<typeof vi.fn>
  let mockHost: any

  beforeEach(() => {
    filter = new GlobalExceptionFilter()
    mockJson = vi.fn()
    mockResponse = {
      status: vi.fn().mockReturnValue({ json: mockJson })
    }
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({ method: 'GET', url: '/api/weather?city=London' })
      })
    }
  })

  it('should handle HttpException with correct status', () => {
    const exception = new HttpException('Not found', HttpStatus.NOT_FOUND)
    filter.catch(exception, mockHost)

    expect(mockResponse.status).toHaveBeenCalledWith(404)
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Not found',
        path: '/api/weather?city=London'
      })
    )
  })

  it('should handle unknown errors as 500', () => {
    filter.catch(new Error('something broke'), mockHost)

    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error'
      })
    )
  })

  it('should include timestamp in response', () => {
    filter.catch(new Error('test'), mockHost)

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ timestamp: expect.any(String) })
    )
  })
})
