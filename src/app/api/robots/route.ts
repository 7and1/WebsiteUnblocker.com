import { siteConfig } from '@/config/site'

// Cloudflare Workers compatible runtime (default nodejs with nodejs_compat)

export async function GET() {
  const content = `# Robots.txt for ${siteConfig.name}
# Last updated: ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /

# Disallow admin and private paths
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /*.json$

# Allow important API endpoints for indexing
Allow: /api/sitemap.xml
Allow: /api/sitemap-static.xml
Allow: /api/sitemap-unblock.xml
Allow: /api/sitemap-blocked.xml
Allow: /api/sitemap-blog.xml
Allow: /api/robots.txt

# SEO Tools - Allow crawling for analysis
User-agent: AhrefsBot
Allow: /

User-agent: SemrushBot
Allow: /

User-agent: Screaming Frog SEO Spider
Allow: /

User-agent: MJ12bot
Allow: /

User-agent: DotBot
Allow: /

# Sitemap Index
Sitemap: ${siteConfig.url}/sitemap.xml
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
    },
  })
}
