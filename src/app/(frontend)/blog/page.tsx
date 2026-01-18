'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { BlogCard } from '@/components'
import { cn } from '@/lib/utils'

type Category = 'all' | 'streaming' | 'privacy' | 'gaming' | 'social' | 'tools'

interface BlogPost {
  id: string
  title: string
  slug: string
  description: string
  date: string
  tags: string[]
  category: Category
  featured?: boolean
  image?: {
    url: string
    alt: string
  }
}

// Sample blog posts - this would typically come from Payload CMS
const samplePosts: BlogPost[] = [
  {
    id: '1',
    title: 'How to Unblock YouTube at School or Work',
    slug: 'unblock-youtube-school',
    description: 'Learn effective methods to access YouTube when it\'s blocked on your network.',
    date: '2024-01-15',
    tags: ['streaming', 'youtube', 'unblock'],
    category: 'streaming',
    featured: true,
  },
  {
    id: '2',
    title: 'Best VPNs for Netflix in 2024',
    slug: 'best-vpn-netflix-2024',
    description: 'Our comprehensive review of VPNs that reliably unblock Netflix libraries worldwide.',
    date: '2024-01-10',
    tags: ['streaming', 'netflix', 'vpn'],
    category: 'streaming',
    featured: true,
  },
  {
    id: '3',
    title: 'NordVPN vs ExpressVPN: Which is Better?',
    slug: 'nordvpn-vs-expressvpn-2024',
    description: 'A detailed comparison of two leading VPN providers across speed, price, and features.',
    date: '2024-01-05',
    tags: ['comparison', 'vpn', 'review'],
    category: 'privacy',
    featured: true,
  },
  {
    id: '4',
    title: 'How to Bypass Geo-Restrictions for Streaming',
    slug: 'bypass-geo-restrictions',
    description: 'Understanding and bypassing geographic content blocks on streaming platforms.',
    date: '2024-01-02',
    tags: ['streaming', 'guide', 'privacy'],
    category: 'streaming',
  },
  {
    id: '5',
    title: 'Gaming with a VPN: Does It Affect Ping?',
    slug: 'gaming-vpn-ping',
    description: 'Analyzing the impact of VPNs on gaming performance and latency.',
    date: '2023-12-28',
    tags: ['gaming', 'vpn', 'performance'],
    category: 'gaming',
  },
  {
    id: '6',
    title: 'Free vs Paid VPNs: What You Need to Know',
    slug: 'free-vs-paid-vpn',
    description: 'Understanding the risks and limitations of free VPN services.',
    date: '2023-12-20',
    tags: ['privacy', 'vpn', 'security'],
    category: 'privacy',
  },
  {
    id: '7',
    title: 'How to Unblock Twitter/X in Restricted Countries',
    slug: 'unblock-twitter-restricted',
    description: 'Methods to access Twitter when facing government censorship.',
    date: '2023-12-15',
    tags: ['social', 'twitter', 'unblock'],
    category: 'social',
  },
  {
    id: '8',
    title: 'DNS Leaks: What They Are and How to Prevent Them',
    slug: 'dns-leaks-prevent',
    description: 'Protecting your privacy by preventing DNS leaks while using a VPN.',
    date: '2023-12-10',
    tags: ['privacy', 'security', 'technical'],
    category: 'privacy',
  },
]

const categories: Array<{ value: Category; label: string; count: number }> = [
  { value: 'all', label: 'All Posts', count: samplePosts.length },
  { value: 'streaming', label: 'Streaming', count: samplePosts.filter(p => p.category === 'streaming').length },
  { value: 'privacy', label: 'Privacy', count: samplePosts.filter(p => p.category === 'privacy').length },
  { value: 'gaming', label: 'Gaming', count: samplePosts.filter(p => p.category === 'gaming').length },
  { value: 'social', label: 'Social Media', count: samplePosts.filter(p => p.category === 'social').length },
  { value: 'tools', label: 'Tools', count: 0 },
]

const POSTS_PER_PAGE = 6

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredPosts = samplePosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredPosts = samplePosts.filter(p => p.featured)
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Unblocking Guides & Tutorials</h1>
          <p className="text-xl text-slate-600">
            Expert guides to help you access blocked content and protect your privacy online.
          </p>
        </div>

        {/* Featured Section */}
        {selectedCategory === 'all' && !searchQuery && featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured Guides</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map(post => (
                <div
                  key={post.id}
                  className="group relative rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-1"
                >
                  <span className="absolute top-4 right-4 z-10 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Featured
                  </span>
                  <BlogCard
                    title={post.title}
                    slug={post.slug}
                    tags={post.tags}
                    description={post.description}
                    date={post.date}
                    image={post.image}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-8">
              {/* Search */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Search</span>
                </div>
                <Input
                  type="search"
                  placeholder="Search guides..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Categories</span>
                </div>
                <nav className="space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={cn(
                        'w-full text-left px-4 py-2 rounded-lg text-sm transition-colors',
                        selectedCategory === cat.value
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <span className="flex items-center justify-between">
                        {cat.label}
                        {cat.count > 0 && (
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            selectedCategory === cat.value ? 'bg-blue-100' : 'bg-slate-100'
                          )}>
                            {cat.count}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Popular Tags */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['vpn', 'streaming', 'netflix', 'privacy', 'unblock', 'youtube'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleSearchChange(tag)}
                      className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {selectedCategory === 'all' ? 'All Guides' : categories.find(c => c.value === selectedCategory)?.label}
                <span className="ml-2 text-base font-normal text-slate-500">({filteredPosts.length})</span>
              </h2>
            </div>

            {paginatedPosts.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No guides found matching your search.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    handleSearchChange('')
                    handleCategoryChange('all')
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {paginatedPosts.map(post => (
                    <BlogCard
                      key={post.id}
                      title={post.title}
                      slug={post.slug}
                      tags={post.tags}
                      description={post.description}
                      date={post.date}
                      image={post.image}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
