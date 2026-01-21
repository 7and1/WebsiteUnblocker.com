import { ExternalLink, Shield, Zap } from 'lucide-react'
import { Badge, StatusBadge } from '@/components/ui'
import { siteConfig } from '@/config/site'
import { ProxyRoutes } from '@/components/features/ProxyRoutes'
import type { CheckResult } from './types'

const regionStatusMeta: Record<
  'accessible' | 'blocked' | 'error' | 'unknown',
  { label: string; variant: 'success' | 'warning' | 'error' | 'default' }
> = {
  accessible: { label: 'Accessible', variant: 'success' },
  blocked: { label: 'Blocked', variant: 'error' },
  error: { label: 'Error', variant: 'warning' },
  unknown: { label: 'No data', variant: 'default' },
}

function computeSummary(regions: CheckResult['regions']) {
  if (!regions || regions.length === 0) {
    return { accessible: 0, blocked: 0, error: 0, unknown: 0 }
  }
  return regions.reduce(
    (acc, region) => {
      acc[region.status] += 1
      return acc
    },
    { accessible: 0, blocked: 0, error: 0, unknown: 0 }
  )
}

export function DiagnosisResult({ result }: { result: CheckResult }) {
  const isBlocked = result.status === 'blocked'
  const isError = result.status === 'error'
  const isAccessible = result.status === 'accessible'
  const regions = result.regions ?? []
  const summary = result.summary ?? computeSummary(regions)
  const hasRegionalBlocks = summary.blocked > 0
  const showSolutions = isBlocked || isError || hasRegionalBlocks
  const showProxyRoutes = showSolutions || isAccessible

  return (
    <div className="space-y-6">
      <div
        className={
          isAccessible
            ? 'rounded-xl border border-green-200 bg-green-50 p-5'
            : isBlocked
              ? 'rounded-xl border border-red-200 bg-red-50 p-5'
              : 'rounded-xl border border-amber-200 bg-amber-50 p-5'
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Check result</p>
            <h3 className="text-lg font-semibold text-slate-900">
              {isAccessible ? 'Website Accessible' : isBlocked ? 'Access Restricted' : 'Access Error'}
            </h3>
          </div>
          <StatusBadge status={result.status} />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          {result.target} · {result.latency}ms
          {result.code ? ` · HTTP ${result.code}` : ''}
        </p>
        {result.error && <p className="mt-2 text-sm text-slate-500">{result.error}</p>}

        {/* Instant CTA for blocked status */}
        {isBlocked && (
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={siteConfig.affiliates.nordvpn}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              <Zap className="h-4 w-4" />
              Unblock with VPN
            </a>
            <a
              href="#solutions"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              View All Solutions
            </a>
          </div>
        )}
      </div>

      {regions.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Regional access report</p>
              <h3 className="text-lg font-semibold text-slate-900">Multi-location results</h3>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span>Accessible: {summary.accessible}</span>
              <span>Blocked: {summary.blocked}</span>
              <span>Errors: {summary.error}</span>
              <span>Unknown: {summary.unknown}</span>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {regions.map((region) => {
              const meta = regionStatusMeta[region.status]
              return (
                <div
                  key={`${region.region}-${region.label}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">{region.label}</p>
                      <p className="text-sm font-semibold text-slate-800">{region.source?.toUpperCase() ?? 'EDGE'}</p>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {region.latency ? `${region.latency}ms` : 'Latency unavailable'}
                    {region.code ? ` · HTTP ${region.code}` : ''}
                  </div>
                  {region.details && <p className="mt-1 text-xs text-slate-400">{region.details}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isAccessible && (
        <div className="text-center text-slate-600">
          <p>Great news! This website is accessible from our servers.</p>
          <p className="text-sm text-slate-500">
            If you still can&apos;t access it, the block might be on your local network.
          </p>
        </div>
      )}

      {showProxyRoutes && (
        <div id="solutions" className="space-y-4">
          {showSolutions ? (
            <>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">Access denied in one or more networks.</p>
                <p className="text-sm text-red-700">
                  Use a VPN for the fastest, most reliable access, or try one of the free proxy routes below.
                </p>
              </div>

              <h3 className="font-semibold text-slate-700">Recommended Solutions</h3>

              <a
                href={siteConfig.affiliates.nordvpn}
                target="_blank"
                rel="noopener"
                className="group flex items-center justify-between gap-4 rounded-xl border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 p-5 transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-green-500 p-3 text-white">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      NordVPN
                      <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                        Recommended
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">Fastest VPN for streaming & gaming</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition-colors group-hover:bg-green-700">
                    Unblock Now
                  </span>
                  <ExternalLink className="h-4 w-4 text-green-600" />
                </div>
              </a>
            </>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-700">Need a free proxy option?</p>
              <p className="text-sm text-slate-500">
                Use a web proxy for quick access when a VPN isn&apos;t required.
              </p>
            </div>
          )}

          <ProxyRoutes enabled={showProxyRoutes} limit={10} />
        </div>
      )}
    </div>
  )
}
