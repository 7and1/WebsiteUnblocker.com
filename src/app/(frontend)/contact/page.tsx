import { ContactForm } from '@/components'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { siteConfig } from '@/config/site'

export const metadata = buildMetadata({
  title: 'Contact WebsiteUnblocker',
  description: 'Have a question or partnership request? Send us a message and we will respond quickly.',
  path: '/contact',
})

export default function ContactPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900">Contact Us</h1>
        <p className="mt-4 text-lg text-slate-600">
          Send us a message and our team will get back to you. You can also reach us at{' '}
          <a className="text-blue-600" href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>.
        </p>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <ContactForm />
        </div>
      </section>
    </main>
  )
}
