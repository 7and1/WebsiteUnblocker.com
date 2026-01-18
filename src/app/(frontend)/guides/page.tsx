'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type Category = 'all' | 'streaming' | 'social' | 'messaging' | 'gaming' | 'privacy'

interface Guide {
  slug: string
  title: string
  description: string
  category: Category
  featured?: boolean
}

const guides: Guide[] = [
  { slug: 'unblock-youtube', title: 'How to Unblock YouTube', description: 'Access YouTube anywhere with these proven methods.', category: 'streaming', featured: true },
  { slug: 'unblock-netflix', title: 'Unblock Netflix from Anywhere', description: 'Watch your favorite shows regardless of location.', category: 'streaming', featured: true },
  { slug: 'bypass-school-restrictions', title: 'Bypass School Network Restrictions', description: 'Access blocked sites on school networks safely.', category: 'privacy' },
  { slug: 'unblock-twitter', title: 'Access Twitter/X in Restricted Regions', description: 'Stay connected even when Twitter is blocked.', category: 'social' },
  { slug: 'unblock-discord', title: 'Unblock Discord at School or Work', description: 'Chat with friends on restricted networks.', category: 'gaming' },
  { slug: 'unblock-telegram', title: 'Access Telegram Anywhere', description: 'Bypass government censorship for Telegram.', category: 'messaging' },
  { slug: 'unlock-hulu', title: 'Watch Hulu Outside the US', description: 'Stream Hulu from anywhere in the world.', category: 'streaming' },
  { slug: 'unblock-instagram', title: 'Unblock Instagram on Restricted Networks', description: 'Access your social media accounts anywhere.', category: 'social' },
  { slug: 'vpn-for-china', title: 'Best VPNs for China', description: 'Reliable VPNs that work in China.', category: 'privacy', featured: true },
  { slug: 'unblock-reddit', title: 'How to Unblock Reddit', description: 'Access Reddit from anywhere.', category: 'social' },
  { slug: 'unblock-signal', title: 'Use Signal in Censored Countries', description: 'Secure messaging access worldwide.', category: 'messaging' },
  { slug: 'gaming-vpn-guide', title: 'Best VPNs for Gaming', description: 'Low-latency VPNs for online gaming.', category: 'gaming' },
]

const categories: Array<{ value: Category; label: string; count: number }> = [
  { value: 'all', label: 'All Guides', count: guides.length },
  { value: 'streaming', label: 'Streaming', count: guides.filter(g => g.category === 'streaming').length },
  { value: 'social', label: 'Social Media', count: guides.filter(g => g.category === 'social').length },
  { value: 'messaging', label: 'Messaging', count: guides.filter(g => g.category === 'messaging').length },
  { value: 'gaming', label: 'Gaming', count: guides.filter(g => g.category === 'gaming').length },
  { value: 'privacy', label: 'Privacy', count: guides.filter(g => g.category === 'privacy').length },
]

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredGuides = guides.filter(g => g.featured)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Unblocking Guides</h1>
          <p className="text-xl text-slate-600">
            Step-by-step guides to unblock websites, bypass restrictions, and access content safely.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <div className="flex items-center gap-2 mb-4 lg:hidden">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Filter</span>
              </div>
              <nav className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      'w-full text-left px-4 py-2 rounded-lg text-sm transition-colors',
                      selectedCategory === cat.value
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <span className="flex items-center justify-between">
                      {cat.label}
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        selectedCategory === cat.value ? 'bg-blue-100' : 'bg-slate-100'
                      )}>
                        {cat.count}
                      </span>
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>

            {selectedCategory === 'all' && !searchQuery && featuredGuides.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured Guides</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredGuides.map(guide => (
                    <Link
                      key={guide.slug}
                      href={`/guides/${guide.slug}`}
                      className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 transition-all hover:shadow-lg"
                    >
                      <span className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Featured
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-slate-600">{guide.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {selectedCategory === 'all' ? 'All Guides' : categories.find(c => c.value === selectedCategory)?.label}
                <span className="ml-2 text-lg font-normal text-slate-500">({filteredGuides.length})</span>
              </h2>

              {filteredGuides.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No guides found matching your search.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGuides.map(guide => (
                    <Link
                      key={guide.slug}
                      href={`/guides/${guide.slug}`}
                      className="block group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                            {guide.title}
                          </h3>
                          <p className="text-slate-600">{guide.description}</p>
                        </div>
                        <span className="flex-shrink-0 text-xs font-medium text-slate-500 uppercase tracking-wide px-2 py-1 bg-slate-100 rounded">
                          {guide.category}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
