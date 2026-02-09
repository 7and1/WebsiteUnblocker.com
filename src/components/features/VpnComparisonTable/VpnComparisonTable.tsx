'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, Star, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { vpnComparisons } from '@/lib/content'

interface VPNFeature {
  id: string
  name: string
  nordvpn: 'yes' | 'no' | 'partial'
  expressvpn: 'yes' | 'no' | 'partial'
  surfshark: 'yes' | 'no' | 'partial'
  protonvpn: 'yes' | 'no' | 'partial'
}

const vpnData = {
  nordvpn: {
    name: 'NordVPN',
    rating: 9.6,
    price: '$3.39/mo',
    servers: 6000,
    countries: 61,
    devices: 6,
  },
  expressvpn: {
    name: 'ExpressVPN',
    rating: 9.2,
    price: '$6.67/mo',
    servers: 3000,
    countries: 94,
    devices: 5,
  },
  surfshark: {
    name: 'Surfshark',
    rating: 9.0,
    price: '$2.49/mo',
    servers: 3200,
    countries: 65,
    devices: -1,
  },
  protonvpn: {
    name: 'Proton VPN',
    rating: 8.7,
    price: '$4.99/mo',
    servers: 1800,
    countries: 68,
    devices: 10,
  },
}

const features: VPNFeature[] = [
  {
    id: 'netflix',
    name: 'Netflix US',
    nordvpn: 'yes',
    expressvpn: 'yes',
    surfshark: 'yes',
    protonvpn: 'partial',
  },
  {
    id: 'hulu',
    name: 'Hulu',
    nordvpn: 'yes',
    expressvpn: 'yes',
    surfshark: 'yes',
    protonvpn: 'no',
  },
  {
    id: 'bbc',
    name: 'BBC iPlayer',
    nordvpn: 'yes',
    expressvpn: 'yes',
    surfshark: 'yes',
    protonvpn: 'partial',
  },
  {
    id: 'amazon',
    name: 'Prime Video',
    nordvpn: 'yes',
    expressvpn: 'yes',
    surfshark: 'yes',
    protonvpn: 'yes',
  },
  {
    id: 'disney',
    name: 'Disney+',
    nordvpn: 'yes',
    expressvpn: 'yes',
    surfshark: 'yes',
    protonvpn: 'partial',
  },
  {
    id: 'torrent',
    name: 'P2P/Torrenting',
    nordvpn: 'yes',
    expressvpn: 'yes',
    surfshark: 'yes',
    protonvpn: 'yes',
  },
  {
    id: 'killswitch',
    name: 'Kill Switch',
    nordvpn: 'yes',
    expressvpn: 'yes',
    surfshark: 'yes',
    protonvpn: 'yes',
  },
  {
    id: 'split',
    name: 'Split Tunneling',
    nordvpn: 'yes',
    expressvpn: 'yes',
    surfshark: 'yes',
    protonvpn: 'yes',
  },
  {
    id: 'port',
    name: 'Port Forwarding',
    nordvpn: 'yes',
    expressvpn: 'no',
    surfshark: 'yes',
    protonvpn: 'partial',
  },
  {
    id: 'adblock',
    name: 'Ad/Malware Blocker',
    nordvpn: 'yes',
    expressvpn: 'partial',
    surfshark: 'yes',
    protonvpn: 'no',
  },
  {
    id: 'double',
    name: 'Double VPN',
    nordvpn: 'yes',
    expressvpn: 'no',
    surfshark: 'yes',
    protonvpn: 'yes',
  },
  {
    id: 'logs',
    name: 'No-Logs Policy',
    nordvpn: 'yes',
    expressvpn: 'yes',
    surfshark: 'yes',
    protonvpn: 'yes',
  },
]

type VPNKey = keyof typeof vpnData

const MAX_SELECTED = 4

