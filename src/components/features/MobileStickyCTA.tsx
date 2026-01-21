'use client'

import { ExternalLink } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export function MobileStickyCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const heroHeight = window.innerHeight * 0.6
      setIsVisible(scrollY > heroHeight)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-slate-900/95 to-slate-900/90 backdrop-blur-sm md:hidden safe-area-inset-bottom">
      <a
        href={siteConfig.affiliates.nordvpn}
        target="_blank"
        rel="noopener"
        className={cn(
          'flex items-center justify-center gap-2 w-full py-4',
          'bg-gradient-to-r from-green-500 to-emerald-500',
          'rounded-xl text-white font-bold text-lg',
          'shadow-lg shadow-green-500/30',
          'active:scale-95 transition-transform'
        )}
      >
        <ExternalLink className="h-5 w-5" />
        Unblock Websites Now
      </a>
    </div>
  )
}
