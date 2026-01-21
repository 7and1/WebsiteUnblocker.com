'use client'

import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReadingTimeProps {
  content: string
  className?: string
}

const WORDS_PER_MINUTE = 200

export function ReadingTime({ content, className }: ReadingTimeProps) {
  const wordCount = content.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))

  return (
    <div className={cn('flex items-center gap-1.5 text-slate-500 text-sm', className)}>
      <Clock className="w-4 h-4" />
      <span>{minutes} min read</span>
    </div>
  )
}

export function getReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}
