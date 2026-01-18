import { useCallback, useState } from 'react'
import { checkWebsite } from '@/lib/api/check'
import type { CheckResult, DiagnosisState } from './types'

export function useDiagnosis(initialUrl = '') {
  const [state, setState] = useState<DiagnosisState>({
    url: initialUrl,
    loading: false,
    result: null,
    error: null,
  })

  const setUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, url }))
  }, [])

  const runCheck = useCallback(async () => {
    if (!state.url.trim()) return
    setState((prev) => ({ ...prev, loading: true, result: null, error: null }))

    try {
      const data: CheckResult = await checkWebsite(state.url.trim())
      setTimeout(() => {
        setState((prev) => ({ ...prev, result: data, loading: false }))
      }, 600)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to check'
      setState((prev) => ({
        ...prev,
        loading: false,
        result: {
          status: 'error',
          latency: 0,
          target: state.url.trim(),
          error: message,
        },
        error: message,
      }))
    }
  }, [state.url])

  return { state, setUrl, runCheck }
}
