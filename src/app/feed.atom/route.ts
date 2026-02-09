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

  const entries = posts
    .map((post) => {
      const postUrl = `${siteConfig.url}/guides/${post.slug}`
      const summary = post.meta_description?.trim() || buildContentExcerpt(
        post.content,
        `Guide: ${post.title}`,
        260
      )
      const published = new Date(post.published_date || post.updatedAt || new Date()).toISOString()
      const updated = new Date(post.updatedAt || post.published_date || new Date()).toISOString()

      return `<entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${escapeXml(postUrl)}"/>
    <id>${escapeXml(postUrl)}</id>
    <updated>${updated}</updated>
    <published>${published}</published>
    <summary>${escapeXml(summary)}</summary>
  </entry>`
    })
    .join('\n')

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteConfig.name)}</title>
  <subtitle>${escapeXml(siteConfig.description)}</subtitle>
  <link href="${escapeXml(siteConfig.url)}/feed.atom" rel="self"/>
  <link href="${escapeXml(siteConfig.url)}"/>
  <id>${escapeXml(siteConfig.url)}/</id>
  <updated>${new Date().toISOString()}</updated>
  <generator>Next.js</generator>
  ${entries}
</feed>`

  return new Response(atom, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
