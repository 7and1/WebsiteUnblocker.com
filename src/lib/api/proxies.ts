export type ProxyHealthStatus = 'online' | 'degraded' | 'offline' | 'unknown'

export interface ProxyRoute {
  id: string
  name: string
  url: string
  region: string
  status: ProxyHealthStatus
  latency: number | null
  code?: number
  checked: boolean
  notes?: string
}

export interface ProxyRouteResponse {
  checkedAt: string
  ttl: number
  routes: ProxyRoute[]
}

type ErrorPayload = {
  error?: {
    message?: string
  }
}

function getErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'Unable to load proxy routes'
  }

  const typedPayload = payload as ErrorPayload
  if (typeof typedPayload.error?.message === 'string' && typedPayload.error.message.length > 0) {
    return typedPayload.error.message
  }

  return 'Unable to load proxy routes'
}

export async function fetchProxyRoutes(limit = 10): Promise<ProxyRouteResponse> {
  const response = await fetch(`/api/proxies?limit=${limit}`)
  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as unknown
    throw new Error(getErrorMessage(errorPayload))
  }

  return (await response.json()) as ProxyRouteResponse
}
