/**
 * Request Queue for Multi-Region Checks
 *
 * Manages concurrent requests to prevent overwhelming external services.
 */

export interface QueueOptions {
  concurrency: number
  timeout: number
}

export interface QueuedTask<T> {
  fn: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
}

const DEFAULT_OPTIONS: QueueOptions = {
  concurrency: 5,
  timeout: 30_000,
}

export class RequestQueue {
  private pending: QueuedTask<unknown>[] = []
  private running = 0
  private readonly options: QueueOptions

  constructor(options: Partial<QueueOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * Add a task to the queue
   */
  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: QueuedTask<T> = {
        fn,
        resolve: resolve as (value: unknown) => void,
        reject,
      }

      this.pending.push(task as QueuedTask<unknown>)
      this.process()
    })
  }

  private process(): void {
    while (this.pending.length > 0 && this.running < this.options.concurrency) {
      const task = this.pending.shift()
      if (!task) break

      this.running += 1

      Promise.race([
        task.fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request queue timeout')), this.options.timeout)
        ),
      ])
        .then(task.resolve)
        .catch(task.reject)
        .finally(() => {
          this.running -= 1
          this.process()
        })
    }
  }

  /**
   * Get current queue status
   */
  getStatus(): { pending: number; running: number; capacity: number } {
    return {
      pending: this.pending.length,
      running: this.running,
      capacity: this.options.concurrency - this.running,
    }
  }

  /**
   * Clear all pending tasks
   */
  clear(): void {
    for (const task of this.pending) {
      task.reject(new Error('Queue cleared'))
    }
    this.pending = []
  }
}

/**
 * Global request queue for multi-region checks
 */
export const regionCheckQueue = new RequestQueue({ concurrency: 4, timeout: 15_000 })

/**
 * Execute a function through the request queue
 */
export async function withQueue<T>(
  fn: () => Promise<T>,
  queue: RequestQueue = regionCheckQueue
): Promise<T> {
  return queue.add(fn)
}
