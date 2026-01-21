'use client'

import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Router, Activity } from 'lucide-react'
import { Badge } from '@/components/ui'
import { fetchProxyRoutes, type ProxyRoute, type ProxyRouteResponse } from '@/lib/api/proxies'
import { proxyProviders } from '@/config/proxies'

type ProxyRoutesProps = {
  enabled?: boolean
  limit?: number
}

const statusMeta: Record<
  ProxyRoute['status'],
  { label: string; variant: 'success' | 'warning' | 'error' | 'default' }
> = {
  online: { label: 'Fast', variant: 'success' },
  degraded: { label: 'Slow', variant: 'warning' },
  offline: { label: 'Offline', variant: 'error' },
  unknown: { label: 'Unverified', variant: 'default' },
}

export function ProxyRoutes({ enabled = true, limit = 10 }: ProxyRoutesProps) {
  const [data, setData] = useState<ProxyRouteResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const fallbackData = useMemo<ProxyRouteResponse>(() => {
    const routes: ProxyRoute[] = proxyProviders.map((provider) => ({
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
      routes,
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    let isActive = true
    setLoading(true)
    setError(null)

    fetchProxyRoutes(limit)
      .then((response) => {
        if (!isActive) return
        setData(response)
      })
      .catch((err) => {
        if (!isActive) return
        setError(err instanceof Error ? err.message : 'Unable to load routes')
        setData(fallbackData)
      })
      .finally(() => {
        if (!isActive) return
        setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [enabled, limit, fallbackData])

  const checkedRoutes = useMemo(() => data?.routes.filter((route) => route.checked) ?? [], [data])
  const extraRoutes = useMemo(() => data?.routes.filter((route) => !route.checked) ?? [], [data])
  const hasRoutes = checkedRoutes.length > 0 || extraRoutes.length > 0

  if (!enabled) return null

  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
            <Router className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Smart Routes</p>
            <h3 className="text-lg font-semibold text-slate-900">Free Proxy Options</h3>
          </div>
        </div>
        <Badge variant="info" className="bg-slate-900 text-white">Live checks</Badge>
      </div>

      {loading && (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`proxy-skeleton-${idx}`} className="h-16 rounded-xl border border-slate-100 bg-slate-50 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      {!loading && hasRoutes && (
        <div className="mt-4 space-y-5">
          <div className="space-y-3">
            {checkedRoutes.map((route) => {
              const meta = statusMeta[route.status]
              return (
                <a
                  key={route.id}
                  href={route.url}
                  target="_blank"
                  rel="nofollow noopener"
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2 text-slate-600 shadow-sm">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{route.name}</div>
                      <div className="text-xs text-slate-500">
                        {route.region}
                        {route.notes ? ` · ${route.notes}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    <span>{route.latency ? `${route.latency}ms` : '—'}</span>
                    <ExternalLink className="h-4 w-4 text-slate-500" />
                  </div>
                </a>
              )
            })}
          </div>

          {extraRoutes.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">More free proxies</p>
                <Badge variant="default">Unverified</Badge>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {(showAll ? extraRoutes : extraRoutes.slice(0, 8)).map((route) => (
                  <a
                    key={route.id}
                    href={route.url}
                    target="_blank"
                    rel="nofollow noopener"
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <span>{route.name}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </a>
                ))}
              </div>
              {extraRoutes.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  {showAll ? 'Show less' : `Show all (${extraRoutes.length})`}
                </button>
              )}
            </div>
          )}

          <p className="text-xs text-slate-400">
            We only link to third-party proxy services. Availability and speed may vary by region.
          </p>
        </div>
      )}
    </section>
  )
}
