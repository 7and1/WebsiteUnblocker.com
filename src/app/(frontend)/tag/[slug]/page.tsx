import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import {
  buildContentExcerpt,
  getGuideTagStats,
  getPublishedPostsByTagSlug,
} from '@/lib/content/posts'

export const runtime = 'nodejs'
export const revalidate = 3600

type Props = {
  params: Promise<{ slug: string }>
}

function formatDate(input?: string | null) {
  if (!input) {
    return null
  }

  const date = new Date(input)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export async function generateStaticParams() {
  const tags = await getGuideTagStats(500)
  return tags.map((tag) => ({ slug: tag.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const { tag, posts } = await getPublishedPostsByTagSlug(slug, 50)

  if (!tag) {
    return buildMetadata({
      title: 'Tag Not Found',
      path: `/tag/${slug}`,
      noIndex: true,
    })
  }

  return buildMetadata({
    title: `${tag.name} Guides (${posts.length}) | Website Unblocker`,
    description: `Browse ${posts.length} expert guide${posts.length === 1 ? '' : 's'} tagged ${tag.name}. Practical unblock tutorials, VPN workflows, and privacy tips.`,
    path: `/tag/${tag.slug}`,
    keywords: [
      `${tag.name} guides`,
      `website unblocker ${tag.name}`,
      `${tag.name} tutorials`,
      'unblock website guides',
    ],
  })
}

export default async function GuideTagPage({ params }: Props) {
  const { slug } = await params
  const { tag, posts } = await getPublishedPostsByTagSlug(slug, 80)

  if (!tag) {
    notFound()
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: tag.name, path: `/tag/${tag.slug}` },
  ])

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tag.name} Guides`,
    description: `Guides tagged ${tag.name}.`,
    url: `https://websiteunblocker.com/tag/${tag.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://websiteunblocker.com/guides/${post.slug}`,
        name: post.title,
      })),
    },
  }

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />

      <div className="mx-auto max-w-6xl px-4 py-14 lg:py-16">
        <header className="mb-10 border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Guide Tag</p>
          <h1 className="mt-3 text-4xl font-extrabold text-slate-900">{tag.name}</h1>
          <p className="mt-3 text-lg text-slate-600">
            {posts.length} guide{posts.length === 1 ? '' : 's'} in this topic cluster.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
            <Link href="/guides" className="font-medium text-emerald-600 hover:text-emerald-700">
              ← Back to all guides
            </Link>
            <a
              href={`/tag/${tag.slug}/feed.xml`}
              className="font-medium text-slate-600 hover:text-slate-900"
            >
              RSS feed for this tag
            </a>
          </div>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
            No published guides found for this tag yet.
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2" aria-label={`${tag.name} guide list`}>
            {posts.map((post) => {
              const excerpt = post.meta_description?.trim() || buildContentExcerpt(
                post.content,
                `Read our expert guide: ${post.title}`,
                160
              )
              const publishedLabel = formatDate(post.published_date)

              return (
                <Link
                  key={post.slug}
                  href={`/guides/${post.slug}`}
                  className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-emerald-200 hover:shadow-md"
                >
                  <h2 className="text-lg font-semibold text-slate-900">{post.title}</h2>
                  {publishedLabel && (
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Published {publishedLabel}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-slate-600">{excerpt}</p>
                </Link>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}
