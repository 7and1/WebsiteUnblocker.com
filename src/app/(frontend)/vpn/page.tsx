import Link from 'next/link'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { vpnProviders, vpnBestFor } from '@/lib/content'

export const metadata = buildMetadata({
  title: 'VPN Hub - Reviews & Best Picks',
  description: 'Browse VPN reviews, comparisons, and best-for guides to unblock websites securely.',
  path: '/vpn',
})

export const revalidate = 86400

export default function VpnHubPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'VPN', path: '/vpn' },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900">VPN Guides & Reviews</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Pick the right VPN for streaming, privacy, and bypassing geo-blocks.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {vpnProviders.map((provider) => (
            <Link
              key={provider.slug}
              href={`/vpn/${provider.slug}-review`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-slate-900">{provider.name} Review</h2>
              <p className="mt-2 text-sm text-slate-500">{provider.tagline}</p>
              <span className="mt-4 inline-flex text-sm font-medium text-blue-600">Read review →</span>
            </Link>
          ))}
        </div>

        <h2 className="mt-16 text-2xl font-bold text-slate-900">Best VPNs For</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {vpnBestFor.map((item) => (
            <Link
              key={item.slug}
              href={`/vpn/${item.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg"
            >
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{item.focus}</p>
              <span className="mt-4 inline-flex text-sm font-medium text-blue-600">View picks →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
