import { ConsoleLogger, LogLevel } from '@nestjs/common'
import { createWriteStream, WriteStream } from 'fs'
import { join } from 'path'
import { getRequestId } from '../context/request-context'

const LOG_FILE = join(__dirname, '..', '..', '..', 'logs.jsonl')

export class ContextualLogger extends ConsoleLogger {
  private readonly stream: WriteStream

  constructor() {
    super()
    this.stream = createWriteStream(LOG_FILE, { flags: 'a' })
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.writeToFile('log', message)
    super.log(this.withTraceId(message), ...optionalParams)
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.writeToFile('warn', message)
    super.warn(this.withTraceId(message), ...optionalParams)
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.writeToFile('error', message, optionalParams[0])
    super.error(this.withTraceId(message), ...optionalParams)
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.writeToFile('debug', message)
    super.debug(this.withTraceId(message), ...optionalParams)
  }

  private withTraceId(message: unknown): unknown {
    if (typeof message !== 'string') return message
    const id = getRequestId()
    return id ? `trace_id=${id} ${message}` : message
  }

  private writeToFile(
    level: LogLevel,
    message: unknown,
    stack?: unknown
  ): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      trace_id: getRequestId() ?? null,
      message: typeof message === 'string' ? message : String(message),
      ...(stack ? { stack: String(stack) } : {})
    }

    this.stream.write(JSON.stringify(entry) + '\n')
  }
}
