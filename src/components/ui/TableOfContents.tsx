'use client'

import { useEffect, useState } from 'react'
import { List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const article = document.querySelector('article')
    if (!article) return

    const headingElements = Array.from(
      article.querySelectorAll('h2, h3')
    ) as HTMLHeadingElement[]

    const newHeadings = headingElements
      .map((heading) => ({
        id: heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
        text: heading.textContent || '',
        level: parseInt(heading.tagName.substring(1)),
      }))
      .filter((h) => h.text)

    setHeadings(newHeadings)

    // Add IDs to headings that don't have them
    headingElements.forEach((heading, index) => {
      if (!heading.id && newHeadings[index]) {
        heading.id = newHeadings[index].id
      }
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -66%' }
    )

    headingElements.forEach((heading) => observer.observe(heading))

    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <nav className="hidden lg:block sticky top-24 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-700">
        <List className="w-4 h-4" />
        On this page
      </div>
      <ul className="space-y-2 text-sm border-l border-slate-200">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => handleClick(heading.id)}
              className={cn(
                'block text-left w-full py-1.5 px-4 -ml-px border-l-2 transition-colors',
                activeId === heading.id
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300',
                heading.level === 3 && 'pl-8 text-xs'
              )}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
