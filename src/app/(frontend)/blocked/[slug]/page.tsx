import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CTABanner, DiagnosisTool } from '@/components'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { blockedTargets } from '@/lib/content'

const YEAR = 2026

type Props = {
  params: { slug: string }
}

export const revalidate = 86400

export function generateStaticParams() {
  return blockedTargets.map((item) => ({ slug: item.slug }))
}

export function generateMetadata({ params }: Props) {
  const item = blockedTargets.find((entry) => entry.slug === params.slug)
  if (!item) return buildMetadata({ title: 'Status Not Found', path: `/blocked/${params.slug}` })

  return buildMetadata({
    title: `Is ${item.site} Blocked in ${item.country}? [${YEAR} Status + Solutions]`,
    description: `Check if ${item.site} is blocked in ${item.country}. Current status, reasons for the block, and safe methods to regain access.`,
    path: `/blocked/${item.slug}`,
  })
}

export default function BlockedPage({ params }: Props) {
  const item = blockedTargets.find((entry) => entry.slug === params.slug)
  if (!item) notFound()

  const siteSlug = item.slug.split('-').slice(0, -1).join('-')

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blocked', path: '/blocked' },
    { name: item.site, path: `/blocked/${item.slug}` },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <Link href="/blocked" className="text-sm font-medium text-blue-600">
          ← Back to blocked status checks
        </Link>

        <h1 className="mt-4 text-4xl font-extrabold text-slate-900">
          Is {item.site} Blocked in {item.country}?
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Current status in {YEAR}: <span className="font-semibold text-slate-900">{item.status}</span>.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-bold text-slate-900">Quick status check</h2>
          <p className="mt-2 text-sm text-slate-600">
            Run a live accessibility check from our edge network.
          </p>
          <div className="mt-6">
            <DiagnosisTool defaultUrl={`${siteSlug}.com`} />
          </div>
        </div>

        <div className="prose prose-slate mt-10 max-w-none">
          <h2>Why is {item.site} restricted in {item.country}?</h2>
          <p>
            Restrictions typically happen due to national firewalls, licensing rules, or network policies.
            The fastest fix is to use a VPN to route your traffic through an open region.
          </p>

          <h2>How to access {item.site} safely</h2>
          <ol>
            <li>Install a reputable VPN app.</li>
            <li>Connect to a server outside {item.country}.</li>
            <li>Refresh {item.site} and confirm access.</li>
          </ol>
        </div>

        <CTABanner
          variant="inline"
          title={`Unblock ${item.site} in ${item.country}`}
          description="Use a trusted VPN to restore access in minutes."
          buttonText="Get NordVPN"
          affiliateKey="nordvpn"
        />
      </section>
    </main>
  )
}
