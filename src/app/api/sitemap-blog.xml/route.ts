import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'

// Use nodejs runtime to access Payload CMS
export const runtime = 'nodejs'

interface SitemapImage {
  loc: string
  caption?: string
  title?: string
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

function buildSitemapUrl(
  path: string,
  {
    priority,
    changefreq,
    lastmod,
    images,
  }: {
    priority: number
    changefreq: string
    lastmod?: string
    images?: SitemapImage[]
  }
) {
  const url = absoluteUrl(path, siteConfig.url)
  const parts = [
    '<url>',
    `<loc>${escapeXml(url)}</loc>`,
    `<changefreq>${changefreq}</changefreq>`,
    `<priority>${priority.toFixed(1)}</priority>`,
  ]

  if (lastmod) {
    parts.push(`<lastmod>${escapeXml(new Date(lastmod).toISOString())}</lastmod>`)
  }

  if (images && images.length > 0) {
    images.forEach((image) => {
      parts.push('<image:image>')
      parts.push(`<image:loc>${escapeXml(image.loc)}</image:loc>`)
      if (image.caption) {
        parts.push(`<image:caption>${escapeXml(image.caption)}</image:caption>`)
      }
      if (image.title) {
        parts.push(`<image:title>${escapeXml(image.title)}</image:title>`)
      }
      parts.push('</image:image>')
    })
  }

  parts.push('</url>')
  return parts.join('')
}

async function getBlogPosts(): Promise<Array<{ slug: string; updatedAt: string; image?: string }>> {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'posts',
      limit: 1000,
      sort: '-published_date',
      depth: 0,
    })
    return posts.docs.map((post: any) => ({
      slug: post.slug,
      updatedAt: post.updatedAt || post.published_date,
      image: post.hero_image,
    }))
  } catch {
    return []
  }
}

export async function GET() {
  const now = new Date().toISOString()

  // Blog index page
  const blogIndexUrl = buildSitemapUrl('/blog', {
    priority: 0.9,
    changefreq: 'daily',
    lastmod: now,
  })

  // Fetch blog posts from Payload CMS
  const blogPosts = await getBlogPosts()
  const blogPages = blogPosts.map((post) =>
    buildSitemapUrl(`/blog/${post.slug}`, {
      priority: 0.8,
      changefreq: 'monthly',
      lastmod: post.updatedAt,
      images: post.image
        ? [
            {
              loc: absoluteUrl(post.image, siteConfig.url),
              caption: `Blog post featured image`,
              title: 'Website Unblocker Blog',
            },
          ]
        : undefined,
    })
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${blogIndexUrl}
${blogPages.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
    },
  })
}
