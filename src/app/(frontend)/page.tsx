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

      {/* Educational Content Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">The Internet Freedom Crisis: Why Website Blocking Affects You</h2>

          <p className="text-slate-700 leading-relaxed">
            Here&apos;s a number that should make you think: <strong>4.6 billion people</strong> were affected by internet censorship in 2025. That&apos;s more than half of everyone on Earth. The internet was built to connect us, but governments and organizations keep building walls.
          </p>

          <p className="text-slate-700 leading-relaxed">
            Let me break this down simply. When you try to open YouTube, Twitter, or any website and it doesn&apos;t load, something is blocking you. It might be your school. It might be your workplace. It might be your entire country&apos;s government. Website blocking has become the default, not the exception.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">The Numbers Don&apos;t Lie</h3>

          <p className="text-slate-700 leading-relaxed">
            In 2025, authorities around the world imposed <strong>81 new internet restrictions</strong>. That&apos;s on top of 47 ongoing disruptions that were already in place. We went from 4.2 billion people affected in 2022 to 4.6 billion in 2025. The trend is going in the wrong direction.
          </p>

          <p className="text-slate-700 leading-relaxed">
            According to research tracking internet shutdowns, there were <strong>296 recorded internet shutdowns in 2024 across 54 countries</strong>. These aren&apos;t random technical failures. These are deliberate decisions by people in power to cut off access to information.
          </p>

          <p className="text-slate-700 leading-relaxed">
            Freedom House has been watching this problem for years. Their conclusion? Internet freedom has declined for <strong>14 consecutive years</strong>. Think about that. Every single year for more than a decade, the internet has become less free, not more.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Why Websites Get Blocked</h3>

          <p className="text-slate-700 leading-relaxed">
            Website blocking happens for different reasons depending on where you are. Understanding why helps you find the right solution.
          </p>

          <p className="text-slate-700 leading-relaxed">
            <strong>Government Censorship:</strong> Some countries block websites they consider politically sensitive. China blocks Facebook, Instagram, Twitter, and thousands of news websites. Russia dramatically increased censorship after 2022, blocking major social platforms. Iran has had over 62 recorded instances of censorship in the last decade alone.
          </p>

          <p className="text-slate-700 leading-relaxed">
            <strong>School and Workplace Filters:</strong> Your school or employer might block social media, streaming sites, or games to keep you focused. This is the most common type of blocking for people in the US and Europe.
          </p>

          <p className="text-slate-700 leading-relaxed">
            <strong>Geo-Licensing Restrictions:</strong> Netflix, Hulu, and streaming services show different content in different countries. They use blocking technology to enforce these rules. A show available in the UK might not be accessible in the US.
          </p>

          <p className="text-slate-700 leading-relaxed">
            <strong>ISP Restrictions:</strong> Your internet service provider might block certain websites, either by government order or their own policies.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">The Response: Why VPN Usage Is Exploding</h3>

          <p className="text-slate-700 leading-relaxed">
            People aren&apos;t just accepting these restrictions. They&apos;re fighting back with technology. <strong>One in three internet users worldwide now uses a VPN</strong>. That number was just 7% in 2016. In less than a decade, VPN usage quadrupled.
          </p>

          <p className="text-slate-700 leading-relaxed">
            The correlation is obvious. Countries with the most censorship have the highest VPN usage. Indonesia leads the world with <strong>55% of internet users using a VPN</strong>. India is second at 43%. These aren&apos;t random choices. People use VPNs because they need to access information their governments don&apos;t want them to see.
          </p>

          <p className="text-slate-700 leading-relaxed">
            When Turkey blocked YouTube, Instagram, TikTok, and X in March 2025, VPN usage spiked by <strong>1,100%</strong> overnight. That&apos;s not a typo. VPN downloads increased eleven times in a single day because people needed access to information.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">How Website Unblocker Helps You</h3>

          <p className="text-slate-700 leading-relaxed">
            Our free tool does something simple but powerful: it tells you exactly what&apos;s happening when a website won&apos;t load. Instead of guessing, you get answers.
          </p>

          <p className="text-slate-700 leading-relaxed">
            Enter any website URL into our diagnosis tool. We check it from multiple locations around the world. Within seconds, you know if the site is globally accessible, if it&apos;s blocked in your specific region, or if there&apos;s a technical problem with the site itself.
          </p>

          <p className="text-slate-700 leading-relaxed">
            Once you know the problem, we give you solutions. For geo-restrictions and censorship, a VPN is usually the most reliable answer. We&apos;ve tested dozens of VPN services and recommend the ones that actually work. For simpler blocks like school filters, a web proxy might be enough.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">The Simple Truth About Unblocking Websites</h3>

          <p className="text-slate-700 leading-relaxed">
            A VPN works like this: instead of your internet traffic going directly from your device to a website, it goes through a VPN server first. That server can be in a different city or a different country. To the website, it looks like you&apos;re browsing from wherever that server is located.
          </p>

          <p className="text-slate-700 leading-relaxed">
            If YouTube is blocked in your country, connect to a VPN server in a country where YouTube works. Now you can watch YouTube. It&apos;s that straightforward. The same principle applies to any blocked website.
          </p>

          <p className="text-slate-700 leading-relaxed">
            The important thing is choosing a VPN that&apos;s fast, reliable, and actually keeps your data private. Not all VPNs are equal. Some are slow. Some keep logs of everything you do. Some don&apos;t work in countries with strict censorship. We do the research so you don&apos;t have to waste time and money on bad options.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Common Websites That Get Blocked</h3>

          <p className="text-slate-700 leading-relaxed">
            The list of commonly blocked websites reads like a who&apos;s who of the internet. YouTube gets blocked in China, North Korea, and has faced restrictions in over 25 countries at various times. Twitter (now X) is blocked in China, Iran, North Korea, and Turkmenistan. TikTok faces bans in India, and has been restricted in many countries including recent bans in Albania.
          </p>

          <p className="text-slate-700 leading-relaxed">
            Even major news websites face blocking. The BBC, CNN, and Reuters are blocked in various countries. Wikipedia, the world&apos;s largest encyclopedia, has been blocked in countries like China and Turkey. Messaging apps like WhatsApp and Telegram face restrictions in countries where governments want to control communication.
          </p>

          <p className="text-slate-700 leading-relaxed">
            Streaming services present another category of blocks. Netflix shows different content libraries in different countries due to licensing restrictions. BBC iPlayer only works in the UK. Hulu is US-only. These aren&apos;t government censorship, but the result is the same: you can&apos;t access content you want to see.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">The Technical Side: How Blocking Works</h3>

          <p className="text-slate-700 leading-relaxed">
            Website blocking happens at different levels. DNS blocking is the simplest form. When you type a website address, your computer asks a DNS server for the IP address. The block happens when the DNS server refuses to give you the address. This is easy to bypass by using different DNS servers.
          </p>

          <p className="text-slate-700 leading-relaxed">
            IP blocking is more aggressive. The government or organization tells internet routers to drop all traffic going to certain IP addresses. This is harder to bypass but still possible with VPNs that use different IP addresses.
          </p>

          <p className="text-slate-700 leading-relaxed">
            Deep packet inspection (DPI) is the most sophisticated method. The blocking system examines the actual content of your internet traffic and blocks anything that looks like it&apos;s going to a forbidden site. This requires a VPN with special obfuscation features that makes VPN traffic look like regular traffic.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Your Right to Information</h3>

          <p className="text-slate-700 leading-relaxed">
            Access to information is a fundamental right. When websites get blocked, that right gets violated. Our mission is simple: help everyone access the open internet, no matter where they are.
          </p>

          <p className="text-slate-700 leading-relaxed">
            The numbers show this problem is getting worse, not better. In just the first two weeks of 2026, we&apos;ve already seen severe shutdowns across the Middle East and South Asia. Iran went into near-total digital darkness for over 90 hours. This is the reality for billions of people.
          </p>

          <p className="text-slate-700 leading-relaxed">
            But technology exists to bypass these restrictions. VPNs work. Proxies work. Tor works. The key is knowing which tool to use for your specific situation. That&apos;s exactly what Website Unblocker provides: clear diagnosis and practical solutions.
          </p>

          <p className="text-slate-700 leading-relaxed">
            Use our tool above to check any website. Explore our guides for step-by-step instructions on unblocking specific sites. Compare VPN options to find the best fit for your needs. The internet was meant to be open. We&apos;re here to help you keep it that way.
          </p>
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
