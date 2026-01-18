import { ExternalLink, Shield } from 'lucide-react'
import { StatusBadge } from '@/components/ui'
import { siteConfig } from '@/config/site'
import type { CheckResult } from './types'

export function DiagnosisResult({ result }: { result: CheckResult }) {
  const isBlocked = result.status === 'blocked'
  const isError = result.status === 'error'
  const isAccessible = result.status === 'accessible'

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
      </div>

      {isAccessible && (
        <div className="text-center text-slate-600">
          <p>Great news! This website is accessible from our servers.</p>
          <p className="text-sm text-slate-500">
            If you still can&apos;t access it, the block might be on your local network.
          </p>
        </div>
      )}

      {(isBlocked || isError) && (
        <div className="space-y-4">
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

          <a
            href="https://www.croxyproxy.com"
            target="_blank"
            rel="nofollow noopener"
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-slate-500 transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <ExternalLink className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-slate-700">Free Web Proxy</div>
                <div className="text-xs">Slower speed, contains ads</div>
              </div>
            </div>
            <span className="text-sm">Try Free →</span>
          </a>
        </div>
      )}
    </div>
  )
}
