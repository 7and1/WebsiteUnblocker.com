'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

export function SpeedTest() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ avg: number; min: number; max: number } | null>(null)

  const runTest = async () => {
    setLoading(true)
    setResults(null)

    const samples: number[] = []
    for (let i = 0; i < 5; i += 1) {
      const start = performance.now()
      await fetch('/api/health', { cache: 'no-store' })
      const end = performance.now()
      samples.push(end - start)
    }

    const avg = samples.reduce((sum, value) => sum + value, 0) / samples.length
    const min = Math.min(...samples)
    const max = Math.max(...samples)

    setResults({ avg, min, max })
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold text-slate-900">Edge Latency Test</h2>
      <p className="mt-2 text-sm text-slate-500">
        Measure round-trip time to the WebsiteUnblocker edge network.
      </p>

      <div className="mt-6">
        <Button onClick={runTest} loading={loading} size="lg">
          {loading ? 'Testing...' : 'Run Speed Test'}
        </Button>
      </div>

      {results && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase text-slate-500">Average</p>
            <p className="text-2xl font-bold text-slate-900">{results.avg.toFixed(0)} ms</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase text-slate-500">Min</p>
            <p className="text-2xl font-bold text-slate-900">{results.min.toFixed(0)} ms</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase text-slate-500">Max</p>
            <p className="text-2xl font-bold text-slate-900">{results.max.toFixed(0)} ms</p>
          </div>
        </div>
      )}
    </div>
  )
}
