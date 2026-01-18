/**
 * Performance monitoring utilities
 *
 * Tracks Core Web Vitals for performance optimization:
 * - LCP (Largest Contentful Paint): Largest element visible in viewport
 * - INP (Interaction to Next Paint): Responsiveness to user input
 * - CLS (Cumulative Layout Shift): Visual stability of the page
 * - FCP (First Contentful Paint): First content rendered
 * - TTFB (Time to First Byte): Server response time
 */

export interface WebVitalsData {
  lcp?: number
  inp?: number
  cls?: number
  fcp?: number
  ttfb?: number
}

// Connection types for adaptive loading
export type ConnectionType =
  | 'slow-2g'
  | '2g'
  | '3g'
  | '4g'
  | 'offline'

/**
 * Get estimated connection type from Navigator
 */
export function getConnectionType(): ConnectionType {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return '4g'
  }

  const conn = (navigator as any).connection
  return conn?.effectiveType || '4g'
}

/**
 * Check if user is on a slow connection
 */
export function isSlowConnection(): boolean {
  const type = getConnectionType()
  return type === 'slow-2g' || type === '2g' || type === 'offline'
}

/**
 * Get device memory (in GB) if available
 */
export function getDeviceMemory(): number {
  if (typeof navigator === 'undefined' || !('deviceMemory' in navigator)) {
    return 8 // Default assumption
  }
  return (navigator as any).deviceMemory || 8
}

/**
 * Get hardware concurrency (CPU cores)
 */
export function getHardwareConcurrency(): number {
  if (typeof navigator === 'undefined' || !('hardwareConcurrency' in navigator)) {
    return 4 // Default assumption
  }
  return (navigator as any).hardwareConcurrency || 4
}

/**
 * Report Web Vitals to analytics
 *
 * In production, send to your analytics service
 * For now, logs to console in development
 */
export function reportWebVitals(data: WebVitalsData): void {
  if (process.env.NODE_ENV === 'development') {
    console.table(data)
  }

  // Send to analytics service in production
  if (typeof window !== 'undefined' && 'gtag' in window) {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        ;(window as any).gtag('event', key, {
          value: Math.round(key === 'cls' ? value * 1000 : value),
          event_category: 'Web Vitals',
          non_interaction: true,
        })
      }
    })
  }
}

/**
 * Measure TTFB (Time to First Byte)
 * Uses PerformanceResourceTiming for the main document
 */
export function measureTTFB(): number | undefined {
  if (typeof window === 'undefined' || !window.performance) {
    return undefined
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  if (!navigation) return undefined

  return navigation.responseStart - navigation.requestStart
}

/**
 * Measure FCP (First Contentful Paint)
 */
export function measureFCP(): number | undefined {
  if (typeof window === 'undefined' || !window.performance) {
    return undefined
  }

  const paintEntries = performance.getEntriesByType('paint')
  const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint')

  return fcpEntry?.startTime
}

/**
 * Setup Web Vitals monitoring
 *
 * Collects all available metrics and reports them
 */
export function setupWebVitalsMonitoring(): void {
  if (typeof window === 'undefined') return

  // Wait for page to fully load
  if (document.readyState === 'complete') {
    collectAndReportVitals()
  } else {
    window.addEventListener('load', collectAndReportVitals)
  }
}

function collectAndReportVitals(): void {
  // Small delay to ensure all metrics are available
  setTimeout(() => {
    const data: WebVitalsData = {
      ttfb: measureTTFB(),
      fcp: measureFCP(),
    }

    // Collect LCP using PerformanceObserver
    observeLCP((value) => {
      data.lcp = value
      reportWebVitals({ ...data, lcp: value })
    })

    // Collect CLS using PerformanceObserver
    observeCLS((value) => {
      data.cls = value
      reportWebVitals({ ...data, cls: value })
    })

    // Report initial metrics
    reportWebVitals(data)
  }, 1000)
}

/**
 * Observe Largest Contentful Paint (LCP)
 */
function observeLCP(callback: (value: number) => void): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      callback(lastEntry.startTime)
    })

    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (e) {
    // LCP not supported
  }
}

/**
 * Observe Cumulative Layout Shift (CLS)
 */
function observeCLS(callback: (value: number) => void): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return
  }

  let clsValue = 0

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          callback(clsValue)
        }
      }
    })

    observer.observe({ entryTypes: ['layout-shift'] })
  } catch (e) {
    // CLS not supported
  }
}

/**
 * Performance mark for custom timing
 */
export function markPerformance(name: string): void {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name)
  }
}

/**
 * Measure time between two marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string): number | undefined {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name)[0] as PerformanceMeasure
      return measure?.duration
    } catch (e) {
      // Marks might not exist
    }
  }
  return undefined
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = undefined
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Request animation frame throttle
 * Useful for scroll handlers and visual updates
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | undefined

  return function executedFunction(...args: Parameters<T>) {
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId)
    }
    rafId = requestAnimationFrame(() => {
      func(...args)
      rafId = undefined
    })
  }
}
