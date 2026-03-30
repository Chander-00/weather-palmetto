export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
  failureThreshold: number
  resetTimeoutMs: number
}

/**
 * Per-provider circuit breaker.
 *
 * CLOSED  → requests flow normally. After `failureThreshold` consecutive
 *           failures the circuit trips to OPEN.
 * OPEN    → requests are rejected immediately (fast-fail) for
 *           `resetTimeoutMs` milliseconds, then the circuit moves to HALF_OPEN.
 * HALF_OPEN → a single probe request is allowed through.
 *           If it succeeds → CLOSED. If it fails → back to OPEN.
 */
export class CircuitBreaker {
  private state = CircuitState.CLOSED
  private failures = 0
  private lastFailureTime = 0

  constructor(
    readonly providerName: string,
    private readonly opts: CircuitBreakerOptions
  ) {}

  getState(): CircuitState {
    if (this.state === CircuitState.OPEN && this.resetTimeoutElapsed()) {
      this.state = CircuitState.HALF_OPEN
    }
    return this.state
  }

  shouldAllow(): boolean {
    const current = this.getState()
    return current === CircuitState.CLOSED || current === CircuitState.HALF_OPEN
  }

  onSuccess(): void {
    this.failures = 0
    this.state = CircuitState.CLOSED
  }

  onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    if (this.failures >= this.opts.failureThreshold) {
      this.state = CircuitState.OPEN
    }
  }

  private resetTimeoutElapsed(): boolean {
    return Date.now() - this.lastFailureTime >= this.opts.resetTimeoutMs
  }
}
