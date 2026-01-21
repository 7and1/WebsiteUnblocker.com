'use client'

import { ExternalLink, Check, Star } from 'lucide-react'
import { siteConfig } from '@/config/site'

interface VPNProvider {
  name: string
  price: string
  priceNote?: string
  speedRating: number
  bestFor: string
  features: string[]
  affiliateUrl: string
  recommended?: boolean
}

const vpnProviders: VPNProvider[] = [
  {
    name: 'NordVPN',
    price: '$3.39/mo',
    priceNote: '2-year plan',
    speedRating: 5,
    bestFor: 'Streaming & Gaming',
    features: ['5500+ servers', '60 countries', 'No-logs policy', 'Kill switch'],
    affiliateUrl: siteConfig.affiliates.nordvpn,
    recommended: true,
  },
  {
    name: 'ExpressVPN',
    price: '$6.67/mo',
    priceNote: '1-year plan',
    speedRating: 5,
    bestFor: 'Privacy & Security',
    features: ['3000+ servers', '94 countries', 'TrustedServer tech', 'Split tunneling'],
    affiliateUrl: siteConfig.affiliates.expressvpn,
  },
  {
    name: 'Surfshark',
    price: '$2.49/mo',
    priceNote: '2-year plan',
    speedRating: 4,
    bestFor: 'Budget & Unlimited Devices',
    features: ['3200+ servers', '100 countries', 'Unlimited devices', 'CleanWeb'],
    affiliateUrl: siteConfig.affiliates.surfshark,
  },
]

function SpeedRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

export function VPNComparison() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-2 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          Compare Top VPN Providers
        </h2>
        <p className="mb-8 text-center text-slate-600">
          Choose the best VPN for your needs. All tested and verified for unblocking.
        </p>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Provider</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Speed</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Best For</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Features</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {vpnProviders.map((vpn, index) => (
                <tr
                  key={vpn.name}
                  className={`border-b border-slate-100 last:border-0 ${
                    vpn.recommended ? 'bg-green-50/50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{vpn.name}</span>
                      {vpn.recommended && (
                        <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                          Recommended
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-semibold text-slate-900">{vpn.price}</span>
                      {vpn.priceNote && (
                        <span className="ml-1 text-xs text-slate-500">({vpn.priceNote})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <SpeedRating rating={vpn.speedRating} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{vpn.bestFor}</td>
                  <td className="px-6 py-4">
                    <ul className="space-y-1">
                      {vpn.features.slice(0, 2).map((feature) => (
                        <li key={feature} className="flex items-center gap-1 text-xs text-slate-600">
                          <Check className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={vpn.affiliateUrl}
                      target="_blank"
                      rel="noopener"
                      className={`inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        vpn.recommended
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-slate-800 text-white hover:bg-slate-900'
                      }`}
                    >
                      Get Deal
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-4 md:hidden">
          {vpnProviders.map((vpn) => (
            <div
              key={vpn.name}
              className={`rounded-xl border p-4 ${
                vpn.recommended
                  ? 'border-green-300 bg-green-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">{vpn.name}</span>
                  {vpn.recommended && (
                    <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                      Recommended
                    </span>
                  )}
                </div>
                <SpeedRating rating={vpn.speedRating} />
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500">Price:</span>{' '}
                  <span className="font-semibold text-slate-900">{vpn.price}</span>
                </div>
                <div>
                  <span className="text-slate-500">Best for:</span>{' '}
                  <span className="text-slate-700">{vpn.bestFor}</span>
                </div>
              </div>

              <ul className="mb-4 flex flex-wrap gap-2">
                {vpn.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                  >
                    <Check className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={vpn.affiliateUrl}
                target="_blank"
                rel="noopener"
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-colors ${
                  vpn.recommended
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-slate-800 text-white hover:bg-slate-900'
                }`}
              >
                Get Deal
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          * Prices may vary. Links may contain affiliate codes.
        </p>
      </div>
    </section>
  )
}
