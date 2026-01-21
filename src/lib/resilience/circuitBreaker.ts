/**
 * Circuit Breaker Pattern for API Resilience
 *
 * Prevents cascading failures by failing fast when an external service
 * is experiencing issues. Supports automatic recovery after cooldown.
 */

export type CircuitState = 'closed' | 'open' | 'half-open'

export interface CircuitBreakerOptions {
  threshold: number
  cooldownMs: number
  halfOpenTimeoutMs: number
}

export interface CircuitBreakerStats {
  state: CircuitState
  failureCount: number
  successCount: number
  lastFailureTime?: number
  lastStateChange?: number
  nextAttemptTime?: number
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  threshold: 5,
  cooldownMs: 60_000,
  halfOpenTimeoutMs: 10_000,
}

class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failureCount = 0
  private successCount = 0
  private lastFailureTime?: number
  private lastStateChange?: number
  private readonly options: CircuitBreakerOptions

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now()

    if (this.state === 'open' && this.lastFailureTime) {
      const timeSinceFailure = now - this.lastFailureTime
      if (timeSinceFailure >= this.options.cooldownMs) {
        this.transitionTo('half-open')
      }
    }

    if (this.state === 'open') {
      throw new CircuitBreakerOpenError('Circuit breaker is open', this.getStats())
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.successCount += 1
    if (this.state === 'half-open') {
      this.transitionTo('closed')
      this.failureCount = 0
    }
  }

  private onFailure(): void {
    this.failureCount += 1
    this.lastFailureTime = Date.now()

    if (this.state === 'half-open') {
      this.transitionTo('open')
    } else if (this.failureCount >= this.options.threshold) {
      this.transitionTo('open')
    }
  }

  private transitionTo(newState: CircuitState): void {
    if (this.state !== newState) {
      this.state = newState
      this.lastStateChange = Date.now()
    }
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange,
      nextAttemptTime:
        this.state === 'open' && this.lastFailureTime
          ? this.lastFailureTime + this.options.cooldownMs
          : undefined,
    }
  }

  reset(): void {
    this.state = 'closed'
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = undefined
    this.lastStateChange = undefined
  }
}

export class CircuitBreakerOpenError extends Error {
  public readonly stats: CircuitBreakerStats

  constructor(message: string, stats: CircuitBreakerStats) {
    super(message)
    this.name = 'CircuitBreakerOpenError'
    this.stats = stats
  }
}

class CircuitBreakerRegistry {
  private circuits = new Map<string, CircuitBreaker>()

  get(name: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    if (!this.circuits.has(name)) {
      this.circuits.set(name, new CircuitBreaker(options))
    }
    return this.circuits.get(name)!
  }

  reset(name: string): void {
    const circuit = this.circuits.get(name)
    if (circuit) {
      circuit.reset()
    }
  }

  resetAll(): void {
    for (const circuit of this.circuits.values()) {
      circuit.reset()
    }
  }

  getStats(name: string): CircuitBreakerStats | undefined {
    return this.circuits.get(name)?.getStats()
  }

  getAllStats(): Map<string, CircuitBreakerStats> {
    const stats = new Map<string, CircuitBreakerStats>()
    for (const [name, circuit] of this.circuits.entries()) {
      stats.set(name, circuit.getStats())
    }
    return stats
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry()

export const globalpingCircuitBreaker = circuitBreakerRegistry.get('globalping', {
  threshold: 3,
  cooldownMs: 30_000,
  halfOpenTimeoutMs: 5_000,
})

export const dnsCircuitBreaker = circuitBreakerRegistry.get('dns', {
  threshold: 5,
  cooldownMs: 60_000,
  halfOpenTimeoutMs: 10_000,
})

export async function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  options?: Partial<CircuitBreakerOptions>
): Promise<T> {
  const breaker = circuitBreakerRegistry.get(name, options)
  return breaker.execute(fn)
}
