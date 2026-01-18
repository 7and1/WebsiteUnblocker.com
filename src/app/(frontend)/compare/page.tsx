import Link from 'next/link'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { vpnComparisons } from '@/lib/content'

export const metadata = buildMetadata({
  title: 'VPN Comparison Hub',
  description: 'Compare top VPN providers side by side and see which unblocks more sites.',
  path: '/compare',
})

export const revalidate = 604800

export default function CompareHubPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Compare', path: '/compare' },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900">VPN Comparisons</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          See how top VPNs stack up on speed, streaming access, and privacy.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {vpnComparisons.map((comparison) => (
            <Link
              key={comparison.slug}
              href={`/compare/${comparison.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-slate-900">
                {comparison.a} vs {comparison.b}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Compare features, pricing, and unblocking success rates.
              </p>
              <span className="mt-4 inline-flex text-sm font-medium text-blue-600">View comparison →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
