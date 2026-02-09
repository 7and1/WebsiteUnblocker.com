'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'

type IpResponse = {
  ip: string
  country?: string | null
  city?: string | null
  region?: string | null
  timezone?: string | null
}

export function IpChecker() {
  const [data, setData] = useState<IpResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchIp = async () => {
    const response = await fetch('/api/ip', { cache: 'no-store' })
    return response.json() as Promise<IpResponse>
  }

  const load = async () => {
    setLoading(true)

    try {
      const json = await fetchIp()
      setData(json)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    const loadInitialData = async () => {
      try {
        const json = await fetchIp()
        if (!active) return
        setData(json)
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    void loadInitialData()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold text-slate-900">IP Checker</h2>
      <p className="mt-2 text-sm text-slate-500">Verify your public IP and location data.</p>

      <div className="mt-6">
        <Button onClick={load} loading={loading} variant="secondary">
          Refresh
        </Button>
      </div>

      {data && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase text-slate-500">IP Address</p>
            <p className="text-lg font-semibold text-slate-900">{data.ip}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase text-slate-500">Location</p>
            <p className="text-lg font-semibold text-slate-900">
              {[data.city, data.region, data.country].filter(Boolean).join(', ') || 'Unavailable'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase text-slate-500">Timezone</p>
            <p className="text-lg font-semibold text-slate-900">{data.timezone || 'Unavailable'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
