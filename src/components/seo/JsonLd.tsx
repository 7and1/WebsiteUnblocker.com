function sanitizeJsonLd(data: Record<string, unknown>): string {
  const json = JSON.stringify(data)
  // Escape HTML entities to prevent XSS in script context
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(data) }}
    />
  )
}
