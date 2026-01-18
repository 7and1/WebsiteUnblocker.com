/**
 * Website Check Service
 *
 * Encapsulates website checking logic with detailed status categorization,
 * retry logic with exponential backoff, and comprehensive logging.
 */

import { logger, type Logger, generateRequestId } from '@/lib/logger'

export type CheckStatus =
  | 'accessible'
  | 'blocked'
  | 'timeout'
  | 'dns_error'
  | 'connection_refused'
  | 'firewall_block'
  | 'geo_restriction'
  | 'ssl_error'
  | 'server_error'
  | 'unknown'

export type BlockReason =
  | 'ISP_BLOCK'
  | 'GOVERNMENT_CENSORSHIP'
  | 'FIREWALL'
  | 'GEO_RESTRICTION'
  | 'NETWORK_TIMEOUT'
  | 'DNS_FAILURE'
  | 'SSL_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN'

export interface WebsiteCheckResult {
  status: CheckStatus
  code?: number
  latency: number
  target: string
  error?: string
  blockReason?: BlockReason
  blockedBy?: string
  isAccessible: boolean
  retryCount?: number
  requestId?: string
}

export interface CheckOptions {
  timeout?: number
  maxRetries?: number
  retryDelay?: number
  userAgent?: string
  method?: 'HEAD' | 'GET'
  followRedirects?: boolean
  requestId?: string
}

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const DEFAULT_OPTIONS: Required<Omit<CheckOptions, 'requestId'>> = {
  timeout: 5000,
  maxRetries: 2,
  retryDelay: 1000,
  userAgent: DEFAULT_USER_AGENT,
  method: 'HEAD',
  followRedirects: true,
}

/**
 * Categorize HTTP status codes
 */
function categorizeStatusCode(status: number): { status: CheckStatus; blockReason?: BlockReason } {
  // 2xx - Success
  if (status >= 200 && status < 300) {
    return { status: 'accessible' }
  }

  // 3xx - Redirect
  if (status >= 300 && status < 400) {
    return { status: 'accessible' }
  }

  // 4xx - Client errors
  if (status === 403) {
    return { status: 'blocked', blockReason: 'FIREWALL' }
  }
  if (status === 404) {
    return { status: 'server_error' }
  }
  if (status >= 400 && status < 500) {
    return { status: 'blocked', blockReason: 'UNKNOWN' }
  }

  // 5xx - Server errors
  if (status >= 500) {
    return { status: 'server_error', blockReason: 'SERVER_ERROR' }
  }

  return { status: 'unknown' }
}

/**
 * Categorize fetch error
 */
function categorizeError(error: Error): { status: CheckStatus; blockReason?: BlockReason; message: string } {
  const message = error.message.toLowerCase()

  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out')) {
    return { status: 'timeout', blockReason: 'NETWORK_TIMEOUT', message: 'Connection timeout' }
  }

  // DNS errors
  if (message.includes('dns') || message.includes('enotfound') || message.includes('hostname')) {
    return { status: 'dns_error', blockReason: 'DNS_FAILURE', message: 'DNS resolution failed' }
  }

  // Connection refused
  if (message.includes('econnrefused') || message.includes('connection refused')) {
    return { status: 'connection_refused', blockReason: 'UNKNOWN', message: 'Connection refused' }
  }

  // SSL/TLS errors
  if (message.includes('ssl') || message.includes('tls') || message.includes('certificate')) {
    return { status: 'ssl_error', blockReason: 'SSL_ERROR', message: 'SSL/TLS error' }
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch failed')) {
    return { status: 'blocked', blockReason: 'UNKNOWN', message: 'Network error' }
  }

  return { status: 'unknown', blockReason: 'UNKNOWN', message: 'Unknown error' }
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(attempt: number, baseDelay: number): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000) // Max 10 seconds
}

/**
 * Website Check Service
 */
export class WebsiteCheckService {
  private loggerInstance: Logger

  constructor() {
    this.loggerInstance = logger
  }

  /**
   * Check if a website is accessible
   */
  async check(url: string, options: CheckOptions = {}): Promise<WebsiteCheckResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    const requestId = opts.requestId ?? generateRequestId()

    this.loggerInstance.info('Starting website check', { requestId, url, options: opts })

    let lastError: Error | null = null
    let retryCount = 0
    const startTime = Date.now()

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      retryCount = attempt

