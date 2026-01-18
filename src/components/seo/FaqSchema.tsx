import { JsonLd } from './JsonLd'

export interface FaqItem {
  question: string
  answer: string
}

interface FaqSchemaProps {
  faqs: FaqItem[]
  metadata?: {
    name?: string
    description?: string
  }
}

/**
 * FAQPage Schema component for Google Rich Results
 * @see https://developers.google.com/search/docs/appearance/structured-data/faqpage
 */
export function FaqSchema({ faqs, metadata }: FaqSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(metadata?.name && { name: metadata.name }),
    ...(metadata?.description && { description: metadata.description }),
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return <JsonLd data={schema} />
}

/**
 * Helper function to build FAQ schema data for custom rendering
 */
export function buildFaqSchema(faqs: FaqItem[], metadata?: { name?: string; description?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(metadata?.name && { name: metadata.name }),
    ...(metadata?.description && { description: metadata.description }),
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
