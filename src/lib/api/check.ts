import type { CheckResult } from '@/components/features/DiagnosisTool/types'
import { parseCheckResponse, isErrorResponse, type CheckResponse, type MultiRegionResponse } from '@/lib/validation/api'

async function parseApiError(response: Response): Promise<never> {
  const errorPayload = await response.json().catch(() => null)
  if (isErrorResponse(errorPayload)) {
    throw new Error(errorPayload.error.message)
  }
  throw new Error(`Request failed with status ${response.status}`)
}

export async function checkWebsite(url: string, mode: 'single' | 'multi' = 'multi'): Promise<CheckResult> {
  const params = new URLSearchParams({ url })
  if (mode === 'multi') {
    params.set('mode', 'multi')
  }
  const response = await fetch(`/api/check?${params.toString()}`)
  if (!response.ok) {
    return parseApiError(response)
  }
  const data = await response.json()
  return parseCheckResponse(data) as CheckResult
}

export async function checkWebsiteMulti(url: string): Promise<MultiRegionResponse> {
  const params = new URLSearchParams({ url, mode: 'multi' })
  const response = await fetch(`/api/check?${params.toString()}`)
  if (!response.ok) {
    return parseApiError(response)
  }
  const data = await response.json()
  return data as MultiRegionResponse
}
