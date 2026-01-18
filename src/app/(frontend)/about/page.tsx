import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata = buildMetadata({
  title: 'About WebsiteUnblocker',
  description: 'Learn how WebsiteUnblocker helps users regain access to restricted websites safely.',
  path: '/about',
})

export default function AboutPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900">About WebsiteUnblocker</h1>
        <div className="prose prose-slate mt-6 max-w-none">
          <p>
            WebsiteUnblocker is a free diagnostic platform that helps people check whether a website is
            blocked and provides safe, reliable solutions to regain access.
          </p>
          <p>
            We test site accessibility from global edge locations, summarize the most common block
            reasons, and recommend privacy-first tools like VPNs for consistent access.
          </p>
          <h2>Our mission</h2>
          <p>
            Everyone deserves open access to information and services. We make it easy to understand why
            a site is blocked and how to fix it without sacrificing security.
          </p>
          <h2>How we make money</h2>
          <p>
            Some of our links are affiliate links. If you purchase through those links, we may earn a
            commission at no extra cost to you. We only recommend products we trust.
          </p>
        </div>
      </section>
    </main>
  )
}
