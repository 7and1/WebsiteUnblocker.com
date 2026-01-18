import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowRight, Globe, Lock, Shield, Zap } from 'lucide-react'

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

const BlogCard = dynamic(
  () => import('@/components/features/BlogCard').then(m => ({ default: m.BlogCard })),
  {
    loading: () => (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="aspect-video bg-slate-200 rounded-xl mb-4" />
          <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
          <div className="h-6 bg-slate-200 rounded w-full mb-2" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
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

import {
  buildMetadata,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildFaqSchema,
  buildSoftwareApplicationSchema,
} from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'
import { kvCache } from '@/lib/cache/kvCache'

export const metadata = buildMetadata({
  title: 'Website Unblocker - Check & Unblock Any Website Free',
  description:
    'Free tool to check if websites are blocked. Instantly diagnose and get solutions to unblock YouTube, Twitter, TikTok and more.',
  path: '/',
})

// ISR: Cache for 5 minutes with stale-while-revalidate for better performance
export const revalidate = 300

async function getLatestPosts() {
  // Use KV cache for frequently accessed posts data
  // Reduces D1 database load and improves response times
  return kvCache({
    key: 'homepage:latest-posts',
    ttl: 300, // 5 minutes cache
    swrTtl: 600, // Serve stale for up to 10 minutes while revalidating
    fetchFn: async () => {
      const payload = await getPayload({ config: configPromise })
      const posts = await payload.find({ collection: 'posts', limit: 6, sort: '-published_date', depth: 1 })
      return posts.docs
    },
  })
}

export default async function HomePage() {
  const posts = await getLatestPosts()

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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={webSiteSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={softwareSchema} />

      {/* Hero Section */}
      <section className="pt-16 pb-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
            <Shield className="w-4 h-4" />
            Free Website Unblocker Tool
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
            Check if Websites are
            <span className="text-blue-600"> Blocked</span>
            <br />in Your Region
          </h1>

          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Instantly diagnose website accessibility issues and get personalized solutions
            to unblock any website safely and securely.
          </p>

          <DiagnosisTool />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Why Use Website Unblocker?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Global Access</h3>
              <p className="text-slate-600">
                Access any website from anywhere in the world, bypassing geo-restrictions and censorship.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Detection</h3>
              <p className="text-slate-600">
                Our tool instantly checks website accessibility from multiple locations worldwide.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Privacy First</h3>
              <p className="text-slate-600">
                We recommend only trusted VPN solutions that protect your privacy and data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {posts.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-slate-900">
                Latest Unblocking Guides
              </h2>
              <Link
                href="/blog"
                className="text-blue-600 font-medium flex items-center gap-2 hover:gap-3 transition-all"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: any) => (
                <BlogCard
                  key={post.id}
                  title={post.title}
                  slug={post.slug}
                  tags={post.tags}
                  description={post.meta_description}
                  date={post.published_date}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABanner
        variant="fullwidth"
        title="Ready to Unblock the Internet?"
        description="Get unrestricted access to any website with our recommended VPN solution."
        buttonText="Get NordVPN Now"
        affiliateKey="nordvpn"
      />
    </main>
  )
}
