import { Footer, Header } from '@/components'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CookieConsent } from '@/components/features/CookieConsent'
import { MobileStickyCTA } from '@/components/features/MobileStickyCTA'
import '@/app/globals.css'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      <Footer />
      <CookieConsent />
      <MobileStickyCTA />
    </>
  )
}
