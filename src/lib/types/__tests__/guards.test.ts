/**
 * Type Guards Tests
 */

import { describe, it, expect } from 'vitest'
import {
  isCheckResult,
  isRegionCheckResult,
  isMultiRegionCheckResult,
  isWebsiteCheckResult,
  isPostSummary,
  isPostSummaryArray,
  isApiResponse,
  isErrorWithCode,
} from '../guards'

describe('isCheckResult', () => {
  it('should return true for valid CheckResult', () => {
    const valid = {
      status: 'accessible',
      latency: 123,
      target: 'https://example.com',
    }
    expect(isCheckResult(valid)).toBe(true)
  })

  it('should return true for blocked status', () => {
    const valid = {
      status: 'blocked',
      latency: 456,
      target: 'https://example.com',
      code: 403,
    }
    expect(isCheckResult(valid)).toBe(true)
  })

  it('should return true for error status', () => {
    const valid = {
      status: 'error',
      latency: 0,
      target: 'https://example.com',
      code: 500,
    }
    expect(isCheckResult(valid)).toBe(true)
  })

  it('should return false for invalid status', () => {
    const invalid = {
      status: 'invalid',
      latency: 123,
      target: 'https://example.com',
    }
    expect(isCheckResult(invalid)).toBe(false)
  })

  it('should return false for non-object', () => {
    expect(isCheckResult(null)).toBe(false)
    expect(isCheckResult(undefined)).toBe(false)
    expect(isCheckResult('string')).toBe(false)
    expect(isCheckResult(123)).toBe(false)
  })

  it('should return false for missing required fields', () => {
    expect(isCheckResult({})).toBe(false)
    expect(isCheckResult({ status: 'accessible' })).toBe(false)
    expect(isCheckResult({ status: 'accessible', latency: 123 })).toBe(false)
  })

  it('should return false for wrong types', () => {
    expect(isCheckResult({
      status: 'accessible',
      latency: '123',
      target: 'https://example.com',
    })).toBe(false)
  })
})

describe('isRegionCheckResult', () => {
  it('should return true for valid RegionCheckResult', () => {
    const valid = {
      region: 'us',
      label: 'United States',
      status: 'accessible',
      latency: 100,
      source: 'globalping',
    }
    expect(isRegionCheckResult(valid)).toBe(true)
  })

  it('should accept null latency', () => {
    const valid = {
      region: 'eu',
      label: 'Europe',
      status: 'blocked',
      latency: null,
      source: 'edge',
    }
    expect(isRegionCheckResult(valid)).toBe(true)
  })

  it('should accept all valid statuses', () => {
    const base = {
      region: 'us',
      label: 'US',
      latency: 100,
      source: 'edge' as const,
    }

    expect(isRegionCheckResult({ ...base, status: 'accessible' })).toBe(true)
    expect(isRegionCheckResult({ ...base, status: 'blocked' })).toBe(true)
    expect(isRegionCheckResult({ ...base, status: 'error' })).toBe(true)
    expect(isRegionCheckResult({ ...base, status: 'unknown' })).toBe(true)
  })

  it('should accept all valid sources', () => {
    const base = {
      region: 'us',
      label: 'US',
      status: 'accessible' as const,
      latency: 100,
    }

    expect(isRegionCheckResult({ ...base, source: 'edge' })).toBe(true)
    expect(isRegionCheckResult({ ...base, source: 'globalping' })).toBe(true)
    expect(isRegionCheckResult({ ...base, source: 'dns' })).toBe(true)
  })

  it('should reject invalid values', () => {
    expect(isRegionCheckResult(null)).toBe(false)
    expect(isRegionCheckResult({})).toBe(false)
    expect(isRegionCheckResult({
      region: 'us',
      label: 'US',
      status: 'invalid',
      latency: 100,
      source: 'edge',
    })).toBe(false)
  })
})

describe('isMultiRegionCheckResult', () => {
  it('should return true for valid MultiRegionCheckResult', () => {
    const valid = {
      edge: {
        status: 'accessible',
        latency: 50,
        target: 'https://example.com',
      },
      regions: [],
      summary: {
        accessible: 1,
        blocked: 0,
        error: 0,
        unknown: 0,
      },
    }
    expect(isMultiRegionCheckResult(valid)).toBe(true)
  })

  it('should require edge, regions, and summary', () => {
    expect(isMultiRegionCheckResult({
      edge: { status: 'accessible', latency: 50, target: 'https://example.com' },
      regions: [],
      summary: { accessible: 0, blocked: 0, error: 0, unknown: 0 },
    })).toBe(true)

    expect(isMultiRegionCheckResult({
      edge: { status: 'accessible', latency: 50, target: 'https://example.com' },
      regions: [],
    })).toBe(false)

    expect(isMultiRegionCheckResult({
      edge: null,
      regions: [],
      summary: { accessible: 0, blocked: 0, error: 0, unknown: 0 },
    })).toBe(false)
  })

  it('should require regions to be array', () => {
    const valid = {
      edge: { status: 'accessible', latency: 50, target: 'https://example.com' },
      regions: [],
      summary: { accessible: 0, blocked: 0, error: 0, unknown: 0 },
    }
    expect(isMultiRegionCheckResult(valid)).toBe(true)

    const invalid = {
      edge: { status: 'accessible', latency: 50, target: 'https://example.com' },
      regions: 'not-an-array',
      summary: { accessible: 0, blocked: 0, error: 0, unknown: 0 },
    }
    expect(isMultiRegionCheckResult(invalid)).toBe(false)
  })
})

