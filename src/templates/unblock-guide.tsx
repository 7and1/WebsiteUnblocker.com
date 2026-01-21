import { ReactNode } from 'react'
import Link from 'next/link'
import { DiagnosisTool, CTABanner } from '@/components'
import { buildBreadcrumbSchema, buildMetadata, buildFaqSchema } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { FaqSchema } from '@/components/seo/FaqSchema'
import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'

export interface UnblockGuideTemplateProps {
  websiteName: string
  websiteSlug: string
  domain?: string
  year?: number
  customFaq?: Array<{ question: string; answer: string }>
  customMethods?: Array<{
    title: string
    description: string
    steps: string[]
    pros?: string[]
    cons?: string[]
  }>
  relatedGuides?: Array<{ name: string; slug: string }>
  children?: ReactNode
}

/**
 * Template for "unblock [website]" guide pages
 * Provides proper heading structure, schema markup, FAQ section, related posts, and strategic CTAs
 */
export function UnblockGuideTemplate({
  websiteName,
  websiteSlug,
  domain = `${websiteSlug}.com`,
  year = new Date().getFullYear(),
  customFaq,
  customMethods,
  relatedGuides,
  children,
}: UnblockGuideTemplateProps) {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Unblock', path: '/unblock' },
    { name: websiteName, path: `/unblock/${websiteSlug}` },
  ])

  // Default FAQ items
  const defaultFaq = [
    {
      question: `How do I unblock ${websiteName}?`,
      answer: `The most reliable way to unblock ${websiteName} is using a VPN service. Connect to a server in a region where ${websiteName} is accessible, then visit the site. This works for most blocks including geo-restrictions, ISP blocks, and censorship.`,
    },
    {
      question: `Why is ${websiteName} blocked?`,
      answer: `${websiteName} may be blocked due to government censorship, school or workplace filters, geo-licensing restrictions, or ISP-level blocking. The specific reason depends on your location and network administrator.`,
    },
    {
      question: `Is it legal to unblock ${websiteName}?`,
      answer: `Using a VPN to access ${websiteName} is legal in most countries. However, always check your local laws and terms of service. Some organizations prohibit VPN use on their networks.`,
    },
    {
      question: `What is the best VPN for ${websiteName}?`,
      answer: `We recommend NordVPN for unblocking ${websiteName} due to its fast speeds, strong encryption, and ability to bypass most geo-restrictions and censorship measures.`,
    },
    {
      question: `Are there free ways to unblock ${websiteName}?`,
      answer: `Free options include web proxies and the Tor browser. However, these are often slow, unreliable, and may not work with streaming content. A paid VPN service is the most consistent solution.`,
    },
  ]

  const faqItems = customFaq || defaultFaq

  // Default unblocking methods
  const defaultMethods = [
    {
      title: `Method 1: Use a VPN (Recommended)`,
      description: `A VPN encrypts your traffic and routes it through a server in a different location, bypassing blocks and geo-restrictions.`,
      steps: [
        `Choose a reputable VPN provider (we recommend NordVPN).`,
        `Download and install the VPN app on your device.`,
        `Connect to a server where ${websiteName} is accessible.`,
        `Visit ${websiteName} - it should now be unblocked.`,
      ],
      pros: [`Works for most types of blocks`, `Encrypts your traffic`, `Fast speeds for streaming`, `Easy to set up`],
      cons: [`Requires a paid subscription`, `Must connect before accessing the site`],
    },
    {
      title: `Method 2: Use a Web Proxy`,
      description: `Web proxies route your traffic through an intermediary server, hiding your real location.`,
      steps: [
        `Search for a trusted web proxy service.`,
        `Enter ${websiteName}'s URL (${domain}) in the proxy.`,
        `Browse through the proxy interface.`,
      ],
      pros: [`Free to use`, `No installation required`, `Works in a browser`],
      cons: [`Often slow and unreliable`, `Not secure for sensitive data`, `May not work with streaming`],
    },
    {
      title: `Method 3: Tor Browser`,
      description: `Tor routes your traffic through multiple volunteer nodes for anonymity.`,
      steps: [
        `Download the Tor Browser from the official website.`,
        `Install and launch the browser.`,
        `Visit ${websiteName} through Tor.`,
      ],
      pros: [`Free and open-source`, `High anonymity`, `Bypasses most censorship`],
      cons: [`Very slow speeds`, `Not suitable for streaming`, `Some sites block Tor exit nodes`],
    },
  ]

  const methods = customMethods || defaultMethods

  return (
    <div>
      {/* Schema Markup */}
      <JsonLd data={breadcrumbSchema} />
      <FaqSchema faqs={faqItems} metadata={{ name: `How to Unblock ${websiteName}` }} />

      {/* SoftwareApplication Schema for the diagnosis tool */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: `${websiteName} Unblocker Tool`,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web',
          description: `Free tool to check if ${websiteName} is blocked and find solutions to unblock it.`,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }}
      />

      {/* Hero Section */}
      <section className="mb-12">
        <p className="text-sm font-medium text-emerald-600 mb-2">Unblock Guide</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
          How to Unblock {websiteName} in {year}
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl">
          {websiteName} blocked? Follow our step-by-step guide to regain access to {domain} from
          anywhere in the world.
        </p>
      </section>

      {/* Diagnosis Tool */}
      <section className="mb-12">
        <DiagnosisTool defaultUrl={domain} />
      </section>

      {/* Why Blocked Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why is {websiteName} blocked?</h2>
        <p className="text-slate-600 mb-4">
          {websiteName} can be blocked for several reasons depending on your location and network:
        </p>
        <ul className="list-disc list-inside text-slate-600 space-y-2">
          <li>
            <strong>Government Censorship:</strong> Some countries restrict access to certain websites.
          </li>
          <li>
            <strong>Geo-Restrictions:</strong> Content licensing limits access to specific regions.
          </li>
          <li>
            <strong>School/Work Filters:</strong> Institutions often block social media and streaming
            sites.
          </li>
          <li>
            <strong>ISP Blocking:</strong> Some internet providers block certain websites at the network
            level.
          </li>
        </ul>
      </section>

      {/* Custom Content */}
      {children}

      {/* Methods Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Proven Methods to Unblock {websiteName}
        </h2>
        <div className="space-y-8">
          {methods.map((method, index) => (
            <div key={index} className="border border-slate-200 rounded-xl p-6 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{method.title}</h3>
              <p className="text-slate-600 mb-4">{method.description}</p>
              <ol className="list-decimal list-inside text-slate-600 space-y-2 mb-4">
                {method.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              {method.pros && method.pros.length > 0 && (
                <div className="mb-2">
                  <p className="font-medium text-green-700 mb-1">Pros:</p>
                  <ul className="list-disc list-inside text-sm text-slate-600">
                    {method.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
              )}
              {method.cons && method.cons.length > 0 && (
                <div>
                  <p className="font-medium text-red-700 mb-1">Cons:</p>
                  <ul className="list-disc list-inside text-sm text-slate-600">
                    {method.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Mid-Content CTA */}
      <div className="my-12">
        <CTABanner
          variant="inline"
          title={`Unblock ${websiteName} in minutes`}
          description="Get fast, secure access with our recommended VPN solution."
          buttonText="Get NordVPN Now"
          affiliateKey="nordvpn"
        />
      </div>

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Frequently Asked Questions About {websiteName}
        </h2>
        <div className="space-y-6">
          {faqItems.map((faq, index) => (
            <div key={index} className="border-b border-slate-200 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3>
              <p className="text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Guides */}
      {relatedGuides && relatedGuides.length > 0 && (
        <section className="mb-12">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Related Unblocking Guides</h3>
            <div className="flex flex-wrap gap-3">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/unblock/${guide.slug}`}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition-colors hover:border-emerald-200 hover:text-emerald-600"
                >
                  Unblock {guide.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <div className="my-12">
        <CTABanner
          variant="fullwidth"
          title="Want full internet access?"
          description={`Join millions using NordVPN to unblock ${websiteName} and other sites worldwide.`}
          buttonText="Get NordVPN Now"
          affiliateKey="nordvpn"
        />
      </div>

      <p className="text-xs text-slate-400 mt-8">
        Last updated: January {year} · We review recommendations monthly to ensure accuracy.
      </p>
    </div>
  )
}

/**
 * Generate metadata for unblock guide pages
 */
export function generateUnblockGuideMetadata(websiteName: string, slug: string, year = new Date().getFullYear()) {
  return buildMetadata({
    title: `How to Unblock ${websiteName} in ${year} [Working Methods]`,
    description: `Learn how to unblock ${websiteName} with proven methods. VPN setup, proxy tips, and guidance that works worldwide to access ${websiteName} from anywhere.`,
    path: `/unblock/${slug}`,
  })
}
