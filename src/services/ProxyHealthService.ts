import { proxyProviders, type ProxyProvider } from '@/config/proxies'
import { checkWebsite } from '@/services/WebsiteCheckService'
import { logger } from '@/lib/logger'

export type ProxyHealthStatus = 'online' | 'degraded' | 'offline' | 'unknown'

export interface ProxyRouteHealth {
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

export interface ProxyHealthSnapshot {
  checkedAt: string
  ttl: number
  routes: ProxyRouteHealth[]
}

const DEFAULT_TIMEOUT = 4500
const DEFAULT_LIMIT = 10
const CONCURRENCY = 4

const HEAD_FALLBACK_CODES = new Set([405])

function normalizeStatus(result: { isAccessible: boolean; status: string; code?: number }): ProxyHealthStatus {
  if (result.isAccessible) return 'online'

  switch (result.status) {
    case 'timeout':
    case 'dns_error':
    case 'connection_refused':
    case 'ssl_error':
      return 'offline'
    case 'blocked':
    case 'server_error':
    case 'unknown':
    default:
      return 'degraded'
  }
}

function shouldFallbackToHttp(url: string, status: string): boolean {
  return url.startsWith('https://') && (status === 'ssl_error' || status === 'connection_refused')
}

async function runWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const current = cursor
      cursor += 1
      results[current] = await worker(items[current])
    }
  })

  await Promise.all(runners)
  return results
}

async function probeEndpoint(url: string) {
  const headResult = await checkWebsite(url, {
    timeout: DEFAULT_TIMEOUT,
    maxRetries: 0,
    method: 'HEAD',
    followRedirects: true,
  })

  if (!headResult.isAccessible && HEAD_FALLBACK_CODES.has(headResult.code ?? 0)) {
    return checkWebsite(url, {
      timeout: DEFAULT_TIMEOUT,
      maxRetries: 0,
      method: 'GET',
      followRedirects: true,
    })
  }

  if (!headResult.isAccessible && shouldFallbackToHttp(url, headResult.status)) {
    const httpUrl = url.replace('https://', 'http://')
    return checkWebsite(httpUrl, {
      timeout: DEFAULT_TIMEOUT,
      maxRetries: 0,
      method: 'HEAD',
      followRedirects: true,
    })
  }

  return headResult
}

async function checkProvider(provider: ProxyProvider): Promise<ProxyRouteHealth> {
  try {
    const result = await probeEndpoint(provider.url)
    const status = normalizeStatus(result)

    return {
      id: provider.id,
      name: provider.name,
      url: provider.url,
      region: provider.region,
      status,
      latency: result.latency ?? null,
      code: result.code,
      checked: true,
      notes: provider.notes,
    }
  } catch (error) {
    logger.warn('Proxy health check failed', {
      provider: provider.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return {
      id: provider.id,
      name: provider.name,
      url: provider.url,
      region: provider.region,
      status: 'offline',
      latency: null,
      checked: true,
      notes: provider.notes,
    }
  }
}

export async function getProxyHealthSnapshot(limit = DEFAULT_LIMIT): Promise<ProxyHealthSnapshot> {
  const safeLimit = Math.min(Math.max(limit, 3), 15)
  const ordered = [...proxyProviders].sort((a, b) => a.priority - b.priority)

  const checkedProviders = ordered.slice(0, safeLimit)
  const remainingProviders = ordered.slice(safeLimit)

  const checkedRoutes = await runWithConcurrency(checkedProviders, CONCURRENCY, checkProvider)

  const uncheckedRoutes: ProxyRouteHealth[] = remainingProviders.map((provider) => ({
    id: provider.id,
    name: provider.name,
    url: provider.url,
    region: provider.region,
    status: 'unknown',
    latency: null,
    checked: false,
    notes: provider.notes,
  }))

  return {
    checkedAt: new Date().toISOString(),
    ttl: 120,
    routes: [...checkedRoutes, ...uncheckedRoutes],
  }
}
