import { Suspense } from 'react'
import { Search, Filter, Clock } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { BlogCard, MobileStickyCTA } from '@/components'
import { cn, getReadingTime } from '@/lib/utils'
import { BlogClient } from './BlogClient'

type Category = 'all' | 'streaming' | 'privacy' | 'gaming' | 'social' | 'tools'

interface BlogPageProps {
  searchParams: Promise<{ category?: Category; q?: string; page?: string }>
}

async function getPosts() {
  const { getPostList } = await import('@/services/PostService')
  try {
    const result = await getPostList({ limit: 100 })
    return result.docs
  } catch {
    return []
  }
}

async function getTags() {
  const { getAllTags } = await import('@/services/PostService')
  try {
    return await getAllTags()
  } catch {
    return []
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const [posts, tags] = await Promise.all([getPosts(), getTags()])

  const categories: Array<{ value: Category; label: string }> = [
    { value: 'all', label: 'All Posts' },
    { value: 'streaming', label: 'Streaming' },
    { value: 'privacy', label: 'Privacy' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'social', label: 'Social Media' },
    { value: 'tools', label: 'Tools' },
  ]

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Unblocking Guides & Tutorials</h1>
          <p className="text-xl text-slate-600">
            Expert guides to help you access blocked content and protect your privacy online.
          </p>
        </div>

        <Suspense fallback={<div className="text-slate-500">Loading blog...</div>}>
          <BlogClient
            initialPosts={posts}
            categories={categories}
            tags={tags}
            initialCategory={params.category || 'all'}
            initialSearch={params.q || ''}
            initialPage={Number.parseInt(params.page || '1', 10)}
          />
        </Suspense>
      </div>
      <MobileStickyCTA />
    </main>
  )
}
