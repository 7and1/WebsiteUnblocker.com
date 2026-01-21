'use client'

import { useState } from 'react'
import { Link2, Check, Twitter, Facebook } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareButtonsProps {
  title: string
  url?: string
  className?: string
}

export function ShareButtons({ title, url, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${title} - ${shareUrl}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'width=550,height=420')
  }

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=550,height=420')
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm font-medium text-slate-700 mr-2">Share:</span>

      <button
        onClick={handleCopy}
        className={cn(
          'inline-flex items-center justify-center gap-1.5',
          'px-3 py-1.5 rounded-lg',
          'text-sm font-medium transition-colors',
          'bg-slate-100 text-slate-700 hover:bg-slate-200',
          copied && 'bg-green-100 text-green-700'
        )}
        aria-label="Copy link"
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy'}
      </button>

      <button
        onClick={shareToTwitter}
        className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        aria-label="Share on X (Twitter)"
      >
        <Twitter className="w-4 h-4" />
      </button>

      <button
        onClick={shareToFacebook}
        className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </button>
    </div>
  )
}
