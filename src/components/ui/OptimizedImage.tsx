'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  blurDataURL?: string
}

/**
 * OptimizedImage component
 *
 * Performance optimizations:
 * - Uses Next.js Image component for automatic optimization
 * - Supports WebP format with fallback
 * - Implements lazy loading for non-priority images
 * - Adds blur placeholder during load
 * - Responsive sizes for different breakpoints
 * - Prevents layout shift with aspect ratio
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Handle error state
  if (error) {
    return (
      <div
        className={cn(
          'bg-slate-100 flex items-center justify-center',
          className
        )}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-slate-400 text-sm">Image not available</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder during load */}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 bg-slate-200 animate-pulse',
            blurDataURL && 'blur-xl'
          )}
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError(true)
        }}
        // Enable image optimization
        quality={85}
        // Allow responsive images
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}
