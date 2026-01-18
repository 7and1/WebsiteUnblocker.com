import { notFound } from 'next/navigation'
import { CTABanner } from '@/components'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { vpnComparisons } from '@/lib/content'

const YEAR = 2026

type Props = {
  params: Promise<{ comparison: string }>
}

export const revalidate = 604800

export function generateStaticParams() {
  return vpnComparisons.map((comparison) => ({ comparison: comparison.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { comparison: comparisonSlug } = await params
  const comparison = vpnComparisons.find((item) => item.slug === comparisonSlug)
  if (!comparison) return buildMetadata({ title: 'Comparison Not Found', path: `/compare/${comparisonSlug}` })

  return buildMetadata({
    title: `${comparison.a} vs ${comparison.b}: Which Unblocks More Sites? | ${YEAR}`,
    description: `Side-by-side comparison of ${comparison.a} and ${comparison.b} on speed, security, streaming access, and pricing.`,
    path: `/compare/${comparison.slug}`,
  })
}

export default async function ComparePage({ params }: Props) {
  const { comparison: comparisonSlug } = await params
  const comparison = vpnComparisons.find((item) => item.slug === comparisonSlug)
  if (!comparison) notFound()

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Compare', path: '/compare' },
    { name: `${comparison.a} vs ${comparison.b}`, path: `/compare/${comparison.slug}` },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900">
          {comparison.a} vs {comparison.b}
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          We compare performance, pricing, and unblocking success so you can pick the best VPN.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">{comparison.a}</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Strong global network</li>
              <li>Reliable streaming access</li>
              <li>Fast connection speeds</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">{comparison.b}</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Competitive pricing</li>
              <li>Apps for every device</li>
              <li>Privacy-focused features</li>
            </ul>
          </div>
        </div>

        <CTABanner
          variant="inline"
          title="Unlock more websites today"
          description="Choose a VPN that consistently bypasses blocks worldwide."
          buttonText="Get NordVPN"
          affiliateKey="nordvpn"
        />
      </section>
    </main>
  )
}
