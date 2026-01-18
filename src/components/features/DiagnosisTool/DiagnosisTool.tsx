'use client'

import { Shield } from 'lucide-react'
import { DiagnosisInput } from './DiagnosisInput'
import { DiagnosisResult } from './DiagnosisResult'
import { useDiagnosis } from './useDiagnosis'

export function DiagnosisTool({ defaultUrl = '' }: { defaultUrl?: string }) {
  const { state, setUrl, runCheck } = useDiagnosis(defaultUrl)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Website Access Checker</h2>
              <p className="text-sm text-slate-500">Check if a website is blocked in your region</p>
            </div>
          </div>

          <DiagnosisInput url={state.url} loading={state.loading} onChange={setUrl} onSubmit={runCheck} />

          <p id="url-hint" className="mt-3 text-xs text-slate-400">
            Enter a domain or full URL. We test accessibility from our edge network.
          </p>
        </div>

        {state.result && (
          <div className="border-t border-slate-200 animate-in slide-in-from-top-2 duration-300">
            <div className="p-6 md:p-8" role="region" aria-live="polite" aria-atomic="true">
              <DiagnosisResult result={state.result} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
