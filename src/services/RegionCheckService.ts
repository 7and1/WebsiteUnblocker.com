import { checkWebsite } from '@/services/WebsiteCheckService'
import { logger } from '@/lib/logger'
import { globalpingCircuitBreaker, CircuitBreakerOpenError, withRetry } from '@/lib/resilience'

export type RegionCheckStatus = 'accessible' | 'blocked' | 'error' | 'unknown'
export type RegionCheckSource = 'edge' | 'globalping' | 'dns'

export interface RegionCheckResult {
  region: string
  label: string
  status: RegionCheckStatus
  latency: number | null
  code?: number
  source: RegionCheckSource
  details?: string
}

export interface MultiRegionCheckResult {
  edge: {
    status: 'accessible' | 'blocked' | 'error'
    code?: number
    latency: number
    target: string
    error?: string
    blockReason?: string
  }
  regions: RegionCheckResult[]
  summary: {
    accessible: number
    blocked: number
    error: number
    unknown: number
  }
}

const GLOBALPING_API = 'https://api.globalping.io'
const GLOBALPING_USER_AGENT = 'WebsiteUnblocker/1.0 (+https://websiteunblocker.com)'
const GLOBALPING_MAX_ATTEMPTS = 4

const GLOBALPING_REGIONS = [
  { key: 'us', label: 'United States', location: { country: 'US', limit: 1 } },
  { key: 'eu', label: 'Europe (Germany)', location: { country: 'DE', limit: 1 } },
  { key: 'asia', label: 'Asia (Singapore)', location: { country: 'SG', limit: 1 } },
  { key: 'cn', label: 'China', location: { country: 'CN', limit: 1 } },
]

const BLOCKED_HTTP_CODES = new Set([401, 403, 407, 429, 451])

function summarize(regions: RegionCheckResult[]) {
  return regions.reduce(
    (acc, region) => {
      acc[region.status] += 1
      return acc
    },
    { accessible: 0, blocked: 0, error: 0, unknown: 0 }
  )
}

function mapHttpStatus(statusCode?: number): RegionCheckStatus {
  if (!statusCode) return 'error'
  if (statusCode >= 200 && statusCode < 400) return 'accessible'
  if (BLOCKED_HTTP_CODES.has(statusCode)) return 'blocked'
  if (statusCode >= 400 && statusCode < 500) return 'blocked'
  if (statusCode >= 500) return 'error'
  return 'error'
}

function toEdgeRegion(label: string, status: RegionCheckStatus, latency: number, code?: number): RegionCheckResult {
  return {
    region: 'edge',
    label,
    status,
    latency,
    code,
    source: 'edge',
  }
}

