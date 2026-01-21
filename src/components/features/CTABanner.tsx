'use client'

import { Shield, X } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

type CTAVariant = 'inline' | 'fullwidth' | 'modal'

interface CTABannerProps {
  variant: CTAVariant
  title: string
  description?: string
  buttonText: string
  affiliateKey: keyof typeof siteConfig.affiliates
  onClose?: () => void
  isOpen?: boolean
}

export function CTABanner({
  variant,
  title,
  description,
  buttonText,
  affiliateKey,
  onClose,
  isOpen = true,
}: CTABannerProps) {
  const affiliateUrl = siteConfig.affiliates[affiliateKey]

  if (variant === 'modal') {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl bg-white p-8 animate-in zoom-in-95 duration-200">
              <button onClick={onClose} className="absolute right-4 top-4">
                <X className="h-5 w-5" />
              </button>
              <h3 className="mb-4 text-2xl font-bold text-slate-900">{title}</h3>
              {description && <p className="mb-6 text-slate-600">{description}</p>}
              <a
                href={affiliateUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                {buttonText}
              </a>
            </div>
          </div>
        )}
      </>
    )
  }

  if (variant === 'fullwidth') {
    return (
      <section className="bg-slate-900 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">{title}</h2>
          {description && <p className="mb-8 text-lg text-slate-400">{description}</p>}
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-emerald-600"
          >
            <Shield className="h-5 w-5" />
            {buttonText}
          </a>
        </div>
      </section>
    )
  }

  return (
    <div
      className={cn(
        'my-8 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-amber-50 p-6'
      )}
    >
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h3 className="font-bold text-slate-900">{title}</h3>
          {description && <p className="text-sm text-slate-600">{description}</p>}
        </div>
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          {buttonText}
        </a>
      </div>
    </div>
  )
}
