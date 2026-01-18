import { notFound } from 'next/navigation'
import { CTABanner } from '@/components'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { vpnBestFor, vpnProviders } from '@/lib/content'

const YEAR = 2026

type Props = {
  params: { slug: string }
}

export const revalidate = 86400

export function generateStaticParams() {
  return [
    ...vpnProviders.map((provider) => ({ slug: `${provider.slug}-review` })),
    ...vpnBestFor.map((item) => ({ slug: item.slug })),
  ]
}

export function generateMetadata({ params }: Props) {
  const reviewSlug = params.slug.replace(/-review$/, '')
  const provider = vpnProviders.find((item) => item.slug === reviewSlug)
  if (provider) {
    return buildMetadata({
      title: `${provider.name} Review ${YEAR}: ${provider.tagline}`,
      description: `Our ${YEAR} review of ${provider.name}. We tested speed, security, and streaming access to see if it unblocks top sites.`,
      path: `/vpn/${params.slug}`,
    })
  }

  const bestFor = vpnBestFor.find((item) => item.slug === params.slug)
  if (bestFor) {
    return buildMetadata({
      title: `${bestFor.title} ${YEAR}`,
      description: `Discover the best VPNs for ${bestFor.focus}. Updated for ${YEAR}.`,
      path: `/vpn/${params.slug}`,
    })
  }

  return buildMetadata({ title: 'VPN Guide Not Found', path: `/vpn/${params.slug}` })
}

export default function VpnDetailPage({ params }: Props) {
  const reviewSlug = params.slug.replace(/-review$/, '')
  const provider = vpnProviders.find((item) => item.slug === reviewSlug)
  const bestFor = vpnBestFor.find((item) => item.slug === params.slug)

  if (!provider && !bestFor) notFound()

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'VPN', path: '/vpn' },
    { name: provider ? `${provider.name} Review` : bestFor?.title || '', path: `/vpn/${params.slug}` },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-4xl px-4 py-16">
        {provider ? (
          <>
            <h1 className="text-4xl font-extrabold text-slate-900">{provider.name} Review {YEAR}</h1>
            <p className="mt-4 text-lg text-slate-600">{provider.tagline}</p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-bold text-slate-900">Highlights</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {provider.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase text-slate-500">Rating</p>
                <p className="text-3xl font-bold text-slate-900">{provider.rating}/10</p>
                <p className="mt-4 text-sm text-slate-600">Starting at {provider.price}</p>
              </div>
            </div>

            <CTABanner
              variant="inline"
              title={`Try ${provider.name} risk-free`}
              description="Unlock geo-blocked sites with proven VPN performance."
              buttonText={`Get ${provider.name}`}
              affiliateKey={
                provider.slug === 'nordvpn'
                  ? 'nordvpn'
                  : provider.slug === 'expressvpn'
                    ? 'expressvpn'
                    : provider.slug === 'surfshark'
                      ? 'surfshark'
                      : 'nordvpn'
              }
            />
          </>
        ) : (
          <>
            <h1 className="text-4xl font-extrabold text-slate-900">{bestFor?.title} {YEAR}</h1>
            <p className="mt-4 text-lg text-slate-600">{bestFor?.focus}</p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-bold text-slate-900">Top recommendations</h2>
              <p className="mt-2 text-sm text-slate-600">
                We recommend NordVPN, ExpressVPN, and Surfshark for consistent performance.
              </p>
            </div>

            <CTABanner
              variant="inline"
              title="Get the top-rated VPN"
              description="Upgrade to a VPN that keeps streaming and browsing fast."
              buttonText="Get NordVPN"
              affiliateKey="nordvpn"
            />
          </>
        )}
      </section>
    </main>
  )
}
