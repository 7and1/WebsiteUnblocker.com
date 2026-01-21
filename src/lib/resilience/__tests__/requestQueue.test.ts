/**
 * Request Queue Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RequestQueue, withQueue, regionCheckQueue } from '../requestQueue'

describe('RequestQueue', () => {
  let queue: RequestQueue

  beforeEach(() => {
    queue = new RequestQueue({ concurrency: 2, timeout: 1000 })
  })

  describe('add', () => {
    it('should execute task immediately when under concurrency limit', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')

      const result = await queue.add(mockFn)

      expect(result).toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should queue tasks when at concurrency limit', async () => {
      let running = 0
      const maxRunning: number[] = []

      const createTask = (delay: number) => async () => {
        running++
        maxRunning.push(running)
        await new Promise(resolve => setTimeout(resolve, delay))
        running--
        return `done-${delay}`
      }

      // Add 4 tasks with concurrency of 2
      const results = await Promise.all([
        queue.add(createTask(50)),
        queue.add(createTask(50)),
        queue.add(createTask(50)),
        queue.add(createTask(50)),
      ])

      expect(results).toHaveLength(4)
      expect(Math.max(...maxRunning)).toBe(2) // Never exceeded concurrency
    })

    it('should process tasks in FIFO order', async () => {
      const order: string[] = []

      const task1 = async () => {
        order.push('start-1')
        await new Promise(resolve => setTimeout(resolve, 30))
        order.push('end-1')
        return 1
      }

      const task2 = async () => {
        order.push('start-2')
        await new Promise(resolve => setTimeout(resolve, 10))
        order.push('end-2')
        return 2
      }

      const task3 = async () => {
        order.push('start-3')
        order.push('end-3')
        return 3
      }

      // Start first task
      queue.add(task1)

      // Wait a bit then start concurrent tasks
      await new Promise(resolve => setTimeout(resolve, 10))

      await Promise.all([
        queue.add(task2),
        queue.add(task3),
      ])

      await new Promise(resolve => setTimeout(resolve, 100))

      // Task 1 started first, task 2 and 3 ran concurrently after
      expect(order[0]).toBe('start-1')
    })

    it('should resolve with task return value', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' })

      const result = await queue.add(mockFn)

      expect(result).toEqual({ data: 'test' })
    })

    it('should reject on task error', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('task failed'))

      await expect(queue.add(mockFn)).rejects.toThrow('task failed')
    })

    it('should reject on timeout', async () => {
      const queue = new RequestQueue({ concurrency: 1, timeout: 50 })

      const slowTask = async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
        return 'done'
      }

      await expect(queue.add(slowTask)).rejects.toThrow('Request queue timeout')
    })

    it('should continue processing after timeout', async () => {
      const queue = new RequestQueue({ concurrency: 1, timeout: 30 })

      const slowTask = async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return 'slow'
      }

      const fastTask = async () => {
        return 'fast'
      }

      // First task times out
      const slowPromise = queue.add(slowTask).catch(() => 'timeout')

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 50))

      // Add another task - queue should still work
      const fastResult = await queue.add(fastTask)

      // Wait for slow task to complete
      await new Promise(resolve => setTimeout(resolve, 100))
      await slowPromise

      expect(fastResult).toBe('fast')
    })
  })

  describe('getStatus', () => {
    it('should return correct status for empty queue', () => {
      const status = queue.getStatus()

      expect(status.pending).toBe(0)
      expect(status.running).toBe(0)
      expect(status.capacity).toBe(2)
    })

    it('should reflect running tasks', async () => {
      let shouldFinish = false

      const longTask = async () => {
        while (!shouldFinish) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
        return 'done'
      }

      // Start a task
      queue.add(longTask)

      // Wait for it to start
      await new Promise(resolve => setTimeout(resolve, 20))

      const status = queue.getStatus()
      expect(status.running).toBe(1)
      expect(status.pending).toBe(0)
      expect(status.capacity).toBe(1)

      shouldFinish = true
    })

    it('should reflect pending tasks', async () => {
      let shouldFinish = false

      const longTask = async () => {
        while (!shouldFinish) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
        return 'done'
      }

      // Start tasks at max concurrency
      queue.add(longTask)
      queue.add(longTask)

      await new Promise(resolve => setTimeout(resolve, 20))

      // Add more tasks that will be queued
      queue.add(longTask)
      queue.add(longTask)

      await new Promise(resolve => setTimeout(resolve, 10))

      const status = queue.getStatus()
      expect(status.running).toBe(2)
      expect(status.pending).toBe(2)
      expect(status.capacity).toBe(0)

      shouldFinish = true
    })
  })

  describe('clear', () => {
    it('should reject all pending tasks', async () => {
      let shouldFinish = false

      const longTask = async () => {
        while (!shouldFinish) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
        return 'done'
      }

      // Start tasks at max concurrency
      const running1 = queue.add(longTask)
      const running2 = queue.add(longTask)

      await new Promise(resolve => setTimeout(resolve, 20))

      // Add pending tasks
      const pending1 = queue.add(longTask)
      const pending2 = queue.add(longTask)

      // Clear pending
      queue.clear()

      // Pending tasks should be rejected - suppress unhandled rejection
      const pendingRejections = Promise.allSettled([
        pending1.catch(() => 'cleared'),
        pending2.catch(() => 'cleared'),
      ])

      await pendingRejections

      expect(queue.getStatus().pending).toBe(0)

      // Running tasks should continue
      expect(queue.getStatus().running).toBe(2)

      shouldFinish = true
      await running1
      await running2
    })

  })
})

describe('withQueue', () => {
  it('should execute function through default queue', async () => {
    const mockFn = vi.fn().mockResolvedValue('result')

    const result = await withQueue(mockFn)

    expect(result).toBe('result')
  })

  it('should use custom queue when provided', async () => {
    const customQueue = new RequestQueue({ concurrency: 1, timeout: 1000 })
    const mockFn = vi.fn().mockResolvedValue('result')

    const result = await withQueue(mockFn, customQueue)

    expect(result).toBe('result')
  })
})

describe('regionCheckQueue', () => {
  it('should have correct default configuration', () => {
    const status = regionCheckQueue.getStatus()

    expect(status.running).toBe(0)
    expect(status.pending).toBe(0)
    expect(status.capacity).toBe(4)
  })

  it('should process tasks concurrently', async () => {
    let running = 0
    const maxRunning: number[] = []

    const createTask = (id: number) => async () => {
      running++
      maxRunning.push(running)
      await new Promise(resolve => setTimeout(resolve, 20))
      running--
      return id
    }

    // Add 6 tasks with concurrency of 4
    const promises = []
    for (let i = 0; i < 6; i++) {
      promises.push(regionCheckQueue.add(createTask(i)))
    }

    await Promise.all(promises)

    expect(Math.max(...maxRunning)).toBeLessThanOrEqual(4)
  })
})