describe('isWebsiteCheckResult', () => {
  it('should return true for valid WebsiteCheckResult', () => {
    const valid = {
      status: 'accessible',
      latency: 100,
      target: 'https://example.com',
      isAccessible: true,
    }
    expect(isWebsiteCheckResult(valid)).toBe(true)
  })

  it('should require isAccessible boolean', () => {
    const valid = {
      status: 'accessible',
      latency: 100,
      target: 'https://example.com',
      isAccessible: true,
    }
    expect(isWebsiteCheckResult(valid)).toBe(true)

    const invalid = {
      status: 'accessible',
      latency: 100,
      target: 'https://example.com',
      isAccessible: 'true',
    }
    expect(isWebsiteCheckResult(invalid)).toBe(false)
  })
})

describe('isPostSummary', () => {
  it('should return true for valid PostSummary with string id', () => {
    const valid = {
      id: 'post-123',
      title: 'Test Post',
      slug: 'test-post',
    }
    expect(isPostSummary(valid)).toBe(true)
  })

  it('should return true for valid PostSummary with number id', () => {
    const valid = {
      id: 123,
      title: 'Test Post',
      slug: 'test-post',
    }
    expect(isPostSummary(valid)).toBe(true)
  })

  it('should accept optional published_date', () => {
    const base = {
      id: '123',
      title: 'Test',
      slug: 'test',
    }

    expect(isPostSummary(base)).toBe(true)
    expect(isPostSummary({ ...base, published_date: '2024-01-01' })).toBe(true)
    expect(isPostSummary({ ...base, published_date: new Date() })).toBe(true)
  })

  it('should accept optional tags array', () => {
    const base = {
      id: '123',
      title: 'Test',
      slug: 'test',
    }

    expect(isPostSummary(base)).toBe(true)
    expect(isPostSummary({ ...base, tags: ['tag1', 'tag2'] })).toBe(true)
  })

  it('should reject invalid values', () => {
    expect(isPostSummary(null)).toBe(false)
    expect(isPostSummary({})).toBe(false)
    expect(isPostSummary({
      id: '123',
      title: 'Test',
      // Missing slug
    })).toBe(false)
  })
})

describe('isPostSummaryArray', () => {
  it('should return true for array of valid PostSummary items', () => {
    const valid = [
      { id: '1', title: 'Post 1', slug: 'post-1' },
      { id: '2', title: 'Post 2', slug: 'post-2' },
    ]
    expect(isPostSummaryArray(valid)).toBe(true)
  })

  it('should return false for non-array', () => {
    expect(isPostSummaryArray(null)).toBe(false)
    expect(isPostSummaryArray({})).toBe(false)
    expect(isPostSummaryArray('not-array')).toBe(false)
  })

  it('should return false if any item is invalid', () => {
    const mixed = [
      { id: '1', title: 'Post 1', slug: 'post-1' },
      { id: '2', title: 'Post 2' }, // Missing slug
    ]
    expect(isPostSummaryArray(mixed)).toBe(false)
  })

  it('should return true for empty array', () => {
    expect(isPostSummaryArray([])).toBe(true)
  })
})

describe('isApiResponse', () => {
  it('should return true for valid API response without error', () => {
    expect(isApiResponse({ data: 'test' })).toBe(true)
    expect(isApiResponse({ status: 'ok' })).toBe(true)
  })

  it('should return true for API response with error', () => {
    expect(isApiResponse({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
      },
    })).toBe(true)
  })

  it('should return false for API response with null error (null is not an object)', () => {
    // The guard requires error to be either undefined or an object
    // null is typeof 'object' in JS, but we check !== null separately
    expect(isApiResponse({ error: null })).toBe(false)
  })

  it('should return true for empty object', () => {
    expect(isApiResponse({})).toBe(true)
  })

  it('should return false for non-object', () => {
    expect(isApiResponse(null)).toBe(false)
    expect(isApiResponse(undefined)).toBe(false)
    expect(isApiResponse('string')).toBe(false)
  })

  it('should return false for primitive error', () => {
    expect(isApiResponse({ error: 'error string' })).toBe(false)
  })
})

describe('isErrorWithCode', () => {
  it('should return true for valid error with code', () => {
    const valid = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
    }
    expect(isErrorWithCode(valid)).toBe(true)
  })

  it('should return false for missing code', () => {
    const invalid = {
      message: 'Error message',
    }
    expect(isErrorWithCode(invalid)).toBe(false)
  })

  it('should return false for missing message', () => {
    const invalid = {
      code: 'ERROR',
    }
    expect(isErrorWithCode(invalid)).toBe(false)
  })

  it('should return false for non-string code', () => {
    const invalid = {
      code: 123,
      message: 'Error',
    }
    expect(isErrorWithCode(invalid)).toBe(false)
  })

  it('should return false for non-object', () => {
    expect(isErrorWithCode(null)).toBe(false)
    expect(isErrorWithCode(undefined)).toBe(false)
  })
})
