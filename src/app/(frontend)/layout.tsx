import { Footer, Header } from '@/components'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CookieConsent } from '@/components/features/CookieConsent'
import '@/app/globals.css'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />

      <ErrorBoundary>{children}</ErrorBoundary>

      <Footer />
      <CookieConsent />
    </>
  )
}
