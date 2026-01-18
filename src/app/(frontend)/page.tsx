import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { ArrowRight, Globe, Lock, Shield, Zap } from 'lucide-react'
import { DiagnosisTool, BlogCard, CTABanner } from '@/components'
import { buildMetadata, buildBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata = buildMetadata({
  title: 'Website Unblocker - Check & Unblock Any Website Free',
  description:
    'Free tool to check if websites are blocked. Instantly diagnose and get solutions to unblock YouTube, Twitter, TikTok and more.',
  path: '/',
})

// Force dynamic rendering for Payload CMS
export const dynamic = 'force-dynamic'

async function getLatestPosts() {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({ collection: 'posts', limit: 6, sort: '-published_date', depth: 1 })
    return posts.docs
  } catch {
    return []
  }
}

export default async function HomePage() {
  const posts = await getLatestPosts()

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
  ])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <JsonLd data={breadcrumbSchema} />

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
