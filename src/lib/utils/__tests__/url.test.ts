import { describe, it, expect } from 'vitest'
import { normalizeUrl, extractDomain, isValidUrl } from '../url'

describe('normalizeUrl', () => {
  it('adds https:// to bare domain', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com')
  })

  it('preserves existing http://', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com')
  })

  it('preserves existing https://', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com')
  })
})

describe('extractDomain', () => {
  it('extracts domain from full URL', () => {
    expect(extractDomain('https://www.example.com/path')).toBe('example.com')
  })
})

describe('isValidUrl', () => {
  it('returns true for valid domains', () => {
    expect(isValidUrl('google.com')).toBe(true)
    expect(isValidUrl('sub.domain.co.uk')).toBe(true)
  })

  it('returns false for invalid input', () => {
    expect(isValidUrl('')).toBe(false)
    expect(isValidUrl('not a url')).toBe(false)
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
  })
})
