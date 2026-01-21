import Link from 'next/link'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { blockedTargets } from '@/lib/content'

export const metadata = buildMetadata({
  title: 'Is a Website Blocked? Country Status Checks',
  description: 'Check if popular websites are blocked in specific countries and learn how to regain access.',
  path: '/blocked',
})

export const revalidate = 86400

export default function BlockedHubPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blocked', path: '/blocked' },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900">Is a Website Blocked?</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Browse country-specific status checks and learn the best ways to bypass restrictions.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blockedTargets.map((item) => (
            <Link
              key={item.slug}
              href={`/blocked/${item.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-slate-900">
                Is {item.site} blocked in {item.country}?
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Current status: <span className="font-medium text-slate-700">{item.status}</span>
              </p>
              <span className="mt-4 inline-flex text-sm font-medium text-emerald-600">View status →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