function getFeatureIcon(value: 'yes' | 'no' | 'partial') {
  switch (value) {
    case 'yes':
      return <Check className="h-5 w-5 text-green-500" />
    case 'no':
      return <X className="h-5 w-5 text-red-400" />
    default:
      return <span className="text-xs font-semibold text-amber-600">Partial</span>
  }
}

export function VpnComparisonTable() {
  const [selectedVPNs, setSelectedVPNs] = useState<VPNKey[]>(['nordvpn', 'expressvpn', 'surfshark'])

  const toggleVPN = (vpn: VPNKey) => {
    setSelectedVPNs((current) => {
      if (current.includes(vpn)) {
        return current.length > 1 ? current.filter((item) => item !== vpn) : current
      }

      if (current.length >= MAX_SELECTED) {
        return current
      }

      return [...current, vpn]
    })
  }

  const disabledKeys = useMemo(() => {
    if (selectedVPNs.length < MAX_SELECTED) {
      return new Set<VPNKey>()
    }

    return new Set((Object.keys(vpnData) as VPNKey[]).filter((key) => !selectedVPNs.includes(key)))
  }, [selectedVPNs])

  return (
    <>
      <section className="mb-10" aria-label="VPN selector">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Select VPNs to Compare</h2>
        <p className="mb-4 text-sm text-slate-500">Choose up to {MAX_SELECTED} providers.</p>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(vpnData) as VPNKey[]).map((key) => {
            const selected = selectedVPNs.includes(key)
            const disabled = disabledKeys.has(key)

            return (
              <button
                key={key}
                onClick={() => toggleVPN(key)}
                disabled={disabled}
                className={cn(
                  'rounded-lg px-4 py-2 font-medium transition-all',
                  selected
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
                aria-pressed={selected}
              >
                {vpnData[key].name}
              </button>
            )
          })}
        </div>
      </section>

      <section className="overflow-x-auto" aria-label="VPN comparison table">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="w-48 px-4 py-4 text-left font-semibold text-slate-700">Feature</th>
              {selectedVPNs.map((key) => (
                <th key={key} className="px-4 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-900">{vpnData[key].name}</span>
                    <span className="text-sm text-slate-500">{vpnData[key].price}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-700">Rating</td>
              {selectedVPNs.map((key) => (
                <td key={key} className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-900">{vpnData[key].rating}</span>
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">Servers</td>
              {selectedVPNs.map((key) => (
                <td key={key} className="px-4 py-3 text-center text-slate-700">
                  {vpnData[key].servers.toLocaleString()}+
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-100 bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-700">Countries</td>
              {selectedVPNs.map((key) => (
                <td key={key} className="px-4 py-3 text-center text-slate-700">
                  {vpnData[key].countries}
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">Devices</td>
              {selectedVPNs.map((key) => (
                <td key={key} className="px-4 py-3 text-center text-slate-700">
                  {vpnData[key].devices === -1 ? 'Unlimited' : vpnData[key].devices}
                </td>
              ))}
            </tr>

            {features.map((feature, index) => (
              <tr
                key={feature.id}
                className={cn('border-b border-slate-100', index % 2 === 0 && 'bg-slate-50')}
              >
                <td className="px-4 py-3 font-medium text-slate-700">{feature.name}</td>
                {selectedVPNs.map((key) => (
                  <td key={`${feature.id}-${key}`} className="px-4 py-3 text-center">
                    {getFeatureIcon(feature[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-12" aria-label="Head-to-head comparisons">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Head-to-Head Comparisons</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vpnComparisons.map((comparison) => (
            <Link
              key={comparison.slug}
              href={`/compare/${comparison.slug}`}
              className="rounded-xl border border-slate-200 p-4 transition-all hover:border-emerald-200 hover:shadow-md"
            >
              <h3 className="font-semibold text-slate-900">
                {comparison.a} vs {comparison.b}
              </h3>
              <p className="mt-1 text-sm text-slate-500">Streaming access, speed, and value</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
