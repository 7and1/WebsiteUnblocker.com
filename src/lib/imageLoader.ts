/**
 * Cloudflare Image Loader
 * 
 * Custom image loader for Next.js optimized for Cloudflare environment.
 * Supports Cloudflare Image Resizing when available, falls back to original URL.
 * 
 * Usage in next.config.js:
 * images: {
 *   loader: 'custom',
 *   loaderFile: './src/lib/imageLoader.ts',
 * }
 */

interface ImageLoaderParams {
  src: string
  width: number
  quality?: number
}

export default function cloudflareLoader({ src, width, quality }: ImageLoaderParams): string {
  // For absolute URLs (external images), return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    // If Cloudflare Image Resizing is enabled, use it
    // Format: /cdn-cgi/image/width=X,quality=Y/URL
    const cfParams = ['width=' + width, 'fit=scale-down', 'format=auto']
    if (quality) {
      cfParams.push('quality=' + quality)
    }
    // Uncomment below line to enable Cloudflare Image Resizing for external images
    // return '/cdn-cgi/image/' + cfParams.join(',') + '/' + src
    return src
  }

  // For local images, use Cloudflare Image Resizing if available
  const params = ['width=' + width, 'fit=scale-down', 'format=auto']
  if (quality) {
    params.push('quality=' + quality)
  }

  // Check if running on Cloudflare (has cf-ray header in production)
  // In production with Image Resizing enabled:
  // return '/cdn-cgi/image/' + params.join(',') + src
  
  // Default: return original source for development or when Image Resizing is disabled
  return src
}

/**
 * Helper to generate responsive image srcset
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920],
  quality = 75
): string {
  return widths
    .map((width) => cloudflareLoader({ src, width, quality }) + ' ' + width + 'w')
    .join(', ')
}

/**
 * Helper to get optimized image URL with specific width
 */
export function getOptimizedImageUrl(src: string, width: number, quality?: number): string {
  return cloudflareLoader({ src, width, quality })
}
