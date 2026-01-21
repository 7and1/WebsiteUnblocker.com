export type CheckStatus = 'accessible' | 'blocked' | 'error'
export type RegionCheckStatus = 'accessible' | 'blocked' | 'error' | 'unknown'

export interface RegionCheckResult {
  region: string
  label: string
  status: RegionCheckStatus
  latency: number | null
  code?: number
  source?: 'edge' | 'globalping' | 'dns'
  details?: string
}

export interface CheckResult {
  status: CheckStatus
  code?: number
  latency: number
  target: string
  error?: string
  blockReason?: string
  regions?: RegionCheckResult[]
  summary?: {
    accessible: number
    blocked: number
    error: number
    unknown: number
  }
}

export interface DiagnosisState {
  url: string
  loading: boolean
  result: CheckResult | null
  error: string | null
}
