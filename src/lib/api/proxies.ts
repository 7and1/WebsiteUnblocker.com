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

export async function fetchProxyRoutes(limit = 10): Promise<ProxyRouteResponse> {
  const response = await fetch(`/api/proxies?limit=${limit}`)
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    throw new Error(errorPayload?.error?.message || 'Unable to load proxy routes')
  }
  return response.json()
}
