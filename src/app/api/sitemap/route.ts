import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'
import { unblockTargets, blockedTargets, tools, vpnComparisons, vpnBestFor, vpnProviders } from '@/lib/content'

// Use nodejs runtime to access Payload CMS
export const runtime = 'nodejs'

interface SitemapImage {
  loc: string
  caption?: string
  title?: string
}

interface SitemapUrlEntry {
  path: string
  priority: number
  changefreq: string
  lastmod?: string
  images?: SitemapImage[]
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
  // Get current date for lastmod
  const now = new Date().toISOString()
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const staticPages: SitemapUrlEntry[] = [
    { path: '/', priority: 1.0, changefreq: 'daily', lastmod: now },
    { path: '/blog', priority: 0.9, changefreq: 'daily', lastmod: now },
    { path: '/affiliate-disclosure', priority: 0.4, changefreq: 'yearly', lastmod: '2026-01-01' },
    { path: '/tools', priority: 0.7, changefreq: 'monthly', lastmod: lastMonth },
    { path: '/unblock', priority: 0.8, changefreq: 'weekly', lastmod: now },
    { path: '/blocked', priority: 0.7, changefreq: 'weekly', lastmod: now },
    { path: '/compare', priority: 0.6, changefreq: 'monthly', lastmod: lastMonth },
    { path: '/vpn', priority: 0.7, changefreq: 'monthly', lastmod: lastMonth },
    { path: '/about', priority: 0.5, changefreq: 'yearly', lastmod: '2026-01-01' },
    { path: '/contact', priority: 0.4, changefreq: 'yearly', lastmod: '2026-01-01' },
    { path: '/privacy', priority: 0.5, changefreq: 'yearly', lastmod: '2026-01-01' },
    { path: '/terms', priority: 0.5, changefreq: 'yearly', lastmod: '2026-01-01' },
  ]

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

  const unblockPages = unblockTargets.map((target) =>
    buildSitemapUrl(`/unblock/${target.slug}`, {
      priority: 0.7,
      changefreq: 'weekly',
      lastmod: lastMonth,
    })
  )

  const blockedPages = blockedTargets.map((target) =>
    buildSitemapUrl(`/blocked/${target.slug}`, {
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: lastMonth,
    })
  )

  const toolPages = tools.map((tool) =>
    buildSitemapUrl(`/tools/${tool.slug}`, {
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: lastMonth,
    })
  )

  const comparisonPages = vpnComparisons.map((comparison) =>
    buildSitemapUrl(`/compare/${comparison.slug}`, {
      priority: 0.5,
      changefreq: 'monthly',
      lastmod: lastMonth,
    })
  )

  const vpnPages = vpnProviders.map((provider) =>
    buildSitemapUrl(`/vpn/${provider.slug}-review`, {
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: lastMonth,
    })
  )

  const vpnBestPages = vpnBestFor.map((item) =>
    buildSitemapUrl(`/vpn/${item.slug}`, {
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: lastMonth,
    })
  )

  const urls = [
    ...staticPages.map((page) =>
      buildSitemapUrl(page.path, {
        priority: page.priority,
        changefreq: page.changefreq,
        lastmod: page.lastmod,
        images: page.images,
      })
    ),
    ...blogPages,
    ...unblockPages,
    ...blockedPages,
    ...toolPages,
    ...comparisonPages,
    ...vpnPages,
    ...vpnBestPages,
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
    },
  })
}
