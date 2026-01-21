import Link from 'next/link'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { unblockTargets } from '@/lib/content'

export const metadata = buildMetadata({
  title: 'Unblock Guides - How to Access Any Website',
  description: 'Browse step-by-step guides to unblock YouTube, TikTok, Twitter, Netflix and more.',
  path: '/unblock',
})

export const revalidate = 86400

export default function UnblockHubPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Unblock', path: '/unblock' },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900">How to Unblock Any Website</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Choose a website to see our proven methods for bypassing restrictions safely.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {unblockTargets.map((target) => (
            <Link
              key={target.slug}
              href={`/unblock/${target.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-slate-900">Unblock {target.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{target.summary}</p>
              <span className="mt-4 inline-flex text-sm font-medium text-emerald-600">Read guide →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
