/**
 * Type Guards for API Responses
 *
 * Runtime type checking for API responses to ensure data integrity.
 */

import type { CheckResult } from '@/components/features/DiagnosisTool/types'
import type { RegionCheckResult, MultiRegionCheckResult } from '@/services/RegionCheckService'
import type { WebsiteCheckResult } from '@/services/WebsiteCheckService'
import type { PostSummary } from '@/repositories'

export function isCheckResult(value: unknown): value is CheckResult {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.status === 'string' &&
    ['accessible', 'blocked', 'error'].includes(v.status) &&
    typeof v.latency === 'number' &&
    typeof v.target === 'string' &&
    (v.code === undefined || typeof v.code === 'number')
  )
}

export function isRegionCheckResult(value: unknown): value is RegionCheckResult {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.region === 'string' &&
    typeof v.label === 'string' &&
    typeof v.status === 'string' &&
    ['accessible', 'blocked', 'error', 'unknown'].includes(v.status) &&
    (v.latency === null || typeof v.latency === 'number') &&
    typeof v.source === 'string' &&
    ['edge', 'globalping', 'dns'].includes(v.source)
  )
}

export function isMultiRegionCheckResult(value: unknown): value is MultiRegionCheckResult {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.edge === 'object' && v.edge !== null &&
    typeof v.regions === 'object' && Array.isArray(v.regions) &&
    typeof v.summary === 'object' && v.summary !== null
  )
}

export function isWebsiteCheckResult(value: unknown): value is WebsiteCheckResult {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.status === 'string' &&
    typeof v.latency === 'number' &&
    typeof v.target === 'string' &&
    typeof v.isAccessible === 'boolean'
  )
}

export function isPostSummary(value: unknown): value is PostSummary {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    (typeof v.id === 'string' || typeof v.id === 'number') &&
    typeof v.title === 'string' &&
    typeof v.slug === 'string' &&
    (v.published_date === undefined || typeof v.published_date === 'string' || typeof v.published_date === 'object') &&
    (v.tags === undefined || Array.isArray(v.tags))
  )
}

export function isPostSummaryArray(value: unknown): value is PostSummary[] {
  return Array.isArray(value) && value.every(isPostSummary)
}

export function isApiResponse(value: unknown): value is { error?: { code?: string; message?: string } } {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    v.error === undefined ||
    (typeof v.error === 'object' && v.error !== null)
  )
}

export function isErrorWithCode(value: unknown): value is { code: string; message: string } {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.code === 'string' &&
    typeof v.message === 'string'
  )
}
