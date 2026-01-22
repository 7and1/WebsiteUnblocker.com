import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Globe, Lock, Shield, Zap } from 'lucide-react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Code splitting: dynamic imports for non-critical components
// Each component is loaded in its own chunk, reducing initial bundle size
const DiagnosisTool = dynamic(
  () => import('@/components/features/DiagnosisTool').then(m => ({ default: m.DiagnosisTool })),
  {
    loading: () => (
      <div className="w-full max-w-2xl mx-auto">
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <div className="h-8 bg-slate-200 rounded w-48 mb-4" />
          <div className="h-4 bg-slate-200 rounded w-full mb-3" />
          <div className="h-12 bg-slate-200 rounded w-full" />
        </div>
      </div>
    ),
  }
)

const CTABanner = dynamic(
  () => import('@/components/features/CTABanner').then(m => ({ default: m.CTABanner })),
  {
    loading: () => (
      <section className="bg-slate-900 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center animate-pulse">
          <div className="h-10 bg-slate-700 rounded w-2/3 mx-auto mb-6" />
          <div className="h-6 bg-slate-700 rounded w-full max-w-2xl mx-auto mb-8" />
          <div className="h-14 bg-slate-700 rounded w-48 mx-auto" />
        </div>
      </section>
    ),
  }
)

const ProxyRoutes = dynamic(
  () => import('@/components/features/ProxyRoutes').then(m => ({ default: m.ProxyRoutes })),
  {
    loading: () => (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="h-5 w-40 rounded bg-slate-200 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-14 rounded-xl border border-slate-100 bg-slate-50 animate-pulse" />
          ))}
        </div>
      </div>
    ),
  }
)

import {
  buildMetadata,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildFaqSchema,
  buildSoftwareApplicationSchema,
} from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata = buildMetadata({
  title: 'Website Unblocker - Check & Unblock Any Website Free',
  description:
    'Free tool to check if websites are blocked. Instantly diagnose and get solutions to unblock YouTube, Twitter, TikTok and more.',
  path: '/',
})

export default function HomePage() {

  // Build all structured data using centralized schema builders
  const breadcrumbSchema = buildBreadcrumbSchema([{ name: 'Home', path: '/' }])
  const organizationSchema = buildOrganizationSchema()
  const webSiteSchema = buildWebSiteSchema()

  // FAQ Schema for common questions
  const faqSchema = buildFaqSchema([
    {
      question: 'How do I check if a website is blocked?',
      answer: 'Use our free Website Unblocker tool to instantly check if any website is accessible in your region. Simply enter the URL and get immediate results.',
    },
    {
      question: 'What is the best way to unblock websites?',
      answer: 'The most reliable way to unblock websites is using a VPN service. We recommend NordVPN for its speed, security, and ability to bypass geo-restrictions and censorship.',
    },
    {
      question: 'Is it legal to use a VPN to unblock websites?',
      answer: 'Using a VPN is legal in most countries. However, regulations vary by jurisdiction, so we recommend checking your local laws before using any unblocking service.',
    },
    {
      question: 'Why are certain websites blocked in my region?',
      answer: 'Websites can be blocked due to government censorship, school or workplace filters, geo-licensing agreements, or ISP restrictions. Our tool helps identify the specific block type.',
    },
    {
      question: 'Can I unblock YouTube, Twitter, and TikTok?',
      answer: 'Yes! Our guides provide step-by-step instructions to unblock popular platforms like YouTube, Twitter, TikTok, and more using VPNs, proxies, and other methods.',
    },
  ])

  // SoftwareApplication Schema for the diagnosis tool
  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Website Unblocker Diagnosis Tool',
    description: 'Free online tool to diagnose website accessibility issues and find solutions to unblock any website.',
    category: 'UtilitiesApplication',
    price: '0',
    rating: 4.8,
    ratingCount: 1250,
  })

  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-slate-50 text-slate-900">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.25),_transparent_60%)] blur-3xl" />
          <div className="absolute top-16 right-[-140px] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(52,211,153,0.25),_transparent_60%)] blur-3xl" />
          <div className="absolute bottom-0 left-[-120px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(250,204,21,0.22),_transparent_60%)] blur-3xl" />
        </div>
        <JsonLd data={breadcrumbSchema} />
        <JsonLd data={organizationSchema} />
        <JsonLd data={webSiteSchema} />
        <JsonLd data={faqSchema} />
        <JsonLd data={softwareSchema} />

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 px-4">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                <Shield className="h-4 w-4 text-emerald-600" />
                Free Website Unblocker Tool
              </div>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 md:text-6xl">
                Check if websites are
                <span className="text-emerald-600"> blocked</span>
                <br />in your region
              </h1>

              <p className="mt-6 text-lg text-slate-600 md:text-xl">
                Instantly diagnose accessibility issues and get tailored solutions
                to unblock any website safely and securely.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/blocked"
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                >
                  Check blocked status
                </Link>
                <Link
                  href="/unblock"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
                >
                  Explore unblock guides
                </Link>
              </div>

              <div className="mt-10 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3">
                  Global checks
                  <p className="mt-1 text-xs text-slate-500">Edge + regional probes</p>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3">
                  Smart routes
                  <p className="mt-1 text-xs text-slate-500">Free proxy list updates</p>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3">
                  VPN picks
                  <p className="mt-1 text-xs text-slate-500">Fast, reliable access</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-white via-white to-emerald-50/80 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)]" />
              <div className="relative">
                <ErrorBoundary>
                  <DiagnosisTool />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </section>

        {/* Proxy Routes Section */}
        <section className="py-16 px-4 bg-white/70 border-y border-slate-200/60">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-3xl font-bold text-slate-900">Free Proxy Routes</h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Live checks of popular free proxy services. Pick a route to open the proxy site in a new tab.
              </p>
            </div>
            <ProxyRoutes />
          </div>
        </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Why us</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Why Use Website Unblocker?</h2>
            </div>
            <Link
              href="/tools"
              className="text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
            >
              Explore tools →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">Global Access</h3>
              <p className="mt-2 text-slate-600">
                Access any website from anywhere in the world, bypassing geo-restrictions and censorship.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-amber-50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">Instant Detection</h3>
              <p className="mt-2 text-slate-600">
                Our tool instantly checks website accessibility from multiple locations worldwide.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-emerald-50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">Privacy First</h3>
              <p className="mt-2 text-slate-600">
                We recommend only trusted VPN solutions that protect your privacy and data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTABanner
        variant="fullwidth"
        title="Ready to Unblock the Internet?"
        description="Get unrestricted access to any website with our recommended VPN solution."
        buttonText="Get NordVPN Now"
        affiliateKey="nordvpn"
      />
    </main>
    </ErrorBoundary>
  )
}
