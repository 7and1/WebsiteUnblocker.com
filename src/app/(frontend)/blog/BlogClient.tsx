'use client'

import { useState, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { BlogCard } from '@/components'
import { cn } from '@/lib/utils'
import type { PostSummary } from '@/repositories'

type Category = 'all' | 'streaming' | 'privacy' | 'gaming' | 'social' | 'tools'

interface BlogClientProps {
  initialPosts: PostSummary[]
  categories: Array<{ value: Category; label: string }>
  tags: string[]
  initialCategory: Category
  initialSearch: string
  initialPage: number
}

const POSTS_PER_PAGE = 6

export function BlogClient({
  initialPosts,
  categories,
  tags,
  initialCategory,
  initialSearch,
  initialPage,
}: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [currentPage, setCurrentPage] = useState(initialPage)

  const filteredPosts = useMemo(() => {
    return initialPosts.filter(post => {
      const matchesCategory = selectedCategory === 'all' || post.tags?.includes(selectedCategory)
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.meta_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [initialPosts, selectedCategory, searchQuery])

  const featuredPosts = useMemo(() => {
    return filteredPosts.slice(0, 3)
  }, [filteredPosts])

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return ''
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <>
      {/* Featured Section */}
      {selectedCategory === 'all' && !searchQuery && featuredPosts.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured Guides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map(post => (
              <div
                key={String(post.id)}
                className="group relative rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-1"
              >
                <span className="absolute top-4 right-4 z-10 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Featured
                </span>
                <BlogCard
                  title={post.title}
                  slug={post.slug}
                  tags={post.tags}
                  description={post.meta_description}
                  date={formatDate(post.published_date)}
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
                {categories.map(cat => {
                  const count = cat.value === 'all'
                    ? initialPosts.length
                    : initialPosts.filter(p => p.tags?.includes(cat.value)).length
                  return (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={cn(
                        'w-full text-left px-4 py-2 rounded-lg text-sm transition-colors',
                        selectedCategory === cat.value
                          ? 'bg-emerald-50 text-emerald-600 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <span className="flex items-center justify-between">
                        {cat.label}
                        {count > 0 && (
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            selectedCategory === cat.value ? 'bg-emerald-100' : 'bg-slate-100'
                          )}>
                            {count}
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Popular Tags */}
            {tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 10).map(tag => (
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
            )}
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
                    key={String(post.id)}
                    title={post.title}
                    slug={post.slug}
                    tags={post.tags}
                    description={post.meta_description}
                    date={formatDate(post.published_date)}
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
                            ? 'bg-emerald-600 text-white'
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
    </>
  )
}
