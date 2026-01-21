/**
 * Circuit Breaker Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  circuitBreakerRegistry,
  CircuitBreakerOpenError,
  withCircuitBreaker,
  type CircuitBreakerOptions,
  type CircuitBreakerStats,
} from '../circuitBreaker'

describe('CircuitBreaker', () => {
  beforeEach(() => {
    circuitBreakerRegistry.resetAll()
  })

  describe('execute', () => {
    it('should execute successful function immediately', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const breaker = circuitBreakerRegistry.get('test-success', { threshold: 3 })

      const result = await breaker.execute(mockFn)

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should transition to open after threshold failures', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('fail'))
      const breaker = circuitBreakerRegistry.get('test-fail', {
        threshold: 3,
        cooldownMs: 100,
      })

      // First 2 failures should still execute
      for (let i = 0; i < 2; i++) {
        await expect(breaker.execute(mockFn)).rejects.toThrow('fail')
      }

      // Third failure triggers open state
      await expect(breaker.execute(mockFn)).rejects.toThrow('fail')

      // Next call should fail fast with CircuitBreakerOpenError
      await expect(breaker.execute(mockFn)).rejects.toThrow(CircuitBreakerOpenError)
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should transition to half-open after cooldown', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('fail'))
      const breaker = circuitBreakerRegistry.get('test-half-open', {
        threshold: 2,
        cooldownMs: 50,
      })

      // Trigger open state
      await expect(breaker.execute(mockFn)).rejects.toThrow('fail')
      await expect(breaker.execute(mockFn)).rejects.toThrow('fail')

      expect(breaker.getStats().state).toBe('open')

      // Wait for cooldown
      await new Promise(resolve => setTimeout(resolve, 60))

      // Next call should transition to half-open and execute
      await expect(breaker.execute(mockFn)).rejects.toThrow('fail')
      expect(breaker.getStats().state).toBe('open') // Failed again, so back to open
    })

    it('should close on successful half-open execution', async () => {
      let attempts = 0
      const mockFn = vi.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) throw new Error('fail')
        return 'success'
      })

      const breaker = circuitBreakerRegistry.get('test-recover', {
        threshold: 2,
        cooldownMs: 50,
      })

      // Trigger open state
      await expect(breaker.execute(mockFn)).rejects.toThrow('fail')
      await expect(breaker.execute(mockFn)).rejects.toThrow('fail')

      expect(breaker.getStats().state).toBe('open')

      // Wait for cooldown and try again
      await new Promise(resolve => setTimeout(resolve, 60))

      const result = await breaker.execute(mockFn)
      expect(result).toBe('success')
      expect(breaker.getStats().state).toBe('closed')
    })

    it('should reset failure count on successful call in closed state', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')

      const breaker = circuitBreakerRegistry.get('test-reset-count', {
        threshold: 3,
        cooldownMs: 100,
      })

      // Two failures
      await expect(breaker.execute(mockFn)).rejects.toThrow('fail')
      await expect(breaker.execute(mockFn)).rejects.toThrow('fail')
      expect(breaker.getStats().failureCount).toBe(2)

      // Success resets failure count (but not to 0 in closed state, only in half-open)
      const result = await breaker.execute(mockFn)
      expect(result).toBe('success')
      expect(breaker.getStats().failureCount).toBe(2) // Still 2 in closed state
    })
  })

  describe('getStats', () => {
    it('should return correct stats', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('fail'))
      const breaker = circuitBreakerRegistry.get('test-stats', {
        threshold: 2,
        cooldownMs: 100,
      })

      let stats = breaker.getStats()
      expect(stats.state).toBe('closed')
      expect(stats.failureCount).toBe(0)
      expect(stats.successCount).toBe(0)

      // First failure
      await expect(breaker.execute(mockFn)).rejects.toThrow('fail')
      stats = breaker.getStats()
      expect(stats.failureCount).toBe(1)
      expect(stats.lastFailureTime).toBeDefined()
      expect(stats.lastStateChange).toBeUndefined()

      // Second failure - triggers open
      await expect(breaker.execute(mockFn)).rejects.toThrow('fail')
      stats = breaker.getStats()
      expect(stats.state).toBe('open')
      expect(stats.failureCount).toBe(2)
      expect(stats.lastStateChange).toBeDefined()
      expect(stats.nextAttemptTime).toBeDefined()
    })
  })

  describe('reset', () => {
    it('should reset breaker state', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('fail'))
      const breaker = circuitBreakerRegistry.get('test-reset', {
        threshold: 2,
        cooldownMs: 100,
      })

      // Trigger open state
      await expect(breaker.execute(mockFn)).rejects.toThrow('fail')
      await expect(breaker.execute(mockFn)).rejects.toThrow('fail')

      expect(breaker.getStats().state).toBe('open')

      breaker.reset()

      const stats = breaker.getStats()
      expect(stats.state).toBe('closed')
      expect(stats.failureCount).toBe(0)
      expect(stats.successCount).toBe(0)
      expect(stats.lastFailureTime).toBeUndefined()
      expect(stats.lastStateChange).toBeUndefined()
    })
  })

  describe('CircuitBreakerRegistry', () => {
    it('should return same instance for same name', () => {
      const breaker1 = circuitBreakerRegistry.get('registry-test')
      const breaker2 = circuitBreakerRegistry.get('registry-test')

      expect(breaker1).toBe(breaker2)
    })

    it('should reset specific breaker', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('fail'))
      const breaker = circuitBreakerRegistry.get('registry-reset', {
        threshold: 2,
        cooldownMs: 100,
      })

      await breaker.execute(mockFn).catch(() => {})
      await breaker.execute(mockFn).catch(() => {})

      expect(breaker.getStats().state).toBe('open')

      circuitBreakerRegistry.reset('registry-reset')

      expect(breaker.getStats().state).toBe('closed')
    })

    it('should get stats for specific breaker', async () => {
      const breaker = circuitBreakerRegistry.get('stats-specific', { threshold: 3 })
      const mockFn = vi.fn().mockResolvedValue('success')

      await breaker.execute(mockFn)

      const stats = circuitBreakerRegistry.getStats('stats-specific')
      expect(stats).toBeDefined()
      expect(stats?.successCount).toBe(1)
    })

    it('should return undefined for non-existent breaker stats', () => {
      const stats = circuitBreakerRegistry.getStats('non-existent')
      expect(stats).toBeUndefined()
    })

    it('should get all stats', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      circuitBreakerRegistry.get('all-stats-1', { threshold: 3 })
      circuitBreakerRegistry.get('all-stats-2', { threshold: 5 })

      await mockFn()
      await mockFn()

      const allStats = circuitBreakerRegistry.getAllStats()
      expect(allStats.size).toBeGreaterThanOrEqual(2)
      expect(allStats.has('all-stats-1')).toBe(true)
      expect(allStats.has('all-stats-2')).toBe(true)
    })
  })
})

describe('withCircuitBreaker', () => {
  beforeEach(() => {
    circuitBreakerRegistry.resetAll()
  })

  it('should execute function through named circuit breaker', async () => {
    const mockFn = vi.fn().mockResolvedValue('result')

    const result = await withCircuitBreaker('helper-test', mockFn, {
      threshold: 3,
      cooldownMs: 100,
    })

    expect(result).toBe('result')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should reuse same circuit breaker for same name', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('fail'))

    const options = { threshold: 2, cooldownMs: 100 }

    // First call - first failure
    await withCircuitBreaker('helper-reuse', mockFn, options).catch(() => {})

    // Second call - second failure, triggers open
    await withCircuitBreaker('helper-reuse', mockFn, options).catch(() => {})

    // Third call - should be blocked
    await expect(withCircuitBreaker('helper-reuse', mockFn, options))
      .rejects.toThrow(CircuitBreakerOpenError)
  })
})

describe('CircuitBreakerOpenError', () => {
  it('should store stats in error', () => {
    const stats: CircuitBreakerStats = {
      state: 'open',
      failureCount: 5,
      successCount: 2,
      lastFailureTime: Date.now(),
      lastStateChange: Date.now(),
      nextAttemptTime: Date.now() + 30000,
    }

    const error = new CircuitBreakerOpenError('test message', stats)

    expect(error.name).toBe('CircuitBreakerOpenError')
    expect(error.message).toBe('test message')
    expect(error.stats).toBe(stats)
  })
})
