import { normalizeUrl } from '@/lib/utils'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export type CheckTargetResult = {
  status: 'accessible' | 'blocked' | 'error'
  code?: number
  latency: number
  target: string
  error?: string
}

export async function checkTarget(rawUrl: string, timeoutMs = 5000): Promise<CheckTargetResult> {
  const normalized = normalizeUrl(rawUrl)
  if (!normalized) {
    return {
      status: 'error',
      latency: 0,
      target: rawUrl,
      error: 'Invalid URL format',
    }
  }

  const startTime = Date.now()

  try {
    const response = await fetch(normalized, {
      method: 'HEAD',
      headers: {
        'User-Agent': USER_AGENT,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    })

    return {
      status: response.ok ? 'accessible' : 'error',
      code: response.status,
      latency: Date.now() - startTime,
      target: normalized,
    }
  } catch (error) {
    return {
      status: 'blocked',
      latency: Date.now() - startTime,
      target: normalized,
      error: 'Connection Timeout or Blocked',
    }
  }
}
