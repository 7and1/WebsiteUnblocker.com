export type CheckStatus = 'accessible' | 'blocked' | 'error'

export interface CheckResult {
  status: CheckStatus
  code?: number
  latency: number
  target: string
  error?: string
}

export interface DiagnosisState {
  url: string
  loading: boolean
  result: CheckResult | null
  error: string | null
}
