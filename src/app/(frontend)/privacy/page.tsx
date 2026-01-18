import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'Read how WebsiteUnblocker collects, uses, and protects your data.',
  path: '/privacy',
})

export default function PrivacyPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Privacy Policy', path: '/privacy' },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900">Privacy Policy</h1>
        <div className="prose prose-slate mt-6 max-w-none">
          <p>
            WebsiteUnblocker respects your privacy. This policy explains what information we collect and
            how we use it.
          </p>
          <h2>Information we collect</h2>
          <ul>
            <li>Usage data such as page views and device type (via analytics).</li>
            <li>Contact form submissions (name, email, and message).</li>
            <li>Diagnostic input URLs you voluntarily test with our tool.</li>
          </ul>
          <h2>How we use information</h2>
          <p>
            We use data to maintain and improve the WebsiteUnblocker service, respond to inquiries, and
            monitor performance and security.
          </p>
          <h2>Cookies</h2>
          <p>
            We may use cookies for analytics and functionality. You can disable cookies in your browser
            settings.
          </p>
          <h2>Third-party services</h2>
          <p>
            We may link to third-party VPN services. Their privacy policies apply when you visit their
            websites.
          </p>
          <h2>Contact</h2>
          <p>If you have questions about this policy, contact us via the contact form.</p>
        </div>
      </section>
    </main>
  )
}