      try {
        const result = await this.fetchWithTimeout(url, opts)
        const latency = Date.now() - startTime

        const categorized = categorizeStatusCode(result.status)

        this.loggerInstance.info('Website check completed', {
          requestId,
          url,
          status: result.status,
          latency,
          attempt: attempt + 1,
        })

        return {
          status: categorized.status,
          code: result.status,
          latency,
          target: url,
          isAccessible: categorized.status === 'accessible',
          blockReason: categorized.blockReason,
          retryCount: attempt,
          requestId,
        }
      } catch (error) {
        lastError = error as Error

        // Don't retry on certain errors
        const isFatal = this.isFatalError(lastError)
        if (isFatal) {
          break
        }

        // Wait before retry (exponential backoff)
        if (attempt < opts.maxRetries) {
          const delay = calculateBackoff(attempt, opts.retryDelay)
          this.loggerInstance.debug('Retrying website check', {
            requestId,
            url,
            attempt: attempt + 1,
            delay,
          })
          await this.sleep(delay)
        }
      }
    }

    // All retries exhausted or fatal error
    const latency = Date.now() - startTime
    const categorized = lastError ? categorizeError(lastError) : {
      status: 'unknown' as CheckStatus,
      blockReason: 'UNKNOWN' as BlockReason,
      message: 'Unknown error',
    }

    this.loggerInstance.warn('Website check failed after retries', {
      requestId,
      url,
      status: categorized.status,
      latency,
      retries: retryCount + 1,
      error: lastError?.message,
    })

    return {
      status: categorized.status,
      latency,
      target: url,
      error: categorized.message,
      blockReason: categorized.blockReason,
      isAccessible: false,
      retryCount,
      requestId,
    }
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: Required<Omit<CheckOptions, 'requestId'>>
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeout)

    try {
      const response = await fetch(url, {
        method: options.method,
        headers: {
          'User-Agent': options.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        redirect: options.followRedirects ? 'follow' : 'manual',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)

      // Re-throw with more context
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${options.timeout}ms`)
      }
      throw error
    }
  }

  /**
   * Check if an error is fatal (no point in retrying)
   */
  private isFatalError(error: Error): boolean {
    const message = error.message.toLowerCase()

    // DNS failures are usually fatal
    if (message.includes('enotfound') || message.includes('dns')) {
      return true
    }

    // SSL errors are fatal
    if (message.includes('ssl') || message.includes('certificate')) {
      return true
    }

    return false
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Batch check multiple URLs
   */
  async checkBatch(urls: string[], options: CheckOptions = {}): Promise<Map<string, WebsiteCheckResult>> {
    const results = new Map<string, WebsiteCheckResult>()
    const requestId = options.requestId ?? generateRequestId()

    this.loggerInstance.info('Starting batch website check', {
      requestId,
      count: urls.length,
      urls: urls.slice(0, 5), // Log first 5 URLs only
    })

    // Check URLs concurrently (with limit to avoid overwhelming the system)
    const concurrency = 5
    const chunks: string[][] = []

    for (let i = 0; i < urls.length; i += concurrency) {
      chunks.push(urls.slice(i, i + concurrency))
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (url) => {
        const result = await this.check(url, { ...options, requestId })
        results.set(url, result)
      })

      await Promise.allSettled(promises)
    }

    const successCount = Array.from(results.values()).filter(r => r.isAccessible).length
    this.loggerInstance.info('Batch website check completed', {
      requestId,
      total: urls.length,
      success: successCount,
      failed: urls.length - successCount,
    })

    return results
  }

  /**
   * Get human-readable block description
   */
  getBlockDescription(result: WebsiteCheckResult): string {
    if (result.isAccessible) {
      return 'Website is accessible'
    }

    switch (result.blockReason) {
      case 'ISP_BLOCK':
        return 'This website appears to be blocked by your ISP'
      case 'GOVERNMENT_CENSORSHIP':
        return 'This website appears to be censored'
      case 'FIREWALL':
        return 'This website is being blocked by a firewall'
      case 'GEO_RESTRICTION':
        return 'This website is not available in your region'
      case 'NETWORK_TIMEOUT':
        return 'Connection timed out - the website may be slow or down'
      case 'DNS_FAILURE':
        return 'DNS resolution failed - the domain may not exist'
      case 'SSL_ERROR':
        return 'SSL/TLS certificate error'
      case 'SERVER_ERROR':
        return 'The server returned an error'
      default:
        return result.error ?? 'Website is not accessible'
    }
  }
}

/**
 * Singleton instance
 */
export const websiteCheckService = new WebsiteCheckService()

/**
 * Convenience function for single URL check
 */
export async function checkWebsite(url: string, options?: CheckOptions): Promise<WebsiteCheckResult> {
  return websiteCheckService.check(url, options)
}