async function createGlobalpingMeasurement(hostname: string, protocol: 'HTTP' | 'HTTPS') {
  const payload = {
    type: 'http',
    target: hostname,
    locations: GLOBALPING_REGIONS.map((region) => region.location),
    inProgressUpdates: true,
    measurementOptions: {
      protocol,
      request: {
        method: 'HEAD',
        path: '/',
      },
    },
  }

  return globalpingCircuitBreaker.execute(async () => {
    const { value } = await withRetry(async () => {
      const response = await fetch(`${GLOBALPING_API}/v1/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'User-Agent': GLOBALPING_USER_AGENT,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        const error = new Error(`Globalping create failed (${response.status}): ${errorText}`) as Error & { retryable?: boolean }
        error.retryable = response.status >= 500 || response.status === 429
        throw error
      }

      const data = (await response.json()) as { id?: string }
      if (!data.id) {
        throw new Error('Globalping create failed: missing measurement id')
      }

      return data.id
    }, { maxAttempts: 3, initialDelayMs: 500, maxDelayMs: 3000 })

    return value
  })
}

async function fetchGlobalpingMeasurement(id: string) {
  const response = await fetch(`${GLOBALPING_API}/v1/measurements/${id}`, {
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'User-Agent': GLOBALPING_USER_AGENT,
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Globalping fetch failed (${response.status}): ${errorText}`)
  }

  return response.json() as Promise<{
    status?: string
    results?: Array<{
      probe?: { country?: string; city?: string; region?: string }
      result?: {
        status?: string
        statusCode?: number
        statusCodeName?: string
        timings?: { total?: number | null }
        error?: string
      }
    }>
  }>
}

async function pollGlobalpingResults(id: string) {
  let measurement = await fetchGlobalpingMeasurement(id)

  for (let attempt = 0; attempt < GLOBALPING_MAX_ATTEMPTS; attempt += 1) {
    if (measurement.status && measurement.status !== 'in-progress') {
      return measurement
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
    measurement = await fetchGlobalpingMeasurement(id)
  }

  return measurement
}

function buildGlobalpingRegions(measurement: Awaited<ReturnType<typeof fetchGlobalpingMeasurement>>): RegionCheckResult[] {
  const results = measurement.results ?? []
  const byCountry = new Map<string, typeof results[number]>()

  for (const item of results) {
    const country = item.probe?.country
    if (country && !byCountry.has(country)) {
      byCountry.set(country, item)
    }
  }

  return GLOBALPING_REGIONS.map((region) => {
    const item = byCountry.get(region.location.country)
    if (!item || !item.result) {
      return {
        region: region.key,
        label: region.label,
        status: 'unknown',
        latency: null,
        source: 'globalping',
        details: 'No probe data available',
      }
    }

    const status = item.result.status
    const statusCode = item.result.statusCode
    const latency = item.result.timings?.total ?? null

    if (status === 'finished') {
      return {
        region: region.key,
        label: region.label,
        status: mapHttpStatus(statusCode),
        latency,
        code: statusCode,
        source: 'globalping',
        details: item.result.statusCodeName,
      }
    }

    if (status === 'failed' || status === 'offline') {
      return {
        region: region.key,
        label: region.label,
        status: 'error',
        latency,
        source: 'globalping',
        details: item.result.error || 'Probe failed',
      }
    }

    return {
      region: region.key,
      label: region.label,
      status: 'unknown',
      latency,
      source: 'globalping',
      details: 'Probe still running',
    }
  })
}

async function checkFilteredDns(hostname: string): Promise<RegionCheckResult> {
  const start = Date.now()
  try {
    const response = await fetch(
      `https://family.cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`,
      {
        headers: {
          Accept: 'application/dns-json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`DNS query failed (${response.status})`)
    }

    const data = (await response.json()) as {
      Status?: number
      Answer?: Array<{ data?: string }>
    }

    const latency = Date.now() - start
    const answers = data.Answer ?? []
    const hasNullRoute = answers.some((answer) => answer.data === '0.0.0.0' || answer.data === '::')

    if (data.Status === 0 && answers.length > 0 && !hasNullRoute) {
      return {
        region: 'school',
        label: 'School/Work DNS (filtered)',
        status: 'accessible',
        latency,
        source: 'dns',
        details: 'Family-safe DNS result',
      }
    }

    if (data.Status === 0 && (answers.length === 0 || hasNullRoute)) {
      return {
        region: 'school',
        label: 'School/Work DNS (filtered)',
        status: 'blocked',
        latency,
        source: 'dns',
        details: 'Filtered by family-safe DNS',
      }
    }

    return {
      region: 'school',
      label: 'School/Work DNS (filtered)',
      status: 'error',
      latency,
      source: 'dns',
      details: 'DNS resolution failed',
    }
  } catch (error) {
    return {
      region: 'school',
      label: 'School/Work DNS (filtered)',
      status: 'error',
      latency: Date.now() - start,
      source: 'dns',
      details: error instanceof Error ? error.message : 'DNS query failed',
    }
  }
}

export async function checkMultiRegion(
  targetUrl: string,
  options?: { requestId?: string }
): Promise<MultiRegionCheckResult> {
  const url = new URL(targetUrl)
  const protocol = url.protocol === 'http:' ? 'HTTP' : 'HTTPS'

  const edgeResult = await checkWebsite(targetUrl, {
    timeout: 5000,
    maxRetries: 1,
    requestId: options?.requestId,
  })

  const edgeStatus: RegionCheckStatus = edgeResult.isAccessible ? 'accessible' : edgeResult.status === 'blocked' ? 'blocked' : 'error'
  const regionRows: RegionCheckResult[] = [
    toEdgeRegion('Edge (closest)', edgeStatus, edgeResult.latency, edgeResult.code),
  ]

  const dnsPromise = checkFilteredDns(url.hostname)

  try {
    const measurementId = await createGlobalpingMeasurement(url.hostname, protocol)
    const measurement = await pollGlobalpingResults(measurementId)
    regionRows.push(...buildGlobalpingRegions(measurement))
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      logger.warn('Globalping circuit breaker is open, skipping region checks', {
        target: url.hostname,
        stats: error.stats,
      })
    } else {
      logger.warn('Globalping measurement failed', {
        target: url.hostname,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  regionRows.push(await dnsPromise)

  const summary = summarize(regionRows)

  return {
    edge: {
      status: edgeResult.isAccessible ? 'accessible' : edgeResult.status === 'blocked' ? 'blocked' : 'error',
      code: edgeResult.code,
      latency: edgeResult.latency,
      target: edgeResult.target,
      error: edgeResult.error,
      blockReason: edgeResult.blockReason,
    },
    regions: regionRows,
    summary,
  }
}
