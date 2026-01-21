/**
 * Check-related Type Definitions
 *
 * Unified types for website accessibility checking across all regions and services.
 */

export type CheckStatus = 'accessible' | 'blocked' | 'error' | 'timeout' | 'dns_error' | 'unknown'
export type RegionCheckStatus = CheckStatus | 'unknown'

export interface CheckResult {
  status: CheckStatus
  code?: number
  latency: number
  target: string
  error?: string
  blockReason?: string
  regions?: RegionCheckResult[]
  summary?: CheckSummary
}

export interface RegionCheckResult {
  region: string
  label: string
  status: RegionCheckStatus
  latency: number | null
  code?: number
  source: 'edge' | 'globalping' | 'dns'
  details?: string
}

export interface CheckSummary {
  accessible: number
  blocked: number
  error: number
  unknown: number
}
