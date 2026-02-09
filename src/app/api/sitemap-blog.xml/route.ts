import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'
import { getGuideTagStats, getPublishedPosts } from '@/lib/content/posts'

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

export async function GET() {
  const now = new Date().toISOString()

  const guidesIndexUrl = buildSitemapUrl('/guides', {
    priority: 0.9,
    changefreq: 'daily',
    lastmod: now,
  })

  const [guidePosts, guideTags] = await Promise.all([
    getPublishedPosts(1000),
    getGuideTagStats(1000),
  ])

  const guidePages = guidePosts.map((post) =>
    buildSitemapUrl(`/guides/${post.slug}`, {
      priority: 0.8,
      changefreq: 'monthly',
      lastmod: post.updatedAt,
    })
  )

  const tagPages = guideTags.map((tag) =>
    buildSitemapUrl(`/tag/${tag.slug}`, {
      priority: 0.6,
      changefreq: 'weekly',
      lastmod: now,
    })
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${guidesIndexUrl}
${guidePages.join('\n')}
${tagPages.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
    },
  })
}
