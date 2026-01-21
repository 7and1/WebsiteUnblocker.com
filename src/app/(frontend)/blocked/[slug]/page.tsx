import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CTABanner, DiagnosisTool } from '@/components'
import { buildBreadcrumbSchema, buildMetadata, buildFaqSchema } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { blockedTargets, getBlocksByCountry, getBlocksBySite } from '@/lib/content'

const YEAR = 2026

type Props = {
  params: Promise<{ slug: string }>
}

export const revalidate = 86400

export function generateStaticParams() {
  return blockedTargets.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const item = blockedTargets.find((entry) => entry.slug === slug)
  if (!item) return buildMetadata({ title: 'Status Not Found', path: `/blocked/${slug}` })

  const statusText = item.status === 'blocked' ? 'Blocked' : item.status === 'restricted' ? 'Restricted' : 'Monitored'
  const description = `Check if ${item.site} is blocked in ${item.country}. Current status: ${statusText}. Learn why and discover safe methods to regain access using VPNs.`

  return buildMetadata({
    title: `Is ${item.site} Blocked in ${item.country}? [${YEAR} Status + Solutions]`,
    description: description.length > 160 ? description.slice(0, 157) + '...' : description,
    path: `/blocked/${item.slug}`,
    keywords: [
      `${item.site} blocked ${item.country}`,
      `access ${item.site} ${item.country}`,
      `unblock ${item.site} ${item.country}`,
      `${item.site} vpn ${item.country}`,
      `bypass ${item.country} censorship`,
      `${item.site} status`,
    ],
  })
}

export default async function BlockedPage({ params }: Props) {
  const { slug } = await params
  const item = blockedTargets.find((entry) => entry.slug === slug)
  if (!item) notFound()

  const siteSlug = item.slug.split('-').slice(0, -1).join('-')

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blocked', path: '/blocked' },
    { name: `${item.site} in ${item.country}`, path: `/blocked/${item.slug}` },
  ])

  // FAQ Schema for rich snippets
  const faqSchema = buildFaqSchema([
    {
      question: `Is ${item.site} blocked in ${item.country}?`,
      answer: `Yes, ${item.site} is currently ${item.status} in ${item.country}. This ${item.status === 'blocked' ? 'means full access is not available' : item.status === 'restricted' ? 'means access is limited or monitored' : 'means access may be monitored'}.`,
    },
    {
      question: `Why is ${item.site} ${item.status} in ${item.country}?`,
      answer: `${item.site} is ${item.status} in ${item.country} due to government regulations, licensing restrictions, or network policies.${item.alternative ? ` A local alternative often used is ${item.alternative}.` : ''}`,
    },
    {
      question: `How can I access ${item.site} in ${item.country}?`,
      answer: `To access ${item.site} in ${item.country}, use a reputable VPN service to route your traffic through a server in a country where ${item.site} is available. NordVPN and ExpressVPN are reliable choices.`,
    },
    {
      question: `Is it legal to use a VPN in ${item.country}?`,
      answer: `VPN legality varies by country. While using a VPN is legal in most places, some countries have restrictions. Always check local regulations before using a VPN.`,
    },
  ])

  // Get related blocks for internal linking
  const relatedByCountry = getBlocksByCountry(item.country)
    .filter(t => t.slug !== item.slug)
    .slice(0, 3)
  const relatedBySite = getBlocksBySite(item.site)
    .filter(t => t.slug !== item.slug)
    .slice(0, 3)

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <article>
        <section className="mx-auto max-w-4xl px-4 py-16">
          <Link href="/blocked" className="text-sm font-medium text-emerald-600">
            ← Back to blocked status checks
          </Link>

          <header className="mt-4">
            <h1 className="text-4xl font-extrabold text-slate-900">
              Is {item.site} Blocked in {item.country}?
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Current status in {YEAR}:{' '}
              <span className={`font-semibold ${
                item.status === 'blocked' ? 'text-red-600' :
                item.status === 'restricted' ? 'text-amber-600' :
                'text-emerald-600'
              }`}>
                {item.status.toUpperCase()}
              </span>
            </p>
            {item.alternative && (
              <p className="mt-2 text-sm text-slate-500">
                Common alternative: {item.alternative}
              </p>
            )}
          </header>

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
            <section>
              <h2>Why is {item.site} {item.status} in {item.country}?</h2>
              <p>
                Restrictions on {item.site} in {item.country} typically occur due to:
              </p>
              <ul>
                <li>Government censorship or national firewalls</li>
                <li>Licensing and copyright agreements</li>
                <li>Local network policies (schools, workplaces)</li>
                <li>Trade regulations or sanctions</li>
              </ul>
              {item.alternative && (
                <p className="text-sm text-slate-600">
                  <strong>Note:</strong> Many users in {item.country} use {item.alternative} as an alternative.
                </p>
              )}
            </section>

            <section>
              <h2>How to access {item.site} in {item.country}</h2>
              <p>
                The most reliable way to access {item.site} in {item.country} is through a VPN service.
              </p>
              <ol>
                <li>Choose a VPN with good {item.country} bypass capabilities</li>
                <li>Download and install the VPN app</li>
                <li>Connect to a server outside {item.country}</li>
                <li>Access {item.site} without restrictions</li>
              </ol>
            </section>

            <section>
              <h2>Frequently Asked Questions</h2>
              <details className="group rounded-lg border border-slate-200 bg-slate-50">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                  Is it legal to unblock {item.site}?
                  <span className="transition group-open:rotate-180">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm text-slate-600">
                  VPN legality varies by jurisdiction. Research your local laws before using any unblocking service.
                </div>
              </details>

              <details className="mt-2 group rounded-lg border border-slate-200 bg-slate-50">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                  What is the best VPN for {item.country}?
                  <span className="transition group-open:rotate-180">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm text-slate-600">
                  NordVPN and ExpressVPN are known to work well for bypassing restrictions in {item.country}.
                </div>
              </details>

              <details className="mt-2 group rounded-lg border border-slate-200 bg-slate-50">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                  Why is my VPN not working?
                  <span className="transition group-open:rotate-180">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm text-slate-600">
                  Try switching servers, enable obfuscation, or contact your VPN&apos;s support for {item.country}-specific recommendations.
                </div>
              </details>
            </section>
          </div>

          <CTABanner
            variant="inline"
            title={`Unblock ${item.site} in ${item.country}`}
            description="Use a trusted VPN to restore access in minutes."
            buttonText="Get NordVPN"
            affiliateKey="nordvpn"
          />

          {(relatedByCountry.length > 0 || relatedBySite.length > 0) && (
            <nav className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6" aria-label="Related statuses">
              <h3 className="text-lg font-semibold text-slate-900">Related blocked status checks</h3>
              <div className="mt-4 flex flex-col gap-4">
                {relatedByCountry.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Other blocks in {item.country}:</p>
                    <div className="flex flex-wrap gap-2">
                      {relatedByCountry.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/blocked/${related.slug}`}
                          className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition-colors hover:border-emerald-200 hover:text-emerald-600"
                        >
                          {related.site}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {relatedBySite.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">{item.site} blocked in other countries:</p>
                    <div className="flex flex-wrap gap-2">
                      {relatedBySite.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/blocked/${related.slug}`}
                          className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition-colors hover:border-emerald-200 hover:text-emerald-600"
                        >
                          {related.country}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          )}
        </section>
      </article>
    </main>
  )
}
