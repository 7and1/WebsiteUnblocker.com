'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Shield, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { siteConfig } from '@/config/site'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Shield className="h-6 w-6 text-blue-600" />
          WebsiteUnblocker
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-slate-600 transition-colors hover:text-slate-900">
              {item.label}
            </Link>
          ))}
          <a
            href={siteConfig.affiliates.nordvpn}
            target="_blank"
            rel="noopener"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Get VPN
          </a>
        </nav>

        <button
          type="button"
          className="flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-t border-slate-100 bg-white px-4 py-4 md:hidden"
          >
            <div className="flex flex-col gap-3">
              {siteConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-700 transition-colors hover:text-slate-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={siteConfig.affiliates.nordvpn}
                target="_blank"
                rel="noopener"
                className="rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white"
              >
                Get VPN
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
