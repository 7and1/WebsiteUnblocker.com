/**
 * Input Validation Middleware Tests
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  validateUrl,
  validateEmail,
  validateText,
} from '../validation'

describe('sanitizeString', () => {
  it('should trim whitespace by default', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('should not trim when disabled', () => {
    expect(sanitizeString('  hello  ', { trim: false })).toBe('  hello  ')
  })

  it('should remove null bytes', () => {
    expect(sanitizeString('hello\0world')).toBe('helloworld')
  })

  it('should throw on script tags', () => {
    expect(() => sanitizeString('<script>alert(1)</script>')).toThrow(
      'potentially dangerous content'
    )
  })

  it('should throw on javascript: protocol', () => {
    expect(() => sanitizeString('javascript:alert(1)')).toThrow(
      'potentially dangerous content'
    )
  })

  it('should throw on event handlers', () => {
    expect(() => sanitizeString('onclick=alert(1)')).toThrow(
      'potentially dangerous content'
    )
  })

  it('should throw on iframe tags', () => {
    expect(() => sanitizeString('<iframe src="evil.com">')).toThrow(
      'potentially dangerous content'
    )
  })

  it('should throw when exceeding max length', () => {
    expect(() => sanitizeString('a'.repeat(101), { maxLength: 100 })).toThrow(
      'exceeds maximum length'
    )
  })

  it('should return empty string for null when allowNull is false', () => {
    expect(sanitizeString(null as unknown as string)).toBe('')
  })

  it('should return null for null when allowNull is true', () => {
    expect(sanitizeString(null as unknown as string, { allowNull: true })).toBeNull()
  })
})

describe('validateUrl', () => {
  it('should validate valid HTTPS URL', () => {
    const result = validateUrl('https://example.com')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('https://example.com')
  })

  it('should validate valid HTTP URL', () => {
    const result = validateUrl('http://example.com')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('http://example.com')
  })

  it('should add https:// to URLs without protocol', () => {
    const result = validateUrl('example.com')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('https://example.com')
  })

  it('should reject invalid protocols', () => {
    const result = validateUrl('ftp://example.com')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INVALID_PROTOCOL')
  })

  it('should reject URLs with credentials', () => {
    const result = validateUrl('https://user:pass@example.com')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('URL_CONTAINS_CREDENTIALS')
  })

  it('should allow credentials when enabled', () => {
    const result = validateUrl('https://user:pass@example.com', {
      allowUserPass: true,
    })
    expect(result.valid).toBe(true)
  })

  // SSRF Protection Tests
  it('should reject localhost', () => {
    const result = validateUrl('https://localhost')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INTERNAL_ADDRESS_NOT_ALLOWED')
  })

  it('should reject 127.0.0.1', () => {
    const result = validateUrl('https://127.0.0.1')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INTERNAL_ADDRESS_NOT_ALLOWED')
  })

  it('should reject 10.x.x.x private IPs', () => {
    const result = validateUrl('https://10.0.0.1')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INTERNAL_ADDRESS_NOT_ALLOWED')
  })

  it('should reject 172.16-31.x.x private IPs', () => {
    const result = validateUrl('https://172.16.0.1')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INTERNAL_ADDRESS_NOT_ALLOWED')
  })

  it('should reject 192.168.x.x private IPs', () => {
    const result = validateUrl('https://192.168.1.1')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INTERNAL_ADDRESS_NOT_ALLOWED')
  })

  it('should reject AWS metadata IP (169.254.x.x)', () => {
    const result = validateUrl('https://169.254.169.254')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INTERNAL_ADDRESS_NOT_ALLOWED')
  })

  it('should reject 0.0.0.0', () => {
    const result = validateUrl('https://0.0.0.0')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INTERNAL_ADDRESS_NOT_ALLOWED')
  })

  it('should reject IPv6 loopback', () => {
    const result = validateUrl('https://[::1]')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INTERNAL_ADDRESS_NOT_ALLOWED')
  })

  it('should reject empty URL', () => {
    const result = validateUrl('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('URL_REQUIRED')
  })

  it('should reject invalid URL format', () => {
    const result = validateUrl('not a url at all !!!')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INVALID_URL_FORMAT')
  })

  it('should handle URL with path', () => {
    const result = validateUrl('https://example.com/path/to/page')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('https://example.com/path/to/page')
  })

  it('should handle URL with query string', () => {
    const result = validateUrl('https://example.com?foo=bar')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('https://example.com/?foo=bar')
  })
})

describe('validateEmail', () => {
  it('should validate valid email', () => {
    const result = validateEmail('test@example.com')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('test@example.com')
  })

  it('should lowercase email', () => {
    const result = validateEmail('Test@Example.COM')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('test@example.com')
  })

  it('should reject email without @', () => {
    const result = validateEmail('testexample.com')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INVALID_EMAIL_FORMAT')
  })

  it('should reject email without domain', () => {
    const result = validateEmail('test@')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INVALID_EMAIL_FORMAT')
  })

  it('should reject email with double dots', () => {
    const result = validateEmail('test..user@example.com')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INVALID_EMAIL_FORMAT')
  })

  it('should reject empty email', () => {
    const result = validateEmail('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('EMAIL_REQUIRED')
  })

  it('should validate email with subdomain', () => {
    const result = validateEmail('test@mail.example.com')
    expect(result.valid).toBe(true)
  })

  it('should validate email with plus sign', () => {
    const result = validateEmail('test+tag@example.com')
    expect(result.valid).toBe(true)
  })

  it('should reject disposable emails when enabled', () => {
    const result = validateEmail('test@mailinator.com', { checkDisposable: true })
    expect(result.valid).toBe(false)
    expect(result.error).toBe('DISPOSABLE_EMAIL_NOT_ALLOWED')
  })
})

describe('validateText', () => {
  it('should validate valid text', () => {
    const result = validateText('Hello World')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('Hello World')
  })

  it('should reject text below min length', () => {
    const result = validateText('Hi', { minLength: 5 })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('TOO_SHORT')
  })

  it('should reject text above max length', () => {
    const result = validateText('a'.repeat(101), { maxLength: 100 })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('exceeds maximum length')
  })

  it('should allow empty when allowNull is true', () => {
    const result = validateText('', { allowNull: true })
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('')
  })

  it('should reject text with invalid characters', () => {
    const result = validateText('Hello123', { allowedChars: /^[a-zA-Z\s]+$/ })
    expect(result.valid).toBe(false)
    expect(result.error).toBe('INVALID_CHARACTERS')
  })

  it('should accept text matching allowed pattern', () => {
    const result = validateText('Hello World', { allowedChars: /^[a-zA-Z\s]+$/ })
    expect(result.valid).toBe(true)
  })
})
