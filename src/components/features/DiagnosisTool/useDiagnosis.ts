import { useCallback, useRef, useState } from 'react'
import { checkWebsite } from '@/lib/api/check'
import type { CheckResult, DiagnosisState } from './types'

export function useDiagnosis(initialUrl = '') {
  const [state, setState] = useState<DiagnosisState>({
    url: initialUrl,
    loading: false,
    result: null,
    error: null,
  })

  // Use ref to track current URL and avoid race conditions
  const urlRef = useRef(initialUrl)

  const setUrl = useCallback((url: string) => {
    urlRef.current = url
    setState((prev) => ({ ...prev, url }))
  }, [])

  const runCheck = useCallback(async (urlOverride?: string) => {
    const rawUrl = urlOverride ?? urlRef.current ?? ''
    const targetUrl = typeof rawUrl === 'string' ? rawUrl.trim() : ''
    if (!targetUrl) return

    setState((prev) => ({ ...prev, loading: true, result: null, error: null }))

    try {
      const data: CheckResult = await checkWebsite(targetUrl)
      // Only update if URL hasn't changed during the request
      const currentUrl = typeof urlRef.current === 'string' ? urlRef.current.trim() : ''
      if (targetUrl === currentUrl) {
        setState((prev) => ({ ...prev, result: data, loading: false }))
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to check'
      // Only update if URL hasn't changed during the request
      const currentUrl = typeof urlRef.current === 'string' ? urlRef.current.trim() : ''
      if (targetUrl === currentUrl) {
        setState((prev) => ({
          ...prev,
          loading: false,
          result: {
            status: 'error',
            latency: 0,
            target: targetUrl,
            error: message,
          },
          error: message,
        }))
      }
    }
  }, [])

  return { state, setUrl, runCheck }
}
