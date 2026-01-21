'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpDown, Check, X, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

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
    devices: -1, // unlimited
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
  { id: 'netflix', name: 'Netflix US', nordvpn: 'yes', expressvpn: 'yes', surfshark: 'yes', protonvpn: 'partial' },
  { id: 'hulu', name: 'Hulu', nordvpn: 'yes', expressvpn: 'yes', surfshark: 'yes', protonvpn: 'no' },
  { id: 'bbc', name: 'BBC iPlayer', nordvpn: 'yes', expressvpn: 'yes', surfshark: 'yes', protonvpn: 'partial' },
  { id: 'amazon', name: 'Prime Video', nordvpn: 'yes', expressvpn: 'yes', surfshark: 'yes', protonvpn: 'yes' },
  { id: 'disney', name: 'Disney+', nordvpn: 'yes', expressvpn: 'yes', surfshark: 'yes', protonvpn: 'partial' },
  { id: 'torrent', name: 'P2P/Torrenting', nordvpn: 'yes', expressvpn: 'yes', surfshark: 'yes', protonvpn: 'yes' },
  { id: 'killswitch', name: 'Kill Switch', nordvpn: 'yes', expressvpn: 'yes', surfshark: 'yes', protonvpn: 'yes' },
  { id: 'split', name: 'Split Tunneling', nordvpn: 'yes', expressvpn: 'yes', surfshark: 'yes', protonvpn: 'yes' },
  { id: 'port', name: 'Port Forwarding', nordvpn: 'yes', expressvpn: 'no', surfshark: 'yes', protonvpn: 'partial' },
  { id: 'adblock', name: 'Ad/Malware Blocker', nordvpn: 'yes', expressvpn: 'partial', surfshark: 'yes', protonvpn: 'no' },
  { id: 'double', name: 'Double VPN', nordvpn: 'yes', expressvpn: 'no', surfshark: 'yes', protonvpn: 'yes' },
  { id: 'logs', name: 'No-Logs Policy', nordvpn: 'yes', expressvpn: 'yes', surfshark: 'yes', protonvpn: 'yes' },
]

type VPNKey = keyof typeof vpnData
type SortField = 'rating' | 'price' | 'servers' | 'countries' | 'devices'

export default function ComparePage() {
  const [selectedVPNs, setSelectedVPNs] = useState<VPNKey[]>(['nordvpn', 'expressvpn', 'surfshark'])
  const [sortBy, setSortBy] = useState<SortField>('rating')
  const [sortAsc, setSortAsc] = useState(false)

  const toggleVPN = (vpn: VPNKey) => {
    if (selectedVPNs.includes(vpn)) {
      if (selectedVPNs.length > 1) {
        setSelectedVPNs(selectedVPNs.filter(v => v !== vpn))
      }
    } else {
      setSelectedVPNs([...selectedVPNs, vpn])
    }
  }

  const getFeatureIcon = (value: 'yes' | 'no' | 'partial') => {
    switch (value) {
      case 'yes':
        return <Check className="w-5 h-5 text-green-500" />
      case 'no':
        return <X className="w-5 h-5 text-red-400" />
      case 'partial':
        return <span className="text-xs text-amber-600 font-semibold">Partial</span>
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">VPN Comparison Tool</h1>
          <p className="text-xl text-slate-600">
            Compare top VPN providers side by side. Select up to 4 VPNs to compare features.
          </p>
        </div>

        {/* VPN Selector */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Select VPNs to Compare</h2>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(vpnData) as VPNKey[]).map(key => (
              <button
                key={key}
                onClick={() => toggleVPN(key)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all',
                  selectedVPNs.includes(key)
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                {vpnData[key].name}
              </button>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-4 px-4 font-semibold text-slate-700 w-48">Feature</th>
                {selectedVPNs.map(key => (
                  <th key={key} className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-slate-900">{vpnData[key].name}</span>
                      <span className="text-sm text-slate-500">{vpnData[key].price}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Basic Info Row */}
              <tr className="border-b border-slate-100 bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-700">Rating</td>
                {selectedVPNs.map(key => (
                  <td key={key} className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-900">{vpnData[key].rating}</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-700">Servers</td>
                {selectedVPNs.map(key => (
                  <td key={key} className="py-3 px-4 text-center text-slate-700">
                    {vpnData[key].servers.toLocaleString()}+
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-700">Countries</td>
                {selectedVPNs.map(key => (
                  <td key={key} className="py-3 px-4 text-center text-slate-700">
                    {vpnData[key].countries}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-700">Devices</td>
                {selectedVPNs.map(key => (
                  <td key={key} className="py-3 px-4 text-center text-slate-700">
                    {vpnData[key].devices === -1 ? 'Unlimited' : vpnData[key].devices}
                  </td>
                ))}
              </tr>

              {/* Streaming Features */}
              {features.slice(0, 5).map(feature => (
                <tr key={feature.id} className={cn('border-b border-slate-100', features.indexOf(feature) % 2 === 0 && 'bg-slate-50')}>
                  <td className="py-3 px-4 font-medium text-slate-700">{feature.name}</td>
                  {selectedVPNs.map(key => (
                    <td key={`${feature.id}-${key}`} className="py-3 px-4 text-center">
                      {getFeatureIcon(feature[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Quick Comparisons */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Head-to-Head Comparisons</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/compare/nordvpn-vs-expressvpn" className="rounded-xl border border-slate-200 p-4 hover:border-emerald-200 hover:shadow-md transition-all">
              <h3 className="font-semibold text-slate-900">NordVPN vs ExpressVPN</h3>
              <p className="text-sm text-slate-500 mt-1">Speed, streaming, and privacy</p>
            </Link>
            <Link href="/compare/nordvpn-vs-surfshark" className="rounded-xl border border-slate-200 p-4 hover:border-emerald-200 hover:shadow-md transition-all">
              <h3 className="font-semibold text-slate-900">NordVPN vs Surfshark</h3>
              <p className="text-sm text-slate-500 mt-1">Value vs premium features</p>
            </Link>
            <Link href="/compare/expressvpn-vs-surfshark" className="rounded-xl border border-slate-200 p-4 hover:border-emerald-200 hover:shadow-md transition-all">
              <h3 className="font-semibold text-slate-900">ExpressVPN vs Surfshark</h3>
              <p className="text-sm text-slate-500 mt-1">Premium vs budget-friendly</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
