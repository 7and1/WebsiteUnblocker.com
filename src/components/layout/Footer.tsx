import Link from 'next/link'
import { Shield } from 'lucide-react'
import { siteConfig } from '@/config/site'

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
              <Shield className="h-6 w-6 text-emerald-600" />
              WebsiteUnblocker
            </Link>
            <p className="max-w-md text-sm text-slate-600">{siteConfig.description}</p>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-slate-900">Resources</h4>
            <ul className="space-y-2 text-sm">
              {siteConfig.footer.resources.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-600 hover:text-emerald-600">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-slate-900">Legal</h4>
            <ul className="space-y-2 text-sm">
              {siteConfig.footer.legal.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-600 hover:text-emerald-600">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} WebsiteUnblocker.com. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
