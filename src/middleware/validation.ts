/**
 * Input Validation Middleware
 *
 * Provides centralized input validation and sanitization for API endpoints.
 * Protects against injection attacks, XSS, and other common vulnerabilities.
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string, options: {
  maxLength?: number
  allowNull?: boolean
  trim?: boolean
} = {}): string | null {
  const { maxLength = 10000, allowNull = false, trim = true } = options

  // Handle null/undefined
  if (input === null || input === undefined) {
    return allowNull ? null : ''
  }

  // Convert to string
  let str = String(input)

  // Trim whitespace
  if (trim) {
    str = str.trim()
  }

  // Check length
  if (str.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength}`)
  }

  // Remove null bytes and other dangerous characters
  str = str.replace(/\0/g, '')

  // Detect potential injection patterns
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers (onclick=, etc.)
    /<iframe/gi, // Iframes
    /<embed/gi, // Embeds
    /<object/gi, // Objects
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(str)) {
      throw new Error('Input contains potentially dangerous content')
    }
  }

  return str
}

/**
 * Validate URL format and safety
 */
export function validateUrl(input: string, options: {
  allowedProtocols?: string[]
  allowUserPass?: boolean
  maxLength?: number
} = {}): { valid: boolean; sanitized?: string; error?: string } {
  const {
    allowedProtocols = ['http:', 'https:'],
    allowUserPass = false,
    maxLength = 2048,
  } = options

  try {
    // Basic string sanitization
    const sanitized = sanitizeString(input, { maxLength, allowNull: false })
    if (!sanitized) {
      return { valid: false, error: 'URL_REQUIRED' }
    }

    // Add protocol if missing
    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(sanitized)
    const candidate = hasProtocol ? sanitized : `https://${sanitized}`

    const url = new URL(candidate)

    // Check protocol
    if (!allowedProtocols.includes(url.protocol)) {
      return { valid: false, error: 'INVALID_PROTOCOL' }
    }

    // Check for user:pass in URL (security risk)
    if (!allowUserPass && (url.username || url.password)) {
      return { valid: false, error: 'URL_CONTAINS_CREDENTIALS' }
    }

    // Validate hostname
    if (!url.hostname) {
      return { valid: false, error: 'INVALID_HOSTNAME' }
    }

    const hostname = url.hostname.toLowerCase()
    const hostnameNoBrackets = hostname.replace(/^\[|\]$/g, '')

    // Prevent internal IP addresses in public requests (SSRF protection)
    const internalPatterns = [
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./, // AWS/Cloud metadata (link-local)
      /^0\.0\.0\.0$/,
      /^localhost$/,
      /^::1$/,
      /^fe80:/,
      /^fc00:/i, // IPv6 unique local (private)
      /^fd[0-9a-f]{2}:/i, // IPv6 unique local (private)
    ]

    if (internalPatterns.some(p => p.test(hostname) || p.test(hostnameNoBrackets))) {
      return { valid: false, error: 'INTERNAL_ADDRESS_NOT_ALLOWED' }
    }

    const isIPv4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(hostnameNoBrackets)
    const isIPv6 = /^[0-9a-f:]+$/i.test(hostnameNoBrackets) && hostnameNoBrackets.includes(':')
    const isValidDomain = /^(?=.{1,253}$)(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i.test(hostnameNoBrackets)

    if (!isIPv4 && !isIPv6 && !isValidDomain) {
      return { valid: false, error: 'INVALID_HOSTNAME' }
    }

    // Build sanitized URL
    // Remove trailing slash for root paths to match existing behavior
    // e.g., https://example.com/ -> https://example.com
    let finalUrl: string
    if (url.pathname === '/' && !url.search && !url.hash) {
      finalUrl = url.origin
    } else {
      finalUrl = url.toString()
    }

    return { valid: true, sanitized: finalUrl }
  } catch (error) {
    return { valid: false, error: 'INVALID_URL_FORMAT' }
  }
}

/**
 * Validate email format with additional security checks
 */
export function validateEmail(input: string, options: {
  maxLength?: number
  checkDisposable?: boolean
} = {}): { valid: boolean; sanitized?: string; error?: string } {
  const { maxLength = 255, checkDisposable = false } = options

  try {
    const sanitized = sanitizeString(input, { maxLength, allowNull: false })
    if (!sanitized) {
      return { valid: false, error: 'EMAIL_REQUIRED' }
    }

    const email = sanitized.toLowerCase().trim()

    // Basic email regex (more restrictive than RFC to prevent abuse)
    const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

    if (!emailRegex.test(email)) {
      return { valid: false, error: 'INVALID_EMAIL_FORMAT' }
    }

    // Check for suspicious patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return { valid: false, error: 'INVALID_EMAIL_FORMAT' }
    }

    // Check length of local and domain parts
    const [local, domain] = email.split('@')
    if (local.length > 64 || domain.length > 255) {
      return { valid: false, error: 'EMAIL_TOO_LONG' }
    }

    // Optional: Check for disposable email domains
    if (checkDisposable) {
      const disposableDomains = [
        'tempmail.com',
        'guerrillamail.com',
        'mailinator.com',
        '10minutemail.com',
        'throwaway.email',
      ]
      const domainName = domain.split('.')[0]
      if (disposableDomains.some(d => domain.endsWith(d))) {
        return { valid: false, error: 'DISPOSABLE_EMAIL_NOT_ALLOWED' }
      }
    }

    return { valid: true, sanitized: email }
  } catch (error) {
    return { valid: false, error: 'EMAIL_VALIDATION_FAILED' }
  }
}

/**
 * Validate and sanitize text input (names, messages, etc.)
 */
export function validateText(input: string, options: {
  minLength?: number
  maxLength?: number
  allowNull?: boolean
  allowedChars?: RegExp
} = {}): { valid: boolean; sanitized?: string; error?: string } {
  const {
    minLength = 0,
    maxLength = 1000,
    allowNull = false,
    allowedChars,
  } = options

  try {
    const sanitized = sanitizeString(input, { maxLength, allowNull })

    if (sanitized === null) {
      if (allowNull) return { valid: true, sanitized: '' }
      return { valid: false, error: 'VALUE_REQUIRED' }
    }

    if (minLength > 0 && sanitized.length < minLength) {
      return { valid: false, error: `VALUE_TOO_SHORT (min ${minLength} chars)` }
    }

    if (sanitized.length > maxLength) {
      return { valid: false, error: `VALUE_TOO_LONG (max ${maxLength} chars)` }
    }

    // Check for allowed character patterns
    if (allowedChars && !allowedChars.test(sanitized)) {
      return { valid: false, error: 'INVALID_CHARACTERS' }
    }

    return { valid: true, sanitized }
  } catch (error) {
    return { valid: false, error: (error as Error).message }
  }
}

/**
 * Security event logging for validation failures
 */
export function logValidationFailure(event: {
  type: string
  input: string
  ip?: string
  userAgent?: string
}) {
  const timestamp = new Date().toISOString()
  // Sanitize input for logging to prevent log injection
  const safeInput = (event.input || '').replace(/[\n\r\t]/g, ' ').substring(0, 100)

  console.warn(JSON.stringify({
    timestamp,
    security_event: 'validation_failure',
    event_type: event.type,
    input_preview: safeInput,
    ip: event.ip,
    user_agent: event.userAgent,
  }))
}

/**
 * Re-export for convenience
 */
export const validators = {
  url: validateUrl,
  email: validateEmail,
  text: validateText,
  string: sanitizeString,
}
