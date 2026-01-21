import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

interface BlogCardProps {
  title: string
  slug: string
  tags?: string[]
  description?: string
  date?: string | Date
  image?: {
    url: string
    alt: string
    blurDataURL?: string
  }
}

export function BlogCard({ title, slug, tags, description, date, image }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-lg"
    >
      {image && (
        <div className="relative mb-4 aspect-video overflow-hidden rounded-xl">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            placeholder={image.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={image.blurDataURL}
          />
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {tag}
          </span>
        ))}
      </div>

      <h3 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
        {title}
      </h3>

      <p className="line-clamp-2 text-sm text-slate-500">
        {description || 'Read our comprehensive guide...'}
      </p>

      {date && <p className="mt-4 text-xs text-slate-400">{formatDate(date)}</p>}
    </Link>
  )
}
