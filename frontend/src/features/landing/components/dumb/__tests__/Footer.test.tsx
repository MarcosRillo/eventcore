/**
 * Tests for Footer (Dumb Component)
 *
 * Tests footer sections, links, contact info, accessibility, and dynamic content.
 */

import { render, screen } from '@testing-library/react'

import { Footer } from '@/features/landing/components/dumb/Footer'

// Mock Next.js Link component
jest.mock('next/link', () => {
  const Link = ({ children, href, ...props }: { children: React.ReactNode; href: string }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
  Link.displayName = 'Link'
  return Link
})

describe('Footer', () => {
  describe('rendering', () => {
    test('should render footer with correct semantic element', () => {
      const { container } = render(<Footer />)

      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('bg-neutral-900', 'text-white')
    })

    test('should render about section with title and description', () => {
      render(<Footer />)

      expect(screen.getByText('Eventos Tucumán')).toBeInTheDocument()
      expect(screen.getByText(/Plataforma de gestión y difusión/i)).toBeInTheDocument()

      const aboutText = screen.getByText(/de la provincia de Tucumán/i)
      expect(aboutText).toHaveClass('text-neutral-400', 'text-sm')
    })

    test('should render quick links section with heading', () => {
      render(<Footer />)

      const linksHeading = screen.getByText('Enlaces')
      expect(linksHeading).toBeInTheDocument()
      expect(linksHeading).toHaveClass('text-lg', 'font-semibold')
    })

    test('should render contact section with heading and info', () => {
      render(<Footer />)

      expect(screen.getByText('Contacto')).toBeInTheDocument()
      expect(screen.getByText(/info@eventostucuman.gob.ar/i)).toBeInTheDocument()
      expect(screen.getByText(/San Miguel de Tucumán/i)).toBeInTheDocument()
    })

    test('should apply correct grid layout classes', () => {
      const { container } = render(<Footer />)

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3', 'gap-6')
    })
  })

  describe('navigation links', () => {
    test('should render all navigation links with correct hrefs', () => {
      render(<Footer />)

      const verEventosLink = screen.getByRole('link', { name: /ver eventos/i })
      const registrarLink = screen.getByRole('link', { name: /registrar mi organización/i })
      const loginLink = screen.getByRole('link', { name: /acceso organizadores/i })

      expect(verEventosLink).toHaveAttribute('href', '/calendar')
      expect(registrarLink).toHaveAttribute('href', '/register-request')
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    test('should apply hover styles to navigation links', () => {
      render(<Footer />)

      const verEventosLink = screen.getByRole('link', { name: /ver eventos/i })
      expect(verEventosLink).toHaveClass('text-neutral-400', 'hover:text-white', 'transition-colors')
    })
  })

  describe('contact information', () => {
    test('should render email contact with icon', () => {
      const { container } = render(<Footer />)

      expect(screen.getByText(/info@eventostucuman.gob.ar/i)).toBeInTheDocument()

      // Email icon SVG should be present
      const emailIcon = container.querySelector('svg[viewBox="0 0 24 24"]')
      expect(emailIcon).toBeInTheDocument()
    })

    test('should render phone contact with icon', () => {
      // Phone placeholder was removed from the component
      render(<Footer />)

      expect(screen.queryByText(/\+54 381 XXX-XXXX/i)).not.toBeInTheDocument()
    })

    test('should render address contact with icon', () => {
      render(<Footer />)

      const addressText = screen.getByText(/San Miguel de Tucumán/i)
      expect(addressText).toBeInTheDocument()

      // Check parent li element has correct classes
      const addressItem = addressText.closest('li')
      expect(addressItem).toHaveClass('flex', 'items-center', 'gap-2')
    })

    test('should render exactly 2 contact SVG icons', () => {
      render(<Footer />)

      // Query all SVGs in the contact section
      const contactHeading = screen.getByText('Contacto')
      const contactSection = contactHeading.parentElement
      const icons = contactSection?.querySelectorAll('svg')
      expect(icons?.length).toBe(2)
    })
  })

  describe('copyright section', () => {
    test('should render copyright with current year', () => {
      render(<Footer />)

      const currentYear = new Date().getFullYear()
      const copyrightText = screen.getByText(new RegExp(`© ${currentYear} Ente de Turismo de Tucumán`))

      expect(copyrightText).toBeInTheDocument()
      expect(copyrightText).toHaveClass('text-neutral-500', 'text-sm')
    })

    test('should render copyright section with top border', () => {
      const { container } = render(<Footer />)

      const copyrightSection = container.querySelector('.border-t')
      expect(copyrightSection).toHaveClass('border-neutral-800', 'pt-8', 'text-center')
    })
  })

  describe('accessibility', () => {
    test('should have aria-label on quick links navigation', () => {
      render(<Footer />)

      const nav = screen.getByRole('navigation', { name: /enlaces rápidos/i })
      expect(nav).toBeInTheDocument()
      expect(nav).toHaveAttribute('aria-label', 'Enlaces rápidos')
    })

    test('should use semantic HTML structure', () => {
      const { container } = render(<Footer />)

      // Should have footer element
      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()

      // Should have nav element
      const nav = screen.getByRole('navigation')
      expect(nav.tagName).toBe('NAV')

      // Should have headings
      const headings = screen.getAllByRole('heading', { level: 3 })
      expect(headings.length).toBe(3) // About, Enlaces, Contacto
    })
  })

  describe('layout and styling', () => {
    test('should have correct container and spacing', () => {
      const { container } = render(<Footer />)

      const innerContainer = container.querySelector('.container')
      expect(innerContainer).toHaveClass('mx-auto', 'px-4', 'max-w-6xl')
    })

    test('should render with dark background', () => {
      const { container } = render(<Footer />)

      const footer = container.querySelector('footer')
      expect(footer).toHaveClass('bg-neutral-900', 'text-white', 'py-10')
    })
  })
})
