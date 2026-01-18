import Link from 'next/link'
import { BlogCard } from '@/components'

interface RelatedPostsProps {
  currentSlug: string
  currentTags?: string[]
  currentCategory?: string
  limit?: number
  title?: string
}

interface Post {
  id: string
  title: string
  slug: string
  description?: string
  date?: string | Date
  tags?: string[]
  category?: string
  image?: {
    url: string
    alt: string
  }
}

// Sample posts data - in production, this would come from Payload CMS
const samplePosts: Post[] = [
  {
    id: '1',
    title: 'How to Unblock YouTube at School or Work',
    slug: 'unblock-youtube-school',
    description: 'Learn effective methods to access YouTube when blocked.',
    date: '2024-01-15',
    tags: ['streaming', 'youtube', 'unblock'],
    category: 'streaming',
  },
  {
    id: '2',
    title: 'Best VPNs for Netflix in 2024',
    slug: 'best-vpn-netflix-2024',
    description: 'Comprehensive review of VPNs that unblock Netflix.',
    date: '2024-01-10',
    tags: ['streaming', 'netflix', 'vpn'],
    category: 'streaming',
  },
  {
    id: '3',
    title: 'NordVPN vs ExpressVPN Comparison',
    slug: 'nordvpn-vs-expressvpn-2024',
    description: 'Detailed comparison of two leading VPN providers.',
    date: '2024-01-05',
    tags: ['comparison', 'vpn', 'review'],
    category: 'privacy',
  },
  {
    id: '4',
    title: 'Bypass Geo-Restrictions for Streaming',
    slug: 'bypass-geo-restrictions',
    description: 'Understanding and bypassing geographic content blocks.',
    date: '2024-01-02',
    tags: ['streaming', 'guide', 'privacy'],
    category: 'streaming',
  },
  {
    id: '5',
    title: 'Gaming with a VPN: Does It Affect Ping?',
    slug: 'gaming-vpn-ping',
    description: 'Analyzing VPN impact on gaming performance.',
    date: '2023-12-28',
    tags: ['gaming', 'vpn', 'performance'],
    category: 'gaming',
  },
  {
    id: '6',
    title: 'Free vs Paid VPNs: What You Need to Know',
    slug: 'free-vs-paid-vpn',
    description: 'Understanding risks and limitations of free VPNs.',
    date: '2023-12-20',
    tags: ['privacy', 'vpn', 'security'],
    category: 'privacy',
  },
]

/**
 * Calculate relevance score between current post and candidate post
 * Higher score = more relevant
 */
function calculateRelevanceScore(
  currentTags: string[],
  currentCategory: string,
  candidatePost: Post
): number {
  let score = 0

  // Category match: high weight
  if (currentCategory && candidatePost.category === currentCategory) {
    score += 10
  }

  // Tag matching: medium weight per matching tag
  if (currentTags && candidatePost.tags) {
    const matchingTags = currentTags.filter(tag =>
      candidatePost.tags?.some(candidateTag =>
        candidateTag.toLowerCase() === tag.toLowerCase()
      )
    )
    score += matchingTags.length * 5
  }

  // Add small random factor to shuffle equal-scored posts
  score += Math.random() * 0.5

  return score
}

export function RelatedPosts({
  currentSlug,
  currentTags = [],
  currentCategory = '',
  limit = 3,
  title = 'Related Guides',
}: RelatedPostsProps) {
  // Get all posts except the current one
  const candidates = samplePosts.filter(post => post.slug !== currentSlug)

  // Score and sort by relevance
  const relatedPosts = candidates
    .map(post => ({
      ...post,
      score: calculateRelevanceScore(currentTags, currentCategory, post),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <aside className="border-t border-slate-200 pt-8 mt-12">
      <h3 className="text-xl font-bold text-slate-900 mb-6">{title}</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map(post => (
          <BlogCard
            key={post.slug}
            title={post.title}
            slug={post.slug}
            tags={post.tags}
            description={post.description}
            date={post.date}
            image={post.image}
          />
        ))}
      </div>

      {/* Browse all link */}
      <Link
        href="/blog"
        className="inline-flex items-center mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        Browse all guides →
      </Link>
    </aside>
  )
}

/**
 * Server-side version for use in blog post pages
 * This version accepts posts directly from Payload CMS
 */
interface RelatedPostsServerProps {
  currentPost: Post
  allPosts: Post[]
  limit?: number
  title?: string
}

export function RelatedPostsServer({
  currentPost,
  allPosts,
  limit = 3,
  title = 'Related Guides',
}: RelatedPostsServerProps) {
  const candidates = allPosts.filter(post => post.slug !== currentPost.slug)

  const relatedPosts = candidates
    .map(post => ({
      ...post,
      score: calculateRelevanceScore(
        currentPost.tags || [],
        currentPost.category || '',
        post
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <aside className="border-t border-slate-200 pt-8 mt-12">
      <h3 className="text-xl font-bold text-slate-900 mb-6">{title}</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map(post => (
          <BlogCard
            key={post.slug}
            title={post.title}
            slug={post.slug}
            tags={post.tags}
            description={post.description}
            date={post.date}
            image={post.image}
          />
        ))}
      </div>

      <Link
        href="/blog"
        className="inline-flex items-center mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        Browse all guides →
      </Link>
    </aside>
  )
}
