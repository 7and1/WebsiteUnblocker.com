import { Footer, Header } from '@/components'
import '@/app/globals.css'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />

      {children}

      <Footer />
    </>
  )
}
