import Link from 'next/link'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { tools } from '@/lib/content'

export const metadata = buildMetadata({
  title: 'Tools - Website Unblocker Utilities',
  description: 'Access free tools to verify VPN performance, check IP addresses, and diagnose access issues.',
  path: '/tools',
})

export const revalidate = 86400

export default function ToolsPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900">Tools</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Utilities to help you validate VPN connections and troubleshoot access issues.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-slate-900">{tool.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{tool.description}</p>
              <span className="mt-4 inline-flex text-sm font-medium text-emerald-600">Open tool →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
