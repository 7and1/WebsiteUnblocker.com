import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { RichText, CTABanner } from '@/components'
import { buildArticleSchema, buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { formatDate } from '@/lib/utils'

type Props = {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({ collection: 'posts', limit: 1000, depth: 0 })

  return posts.docs.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const post = posts.docs[0]
  if (!post) return buildMetadata({ title: 'Post Not Found', path: `/blog/${slug}` })

  return buildMetadata({
    title: post.meta_title || post.title,
    description: post.meta_description || undefined,
    path: `/blog/${post.slug}`,
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const post = posts.docs[0]
  if (!post) notFound()

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ])

  const articleSchema = buildArticleSchema({
    title: post.title,
    description: post.meta_description || undefined,
    slug: post.slug,
    datePublished: post.published_date || undefined,
    dateModified: post.updatedAt,
  })

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />

      <article className="max-w-3xl mx-auto py-16 px-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags?.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{post.title}</h1>

          {post.published_date && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Calendar className="w-4 h-4" />
              {formatDate(post.published_date)}
            </div>
          )}
        </header>

        <div className="prose prose-slate prose-lg max-w-none">
          <RichText data={post.content} />
        </div>

        <CTABanner
          variant="inline"
          title="Need to Unblock Websites?"
          description="Get unrestricted access to any website with a trusted VPN solution."
          buttonText="Get NordVPN Now"
          affiliateKey="nordvpn"
        />
      </article>
    </main>
  )
}
