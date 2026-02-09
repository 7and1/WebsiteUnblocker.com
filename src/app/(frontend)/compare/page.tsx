import { VpnComparisonTable } from '@/components'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { vpnComparisons } from '@/lib/content'

export const metadata = buildMetadata({
  title: 'VPN Comparison Tool: Compare Top Providers Side-by-Side',
  description:
    'Compare leading VPN providers by unblocking performance, speed, server coverage, and value. Use our interactive VPN comparison table to pick the right option.',
  path: '/compare',
  keywords: [
    'vpn comparison',
    'best vpn for unblocking',
    'nordvpn vs expressvpn',
    'vpn speed and streaming comparison',
    'website unblocker vpn tool',
  ],
})

export const revalidate = 86400

export default function ComparePage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Compare', path: '/compare' },
  ])

  const comparisonSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'VPN Comparison Tool',
    description:
      'Compare top VPN providers side by side for streaming access, privacy, and unblocking success.',
    url: 'https://websiteunblocker.com/compare',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: vpnComparisons.map((comparison, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://websiteunblocker.com/compare/${comparison.slug}`,
        name: `${comparison.a} vs ${comparison.b}`,
      })),
    },
  }

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={comparisonSchema} />

      <div className="mx-auto max-w-7xl px-4 py-16">
        <header className="mb-10">
          <h1 className="mb-4 text-4xl font-extrabold text-slate-900">VPN Comparison Tool</h1>
          <p className="text-xl text-slate-600">
            Compare top VPN providers side by side. Select up to 4 VPNs to compare features.
          </p>
        </header>

        <VpnComparisonTable />
      </div>
    </main>
  )
}
