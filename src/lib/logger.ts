/**
 * Structured JSON Logging for Cloudflare Workers
 *
 * Provides consistent, structured logging with request context tracking.
 * All logs are formatted as JSON for easy parsing in log aggregation services.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  requestId?: string
  userId?: string
  ip?: string
  userAgent?: string
  path?: string
  method?: string
  [key: string]: unknown
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Extract request context for logging
 */
export function extractRequestContext(request: Request, requestId?: string): LogContext {
  const url = new URL(request.url)
  return {
    requestId: requestId ?? generateRequestId(),
    method: request.method,
    path: url.pathname + url.search,
    ip: request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  }
}

/**
 * Core logging function - outputs JSON structured logs
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context: context && Object.keys(context).length > 0 ? context : undefined,
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: level === 'error' ? error.stack : undefined,
      code: (error as { code?: string }).code,
    }
  }

  // Cloudflare Workers compatible - console.log with JSON
  const output = JSON.stringify(entry)
  const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  consoleMethod(output)
}

/**
 * Logger class with context support
 */
export class Logger {
  private baseContext: LogContext

  constructor(baseContext: LogContext = {}) {
    this.baseContext = baseContext
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.baseContext, ...additionalContext })
  }

  debug(message: string, context?: LogContext): void {
    log('debug', message, { ...this.baseContext, ...context })
  }

  info(message: string, context?: LogContext): void {
    log('info', message, { ...this.baseContext, ...context })
  }

  warn(message: string, context?: LogContext): void {
    log('warn', message, { ...this.baseContext, ...context })
  }

  error(message: string, error?: Error, context?: LogContext): void {
    log('error', message, { ...this.baseContext, ...context }, error)
  }

  /**
   * Log HTTP request
   */
  logRequest(request: Request, requestId?: string): void {
    const ctx = extractRequestContext(request, requestId)
    this.info('Incoming request', ctx)
  }

  /**
   * Log HTTP response
   */
  logResponse(request: Request, status: number, latency: number, requestId?: string): void {
    const ctx = extractRequestContext(request, requestId)
    this.info('Request completed', { ...ctx, status, latency })
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger()

/**
 * Create a logger from a Request object
 */
export function createLoggerFromRequest(request: Request): Logger {
  const context = extractRequestContext(request)
  return new Logger(context)
}
