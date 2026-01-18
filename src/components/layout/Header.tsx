'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Shield, Menu, X } from 'lucide-react'
import { siteConfig } from '@/config/site'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !menuButtonRef.current?.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [mobileMenuOpen])

  // Focus management when menu opens
  useEffect(() => {
    if (mobileMenuOpen) {
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
      firstLinkRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const toggleMenu = () => setMobileMenuOpen((prev) => !prev)

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Shield className="h-6 w-6 text-blue-600" aria-hidden="true" />
          <span>WebsiteUnblocker</span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-[44px] text-slate-600 transition-colors hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={siteConfig.affiliates.nordvpn}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Get VPN
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          ref={menuButtonRef}
          type="button"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:hidden"
          onClick={toggleMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        aria-hidden={!mobileMenuOpen}
        className={`
          fixed left-0 right-0 top-16 bg-white shadow-lg transition-all duration-300 ease-in-out md:hidden
          ${mobileMenuOpen
            ? 'pointer-events-auto visible opacity-100'
            : 'pointer-events-none invisible opacity-0'
          }
        `}
      >
        {/* Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 md:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}

        <nav
          aria-label="Mobile navigation"
          className="relative z-10 border-t border-slate-100 bg-white px-4 py-4"
        >
          <ul className="flex flex-col gap-1" role="menubar">
            {siteConfig.nav.map((item, index) => (
              <li role="none" key={item.href}>
                <Link
                  ref={index === 0 ? firstLinkRef : null}
                  href={item.href}
                  role="menuitem"
                  className="block min-h-[44px] rounded-lg px-4 py-3 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li role="none">
              <a
                href={siteConfig.affiliates.nordvpn}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                className="mt-2 block min-h-[44px] rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Get VPN
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
