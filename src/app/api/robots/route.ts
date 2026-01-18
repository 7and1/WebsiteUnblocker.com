import { siteConfig } from '@/config/site'

// Cloudflare Workers compatible runtime (default nodejs with nodejs_compat)

export async function GET() {
  const content = `# Robots.txt for ${siteConfig.name}
# Last updated: ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /

# Crawl-delay to prevent server overload
Crawl-delay: 1

# Disallow admin and private paths
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /*.json$

# Allow important API endpoints for indexing
Allow: /api/sitemap.xml
Allow: /api/robots.txt

# Sitemap reference
Sitemap: ${siteConfig.url}/sitemap.xml

# Additional sitemaps
Sitemap: ${siteConfig.url}/sitemap-blog.xml

# Block aggressive crawlers
User-agent: AhrefsBot
Crawl-delay: 5

User-agent: SemrushBot
Crawl-delay: 5
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
    },
  })
}
