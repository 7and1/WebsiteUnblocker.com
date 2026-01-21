import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DiagnosisTool, CTABanner } from '@/components'
import { buildBreadcrumbSchema, buildMetadata, buildFaqSchema, buildHowToSchema } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { unblockTargets, getRelatedTargets, getTargetsByCategory } from '@/lib/content'

// Category display names for hub links
const CATEGORY_LABELS: Record<string, string> = {
  Streaming: 'Streaming Services',
  Social: 'Social Media',
  Gaming: 'Gaming Platforms',
  Music: 'Music Services',
  AI: 'AI Tools',
  Messaging: 'Messaging Apps',
  Education: 'Education Sites',
  Shopping: 'Shopping Sites',
  Search: 'Search Engines',
  Development: 'Developer Tools',
  Community: 'Community Platforms',
}

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

  const blockedInText = target.blockedIn?.slice(0, 2).join(', ') || 'some regions'
  const description = `Learn how to unblock ${target.name} from anywhere. ${target.summary} Discover the best VPNs and methods to access ${target.name} in ${blockedInText} and other regions.`

  return buildMetadata({
    title: `How to Unblock ${target.name} in ${YEAR} [Working Methods]`,
    description: description.length > 160 ? description.slice(0, 157) + '...' : description,
    path: `/unblock/${target.slug}`,
    keywords: [
      `unblock ${target.name}`,
      `access ${target.name}`,
      `${target.name} VPN`,
      `bypass ${target.name} block`,
      `${target.name} blocked`,
      `unblock ${target.name} ${YEAR}`,
      ...(target.blockedIn?.flatMap(c => [
        `${target.name} in ${c}`,
        `unblock ${target.name} in ${c}`,
        `access ${target.name} in ${c}`,
      ]) ?? []),
    ],
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

  // FAQ Schema for rich snippets
  const faqSchema = buildFaqSchema([
    {
      question: `Why is ${target.name} blocked?`,
      answer: `${target.name} can be blocked due to government censorship, school or workplace filters, or geo-licensing agreements. ${target.summary}`,
    },
    {
      question: `Is it legal to unblock ${target.name}?`,
      answer: `Using a VPN to access ${target.name} is legal in most countries. However, you should always check your local laws and terms of service before using any unblocking method.`,
    },
    {
      question: `What is the best VPN for ${target.name}?`,
      answer: `NordVPN, ExpressVPN, and Surfshark are among the best VPNs for unblocking ${target.name} due to their fast speeds, reliable bypass capabilities, and extensive server networks.`,
    },
    {
      question: `Can I use a free VPN to unblock ${target.name}?`,
      answer: `Free VPNs often have limitations and may not reliably unblock ${target.name}. Paid VPNs offer better performance, security, and unblocking success rates.`,
    },
    {
      question: `How do I unblock ${target.name} at school or work?`,
      answer: `To unblock ${target.name} on restricted networks, use a VPN with obfuscation technology, or try a smart DNS service. Always follow your institution's acceptable use policy.`,
    },
  ])

  // HowTo Schema for step-by-step guide
  const howToSchema = buildHowToSchema({
    name: `How to Unblock ${target.name}`,
    description: `Step-by-step guide to unblock ${target.name} from anywhere using a VPN.`,
    steps: [
      {
        name: 'Choose a VPN Provider',
        text: `Select a reputable VPN service like NordVPN that can reliably unblock ${target.name}. Look for servers in regions where ${target.name} is accessible.`,
      },
      {
        name: 'Install the VPN App',
        text: `Download and install the VPN application on your device. Most providers support Windows, Mac, iOS, and Android.`,
      },
      {
        name: 'Connect to a Server',
        text: `Open the VPN app and connect to a server in a region where ${target.name} is available. This will change your virtual location.`,
      },
      {
        name: 'Access ' + target.name,
        text: `Once connected, navigate to ${target.url || target.name.toLowerCase() + '.com'} and enjoy full access to ${target.name} without restrictions.`,
      },
    ],
    tool: ['VPN subscription', 'Compatible device', 'Internet connection'],
  })

  // Get related targets for internal linking
  const relatedTargets = getRelatedTargets(target.slug, 6)

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={howToSchema} />

      <article>
        <section className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex flex-col gap-6">
            <header>
              <p className="text-sm font-medium text-emerald-600">Unblock Guide</p>
              <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
                How to Unblock {target.name} in {YEAR}
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                {target.name} blocked? We&apos;ll show you the fastest ways to regain access.
                {target.blockedIn && target.blockedIn.length > 0 && (
                  <span className="mt-2 block text-sm">
                    Commonly blocked in: {target.blockedIn.join(', ')}
                  </span>
                )}
              </p>
            </header>

            <DiagnosisTool defaultUrl={target.url || `${target.slug}.com`} />

            <div className="prose prose-slate max-w-none">
              <section>
                <h2>Why is {target.name} blocked?</h2>
                <p>
                  {target.name} can be blocked due to government restrictions, school or workplace filters, or
                  geo-licensing agreements. The best fix is to route your connection through an uncensored
                  location.
                </p>
                {target.blockedIn && target.blockedIn.length > 0 && (
                  <p className="text-sm text-slate-600">
                    <strong>Known restrictions:</strong> {target.blockedIn.join(', ')}
                  </p>
                )}
              </section>

              <section>
                <h2>Method 1: Use a VPN (Recommended)</h2>
                <p>
                  A VPN encrypts your traffic and assigns you a new IP address. This is the most reliable way
                  to bypass blocks and geo-restrictions.
                </p>
                <ol>
                  <li>Choose a VPN with servers where {target.name} is available</li>
                  <li>Download and install the VPN app on your device</li>
                  <li>Connect to a server in an supported region</li>
                  <li>Access {target.name} without restrictions</li>
                </ol>
              </section>

              <section>
                <h2>Method 2: Smart DNS Service</h2>
                <p>
                  Smart DNS can unblock content without encrypting your connection. It&apos;s faster than a VPN
                  but doesn&apos;t provide privacy protection.
                </p>
                <ul>
                  <li>Sign up for a Smart DNS service</li>
                  <li>Configure your device&apos;s DNS settings</li>
                  <li>Access {target.name} directly</li>
                </ul>
              </section>

              <section>
                <h2>Method 3: Web Proxy</h2>
                <p>
                  Web proxies are free but often slow and unreliable. Use them only for quick access to
                  non-streaming content.
                </p>
              </section>

              <section>
                <h2>Frequently Asked Questions</h2>
                <details className="group rounded-lg border border-slate-200 bg-slate-50">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                    Is it legal to unblock {target.name}?
                    <span className="transition group-open:rotate-180">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-600">
                    Using a VPN is legal in most countries. Always check local regulations.
                  </div>
                </details>

                <details className="mt-2 group rounded-lg border border-slate-200 bg-slate-50">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                    What is the best VPN for {target.name}?
                    <span className="transition group-open:rotate-180">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-600">
                    NordVPN, ExpressVPN, and Surfshark are top choices for unblocking {target.name} due to their
                    fast speeds and reliable bypass capabilities.
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
                    Try switching servers, clear your browser cache, and ensure your VPN supports obfuscation
                    for stricter regions.
                  </div>
                </details>

                <details className="mt-2 group rounded-lg border border-slate-200 bg-slate-50">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                    Can I unblock {target.name} for free?
                    <span className="transition group-open:rotate-180">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-600">
                    Free VPNs often have limitations and may not reliably unblock {target.name}. Paid VPNs offer
                    better performance and success rates.
                  </div>
                </details>

                <details className="mt-2 group rounded-lg border border-slate-200 bg-slate-50">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                    How do I unblock {target.name} at school?
                    <span className="transition group-open:rotate-180">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-600">
                    Use a VPN with obfuscation technology to bypass school filters. Always follow your
                    school&apos;s acceptable use policy.
                  </div>
                </details>
              </section>
            </div>

            <CTABanner
              variant="inline"
              title={`Unblock ${target.name} in minutes`}
              description="Use our trusted VPN partner for fast, private access."
              buttonText="Get NordVPN"
              affiliateKey="nordvpn"
            />

            {relatedTargets.length > 0 && (
              <nav className="rounded-2xl border border-slate-200 bg-slate-50 p-6" aria-label="Related guides">
                <h3 className="text-lg font-semibold text-slate-900">
                  Related guides for {target.category}
                </h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {relatedTargets.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/unblock/${item.slug}`}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition-colors hover:border-emerald-200 hover:text-emerald-600"
                    >
                      Unblock {item.name}
                    </Link>
                  ))}
                </div>
              </nav>
            )}

            {/* Category Hub Links for Internal Linking */}
            <nav className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6" aria-label="Browse by category">
              <h3 className="text-lg font-semibold text-slate-900">
                Browse Unblock Guides by Category
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Find more unblocking guides for {CATEGORY_LABELS[target.category] || target.category} and other categories.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
                  const categoryTargets = getTargetsByCategory(category as any)
                  if (categoryTargets.length === 0) return null
                  const isCurrentCategory = category === target.category
                  return (
                    <Link
                      key={category}
                      href={`/unblock?category=${category.toLowerCase()}`}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        isCurrentCategory
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-700 font-medium'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-600'
                      }`}
                    >
                      {label}
                      <span className="ml-1 text-xs text-slate-400">({categoryTargets.length})</span>
                    </Link>
                  )
                })}
              </div>
            </nav>

            <footer className="text-xs text-slate-400">
              Last updated: January {YEAR} · We review recommendations monthly.
            </footer>
          </div>
        </section>
      </article>

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
