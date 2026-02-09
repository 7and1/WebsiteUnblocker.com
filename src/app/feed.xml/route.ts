import { siteConfig } from '@/config/site'
import { buildContentExcerpt, getPublishedPosts } from '@/lib/content/posts'

export const runtime = 'nodejs'

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const posts = await getPublishedPosts(50)
  const lastBuildDate = new Date().toUTCString()

  const items = posts
    .map((post) => {
      const postUrl = `${siteConfig.url}/guides/${post.slug}`
      const description = post.meta_description?.trim() || buildContentExcerpt(
        post.content,
        `Guide: ${post.title}`,
        260
      )
      const published = post.published_date || post.updatedAt || new Date().toISOString()

      return `<item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${new Date(published).toUTCString()}</pubDate>
      ${(post.tags || []).map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`
    })
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(siteConfig.url)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(siteConfig.url)}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Next.js</generator>
    ${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
