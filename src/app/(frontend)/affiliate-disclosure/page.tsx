import Link from 'next/link'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata = buildMetadata({
  title: 'Affiliate Disclosure - WebsiteUnblocker',
  description: 'WebsiteUnblocker.com affiliate disclosure. We earn commissions from qualifying purchases through our partner links at no extra cost to you.',
  path: '/affiliate-disclosure',
})

// Affiliate partners for FTC compliance
const affiliatePartners = [
  {
    name: 'NordVPN',
    description: 'VPN service provider for unblocking websites',
  },
  {
    name: 'ExpressVPN',
    description: 'Premium VPN service provider',
  },
  {
    name: 'Surfshark',
    description: 'Budget-friendly VPN service',
  },
]

export default function AffiliateDisclosurePage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Affiliate Disclosure', path: '/affiliate-disclosure' },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="prose prose-slate max-w-none">
          <h1>Affiliate Disclosure</h1>

          <p className="lead">
            <strong>Last Updated: January 2026</strong>
          </p>

          <h2>FTC Compliance Notice</h2>
          <p>
            In accordance with the Federal Trade Commission (FTC) guidelines for affiliate marketing,
            we are required to disclose that WebsiteUnblocker.com contains affiliate links. This means
            that if you click on a link to a product or service and make a purchase, we may receive a
            commission at no additional cost to you.
          </p>

          <h2>What Are Affiliate Links?</h2>
          <p>
            Affiliate links are special URLs that allow us to track referrals to partner websites. When
            you click through our link and complete a qualifying action (such as purchasing a VPN
            subscription), the merchant pays us a referral fee.
          </p>

          <h2>Our Affiliate Partners</h2>
          <p>
            We currently partner with the following companies to provide you with VPN and internet
            freedom solutions:
          </p>
          <ul>
            {affiliatePartners.map((partner) => (
              <li key={partner.name}>
                <strong>{partner.name}</strong> - {partner.description}
              </li>
            ))}
          </ul>

          <h2>How This Affects You</h2>
          <p>
            <strong>Important:</strong> Our affiliate relationships do not influence our editorial
            content, reviews, or recommendations. We maintain the following principles:
          </p>
          <ul>
            <li>
              <strong>Honest Reviews:</strong> We only recommend services we genuinely believe provide
              value to our users.
            </li>
            <li>
              <strong>Independence:</strong> Our editorial content is not influenced by affiliate
              commissions or partnerships.
            </li>
            <li>
              <strong>Transparency:</strong> We clearly identify affiliate links where applicable.
            </li>
            <li>
              <strong>User-First:</strong> Your needs and experience are our priority, not affiliate
              revenue.
            </li>
          </ul>

          <h2>Commission Rates</h2>
          <p>
            Commission rates vary by partner and can range from approximately 20% to 40% of qualifying
            purchases. These commissions help us maintain and improve WebsiteUnblocker.com, allowing us
            to continue providing free tools and guides to help you access the open internet.
          </p>

          <h2>No Extra Cost to You</h2>
          <p>
            Using our affiliate links does <strong>not</strong> cost you anything extra. You pay the
            same price whether you use our link or go directly to the merchant. In some cases, our
            links may even provide exclusive discounts or special offers.
          </p>

          <h2>Our Review Process</h2>
          <p>
            Before recommending any service, we evaluate factors including:
          </p>
          <ul>
            <li>Performance and reliability</li>
            <li>Privacy and security features</li>
            <li>Customer support quality</li>
            <li>Pricing and value for money</li>
            <li>User reviews and reputation</li>
            <li>Ability to bypass geo-restrictions</li>
          </ul>

          <h2>Questions or Concerns?</h2>
          <p>
            If you have any questions about our affiliate relationships or our recommendations,
            please <Link href="/contact">contact us</Link>. We value your trust and are happy to
            provide additional information.
          </p>

          <h2>Related Policies</h2>
          <p>
            For more information about how we handle your data, please review our:
          </p>
          <ul>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms of Service</Link>
            </li>
          </ul>

          <hr className="my-8" />

          <p className="text-sm text-slate-500">
            This disclosure is provided in compliance with the FTC Guides Concerning the Use of
            Endorsements and Testimonials in Advertising (16 CFR Part 255).
          </p>
        </div>
      </section>
    </main>
  )
}
