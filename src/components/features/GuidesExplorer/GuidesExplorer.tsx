'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import type { GuideCategory, GuideItem } from '@/lib/content'

interface GuidesExplorerProps {
  guides: GuideItem[]
  categories: Array<{ value: GuideCategory; label: string; count: number }>
}

export function GuidesExplorer({ guides, categories }: GuidesExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<GuideCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredGuides = useMemo(
    () =>
      guides.filter((guide) => {
        const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          guide.title.toLowerCase().includes(query) || guide.description.toLowerCase().includes(query)

        return matchesCategory && matchesSearch
      }),
    [guides, searchQuery, selectedCategory]
  )

  const featuredGuides = useMemo(() => guides.filter((guide) => guide.featured), [guides])

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <aside className="flex-shrink-0 lg:w-64">
        <div className="sticky top-8">
          <div className="mb-4 flex items-center gap-2 lg:hidden">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filter</span>
          </div>
          <nav className="space-y-1" aria-label="Guide categories">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={cn(
                  'w-full rounded-lg px-4 py-2 text-left text-sm transition-colors',
                  selectedCategory === category.value
                    ? 'bg-emerald-50 font-semibold text-emerald-600'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <span className="flex items-center justify-between">
                  {category.label}
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs',
                      selectedCategory === category.value ? 'bg-emerald-100' : 'bg-slate-100'
                    )}
                  >
                    {category.count}
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
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-12"
              aria-label="Search guides"
            />
          </div>
        </div>

        {selectedCategory === 'all' && !searchQuery && featuredGuides.length > 0 && (
          <section className="mb-12" aria-label="Featured guides">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Featured Guides</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={guide.href}
                  className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 transition-all hover:shadow-lg"
                >
                  <span className="absolute right-4 top-4 rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                    Featured
                  </span>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
                    {guide.title}
                  </h3>
                  <p className="text-slate-600">{guide.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            {selectedCategory === 'all'
              ? 'All Guides'
              : categories.find((category) => category.value === selectedCategory)?.label}
            <span className="ml-2 text-lg font-normal text-slate-500">({filteredGuides.length})</span>
          </h2>

          {filteredGuides.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p>No guides found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={guide.href}
                  className="group block rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-slate-900 transition-colors group-hover:text-emerald-600">
                        {guide.title}
                      </h3>
                      <p className="text-slate-600">{guide.description}</p>
                    </div>
                    <span className="flex-shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
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
  )
}
