import Link from 'next/link'
import { GuidesExplorer } from '@/components'
import { JsonLd } from '@/components/seo/JsonLd'
import { guideCategories, guides } from '@/lib/content'
import { buildContentExcerpt, getGuideTagStats, getPublishedPosts } from '@/lib/content/posts'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Website Unblocker Guides: VPN & Access Tutorials',
  description:
    'Discover website unblocker guides for streaming, social apps, school networks, and privacy. Learn practical methods to restore access safely in 2026.',
  path: '/guides',
  keywords: [
    'website unblocker guides',
    'how to unblock websites',
    'vpn access tutorials',
    'bypass network restrictions',
    'unblock streaming services',
  ],
})

export const runtime = 'nodejs'
export const revalidate = 3600

export default async function GuidesPage() {
  const [latestPosts, guideTags] = await Promise.all([
    getPublishedPosts(6),
    getGuideTagStats(300),
  ])

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
  ])

  const staticGuideEntities = guides.map((guide, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `https://websiteunblocker.com${guide.href}`,
    name: guide.title,
  }))

  const postEntities = latestPosts.map((post, index) => ({
    '@type': 'ListItem',
    position: staticGuideEntities.length + index + 1,
    url: `https://websiteunblocker.com/guides/${post.slug}`,
    name: post.title,
  }))

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Website Unblocker Guides',
    description:
      'Step-by-step guides to unblock websites, bypass restrictions, and restore access safely.',
    url: 'https://websiteunblocker.com/guides',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [...staticGuideEntities, ...postEntities],
    },
  }

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />

      <div className="mx-auto max-w-6xl px-4 py-16">
        <header className="mb-12">
          <h1 className="mb-4 text-4xl font-extrabold text-slate-900">Unblocking Guides</h1>
          <p className="text-xl text-slate-600">
            Step-by-step guides to unblock websites, bypass restrictions, and access content safely.
          </p>
        </header>

        {guideTags.length > 0 && (
          <section className="mb-10" aria-label="Popular guide topics">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Popular Topics</h2>
            <div className="flex flex-wrap gap-2">
              {guideTags.slice(0, 10).map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tag/${tag.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700"
                >
                  {tag.name} ({tag.count})
                </Link>
              ))}
            </div>
          </section>
        )}

        {latestPosts.length > 0 && (
          <section className="mb-12" aria-label="Latest guide posts">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Latest Expert Guides</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {latestPosts.map((post) => {
                const excerpt = post.meta_description?.trim() || buildContentExcerpt(
                  post.content,
                  `Read our expert guide: ${post.title}`,
                  140
                )

                return (
                  <Link
                    key={post.slug}
                    href={`/guides/${post.slug}`}
                    className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-emerald-200 hover:shadow-md"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{excerpt}</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <GuidesExplorer guides={guides} categories={guideCategories} />
      </div>
    </main>
  )
}
