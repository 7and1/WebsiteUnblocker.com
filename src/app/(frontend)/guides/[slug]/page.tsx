import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CTABanner, RichText, ShareButtons, TableOfContents } from '@/components'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  buildArticleMetadata,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildMetadata,
} from '@/lib/seo'
import {
  buildContentExcerpt,
  extractLexicalText,
  getPublishedPostBySlug,
  getPublishedPostSlugs,
  slugifyTag,
} from '@/lib/content/posts'

export const runtime = 'nodejs'
export const revalidate = 3600

type Props = {
  params: Promise<{ slug: string }>
}

function estimateReadingMinutes(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 220))
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
  const slugs = await getPublishedPostSlugs(500)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    return buildMetadata({
      title: 'Guide Not Found',
      path: `/guides/${slug}`,
      noIndex: true,
    })
  }

  const title = post.meta_title?.trim() || `${post.title} | Website Unblocker Guides`
  const description = post.meta_description?.trim() || buildContentExcerpt(
    post.content,
    `Learn how to unblock websites and apps with our ${post.title} guide.`,
    160
  )

  return buildArticleMetadata({
    title,
    description,
    slug: post.slug,
    publishedTime: post.published_date || undefined,
    modifiedTime: post.updatedAt,
    keywords: post.tags?.filter(Boolean) ?? undefined,
  })
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const description = post.meta_description?.trim() || buildContentExcerpt(
    post.content,
    `Learn how to unblock websites and apps with our ${post.title} guide.`,
    160
  )

  const plainContent = extractLexicalText(post.content)
  const readingMinutes = estimateReadingMinutes(plainContent)
  const publishedLabel = formatDate(post.published_date)
  const updatedLabel = formatDate(post.updatedAt)
  const canonicalUrl = `https://websiteunblocker.com/guides/${post.slug}`

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: post.title, path: `/guides/${post.slug}` },
  ])

  const articleSchema = buildArticleSchema({
    title: post.title,
    description,
    slug: post.slug,
    datePublished: post.published_date || undefined,
    dateModified: post.updatedAt,
  })

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />

      <div className="mx-auto max-w-6xl px-4 py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article className="min-w-0">
            <header className="border-b border-slate-200 pb-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Guide</p>
              <h1 className="mt-3 text-4xl font-extrabold text-slate-900">{post.title}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                {publishedLabel && <span>Published {publishedLabel}</span>}
                {publishedLabel && updatedLabel && <span aria-hidden="true">•</span>}
                {updatedLabel && <span>Updated {updatedLabel}</span>}
                {(publishedLabel || updatedLabel) && <span aria-hidden="true">•</span>}
                <span>{readingMinutes} min read</span>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${slugifyTag(tag)}`}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              <ShareButtons title={post.title} url={canonicalUrl} className="mt-6" />
            </header>

            <section className="prose prose-slate mt-10 max-w-none prose-headings:scroll-mt-24 prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline">
              <RichText data={post.content} />
            </section>

            <div className="mt-12">
              <CTABanner
                variant="inline"
                title="Need fast, reliable access?"
                description="Use our top recommended VPN providers to restore access and keep your browsing private."
                buttonText="See Recommended VPNs"
                affiliateKey="nordvpn"
              />
            </div>
          </article>

          <aside className="hidden lg:block">
            <TableOfContents />
          </aside>
        </div>
      </div>
    </main>
  )
}
