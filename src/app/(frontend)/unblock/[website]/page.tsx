import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DiagnosisTool, CTABanner } from '@/components'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { unblockTargets } from '@/lib/content'

const YEAR = 2026

type Props = {
  params: Promise<{ website: string }>
}

export const revalidate = 86400

export function generateStaticParams() {
  return unblockTargets.map((target) => ({ website: target.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { website } = await params
  const target = unblockTargets.find((item) => item.slug === website)
  if (!target) return buildMetadata({ title: 'Guide Not Found', path: `/unblock/${website}` })

  return buildMetadata({
    title: `How to Unblock ${target.name} in ${YEAR} [Working Methods]`,
    description: `Learn how to unblock ${target.name} with 3 proven methods. VPN setup, proxy tips, and Tor guidance that works worldwide.`,
    path: `/unblock/${target.slug}`,
  })
}

export default async function UnblockPage({ params }: Props) {
  const { website } = await params
  const target = unblockTargets.find((item) => item.slug === website)
  if (!target) notFound()

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Unblock', path: '/unblock' },
    { name: target.name, path: `/unblock/${target.slug}` },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-medium text-blue-600">Unblock Guide</p>
            <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
              How to Unblock {target.name} in {YEAR}
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              {target.name} blocked? We&apos;ll show you the fastest ways to regain access.
            </p>
          </div>

          <DiagnosisTool defaultUrl={`${target.slug}.com`} />

          <div className="prose prose-slate max-w-none">
            <h2>Why is {target.name} blocked?</h2>
            <p>
              {target.name} can be blocked due to government restrictions, school or workplace filters, or
              geo-licensing agreements. The best fix is to route your connection through an uncensored
              location.
            </p>

            <h2>Method 1: Use a VPN (Recommended)</h2>
            <p>
              A VPN encrypts your traffic and assigns you a new IP address. This is the most reliable way
              to bypass blocks and geo-restrictions.
            </p>
            <ul>
              <li>Install a trusted VPN app (NordVPN recommended).</li>
              <li>Connect to a nearby server where {target.name} is available.</li>
              <li>Reload {target.name} and enjoy full access.</li>
            </ul>

            <h2>Method 2: Web Proxy</h2>
            <p>
              Web proxies are free but often slow and unreliable. Use them only for quick access to
              non-streaming content.
            </p>

            <h2>Method 3: Tor Browser</h2>
            <p>
              Tor offers anonymity, but it&apos;s slower and may not work well with video services.
            </p>

            <h2>FAQ</h2>
            <h3>Is it legal to unblock {target.name}?</h3>
            <p>Using a VPN is legal in most countries. Always check local regulations.</p>

            <h3>Why is my VPN not working?</h3>
            <p>
              Switch servers, clear cache, and make sure your VPN supports obfuscation for stricter
              regions.
            </p>
          </div>

          <CTABanner
            variant="inline"
            title={`Unblock ${target.name} in minutes`}
            description="Use our trusted VPN partner for fast, private access."
            buttonText="Get NordVPN"
            affiliateKey="nordvpn"
          />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Related guides</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {unblockTargets
                .filter((item) => item.slug !== target.slug)
                .slice(0, 6)
                .map((item) => (
                  <Link
                    key={item.slug}
                    href={`/unblock/${item.slug}`}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-600"
                  >
                    Unblock {item.name}
                  </Link>
                ))}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Last updated: January {YEAR} · We review recommendations monthly.
          </p>
        </div>
      </section>

      <CTABanner
        variant="fullwidth"
        title="Want full internet access?"
        description="Join millions using NordVPN to unblock sites worldwide."
        buttonText="Get NordVPN Now"
        affiliateKey="nordvpn"
      />
    </main>
  )
}
