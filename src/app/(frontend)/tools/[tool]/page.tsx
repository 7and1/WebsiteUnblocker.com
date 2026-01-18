import { notFound } from 'next/navigation'
import { SpeedTest, IpChecker } from '@/components'
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { tools } from '@/lib/content'

const TOOL_COMPONENTS: Record<string, React.ReactNode> = {
  'speed-test': <SpeedTest />,
  'ip-checker': <IpChecker />,
}

type Props = {
  params: { tool: string }
}

export const revalidate = 86400

export function generateStaticParams() {
  return tools.map((tool) => ({ tool: tool.slug }))
}

export function generateMetadata({ params }: Props) {
  const tool = tools.find((entry) => entry.slug === params.tool)
  if (!tool) return buildMetadata({ title: 'Tool Not Found', path: `/tools/${params.tool}` })

  return buildMetadata({
    title: `${tool.name} | Website Unblocker Tools`,
    description: tool.description,
    path: `/tools/${tool.slug}`,
  })
}

export default function ToolPage({ params }: Props) {
  const tool = tools.find((entry) => entry.slug === params.tool)
  if (!tool) notFound()

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: tool.name, path: `/tools/${tool.slug}` },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900">{tool.name}</h1>
        <p className="mt-4 text-lg text-slate-600">{tool.description}</p>

        <div className="mt-10">
          {TOOL_COMPONENTS[tool.slug] || (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-slate-600">Tool coming soon.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
