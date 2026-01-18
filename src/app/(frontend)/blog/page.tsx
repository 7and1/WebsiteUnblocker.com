import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { BlogCard } from '@/components'
import { buildMetadata, buildBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata = buildMetadata({
  title: 'Blog - Unblocking Guides & Tutorials',
  description: 'Learn how to unblock websites, bypass geo-restrictions, and access content safely.',
  path: '/blog',
})

export const revalidate = 3600

type Props = {
  searchParams?: { page?: string; tag?: string }
}

export default async function BlogPage({ searchParams = {} }: Props) {
  const page = Number(searchParams.page || '1')
  const tag = searchParams.tag ? decodeURIComponent(searchParams.tag) : undefined

  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    limit: 12,
    page,
    sort: '-published_date',
    where: tag ? { tags: { contains: tag } } : undefined,
  })

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Unblocking Guides</h1>
        <p className="text-xl text-slate-600 mb-12">
          Learn how to access any website safely and securely
        </p>

        {posts.docs.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p>No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.docs.map((post: any) => (
              <BlogCard
                key={post.id}
                title={post.title}
                slug={post.slug}
                tags={post.tags}
                description={post.meta_description}
                date={post.published_date}
              />
            ))}
          </div>
        )}

        {posts.totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            {Array.from({ length: posts.totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <Link
                key={pageNumber}
                href={`/blog?page=${pageNumber}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`}
                className={`rounded-lg border px-3 py-1 transition-colors ${
                  pageNumber === posts.page ? 'border-blue-600 text-blue-600' : 'border-slate-200'
                }`}
              >
                {pageNumber}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
