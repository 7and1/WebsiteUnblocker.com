import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata = buildMetadata({
  title: 'Terms of Service',
  description: 'Review WebsiteUnblocker terms and conditions for using the service.',
  path: '/terms',
})

export default function TermsPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Terms of Service', path: '/terms' },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900">Terms of Service</h1>
        <div className="prose prose-slate mt-6 max-w-none">
          <p>
            By using WebsiteUnblocker, you agree to comply with these terms. If you do not agree, please
            discontinue use of the site.
          </p>
          <h2>Use of service</h2>
          <p>
            WebsiteUnblocker provides informational guidance and diagnostic tools. You are responsible
            for ensuring your use of VPNs or other tools complies with local laws.
          </p>
          <h2>No warranties</h2>
          <p>
            The service is provided "as is" without warranties of any kind. We do not guarantee
            uninterrupted access or results.
          </p>
          <h2>Limitation of liability</h2>
          <p>
            WebsiteUnblocker is not liable for indirect or consequential damages arising from use of the
            service.
          </p>
          <h2>Affiliate disclosure</h2>
          <p>
            We may receive commissions from affiliate links. This does not affect our recommendations.
          </p>
          <h2>Changes</h2>
          <p>We may update these terms periodically. Continued use indicates acceptance of changes.</p>
        </div>
      </section>
    </main>
  )
}
