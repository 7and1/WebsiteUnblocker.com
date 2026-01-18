import type { CheckResult } from '@/components/features/DiagnosisTool/types'

export async function checkWebsite(url: string): Promise<CheckResult> {
  const response = await fetch(`/api/check?url=${encodeURIComponent(url)}`)
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    throw new Error(errorPayload?.error?.message || 'Request failed')
  }
  return response.json()
}
