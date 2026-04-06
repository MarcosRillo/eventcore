'use client';

/**
 * Public Header Component - Global Navigation for Public Pages
 * Provides consistent navigation across all public-facing pages
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavLink {
  href: string
  label: string
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Inicio' },
  { href: '/calendar', label: 'Eventos' },
]

export const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActiveLink = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg md:text-xl font-bold text-neutral-900 hover:text-primary-600 transition-colors"
          >
            <svg
              className="w-8 h-8 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <span>Eventos Tucumán</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActiveLink(link.href)
                    ? 'text-primary-600'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/register-request"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Registrar Organización
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2"
            >
              Acceso Organizadores
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden py-4 border-t border-neutral-100"
            aria-label="Navegación móvil"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActiveLink(link.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                  onClick={() => setMobileMenuOpen(() => false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-neutral-100" />
              <Link
                href="/register-request"
                className="px-4 py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(() => false)}
              >
                Registrar Organización
              </Link>
              <Link
                href="/login"
                className="mx-4 mt-2 px-4 py-3 text-sm font-medium text-center text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
                onClick={() => setMobileMenuOpen(() => false)}
              >
                Acceso Organizadores
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
