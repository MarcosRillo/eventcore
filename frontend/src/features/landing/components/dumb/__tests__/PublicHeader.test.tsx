/**
 * Tests for PublicHeader (Dumb Component)
 *
 * Tests global navigation, mobile menu, active link detection, and accessibility.
 */

import { render, screen, fireEvent, within } from '@testing-library/react'
import { PublicHeader } from '../PublicHeader'
import { usePathname } from 'next/navigation'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

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

describe('PublicHeader', () => {
  const mockUsePathname = usePathname as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/')
  })

  describe('rendering', () => {
    test('should render logo with link to homepage', () => {
      render(<PublicHeader />)

      const logoLink = screen.getByRole('link', { name: /eventos tucumán/i })
      expect(logoLink).toBeInTheDocument()
      expect(logoLink).toHaveAttribute('href', '/')
      expect(logoLink).toHaveClass('text-xl', 'font-bold')
    })

    test('should render desktop navigation links', () => {
      render(<PublicHeader />)

      const inicioLink = screen.getByRole('link', { name: 'Inicio' })
      const eventosLink = screen.getByRole('link', { name: 'Eventos' })

      expect(inicioLink).toBeInTheDocument()
      expect(inicioLink).toHaveAttribute('href', '/')
      expect(eventosLink).toBeInTheDocument()
      expect(eventosLink).toHaveAttribute('href', '/calendar')
    })

    test('should render CTA buttons in desktop view', () => {
      render(<PublicHeader />)

      const registerLink = screen.getByRole('link', { name: /registrar organización/i })
      const loginLink = screen.getByRole('link', { name: /acceso organizadores/i })

      expect(registerLink).toBeInTheDocument()
      expect(registerLink).toHaveAttribute('href', '/register-request')
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
      expect(loginLink).toHaveClass('bg-primary-500')
    })
  })

  describe('active link detection', () => {
    test('should highlight active link on homepage', () => {
      mockUsePathname.mockReturnValue('/')
      render(<PublicHeader />)

      const inicioLinks = screen.getAllByRole('link', { name: 'Inicio' })
      const eventosLinks = screen.getAllByRole('link', { name: 'Eventos' })

      // Desktop link should be active (first one)
      expect(inicioLinks[0]).toHaveClass('text-primary-600')
      expect(eventosLinks[0]).not.toHaveClass('text-primary-600')
      expect(eventosLinks[0]).toHaveClass('text-neutral-600')
    })

    test('should highlight active link on calendar page', () => {
      mockUsePathname.mockReturnValue('/calendar')
      render(<PublicHeader />)

      const inicioLinks = screen.getAllByRole('link', { name: 'Inicio' })
      const eventosLinks = screen.getAllByRole('link', { name: 'Eventos' })

      // Desktop link should be active (first one)
      expect(eventosLinks[0]).toHaveClass('text-primary-600')
      expect(inicioLinks[0]).not.toHaveClass('text-primary-600')
      expect(inicioLinks[0]).toHaveClass('text-neutral-600')
    })

    test('should highlight calendar link on calendar detail page', () => {
      mockUsePathname.mockReturnValue('/calendar/123')
      render(<PublicHeader />)

      const eventosLinks = screen.getAllByRole('link', { name: 'Eventos' })

      // Should detect /calendar as active even on subpages
      expect(eventosLinks[0]).toHaveClass('text-primary-600')
    })
  })

  describe('mobile menu toggle', () => {
    test('should show mobile menu button and hide desktop nav on mobile', () => {
      render(<PublicHeader />)

      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      expect(mobileMenuButton).toBeInTheDocument()
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')

      // Desktop nav should have hidden class (md:flex)
      const desktopNav = screen.getByLabelText('Navegación principal')
      expect(desktopNav).toHaveClass('hidden', 'md:flex')
    })

    test('should open mobile menu when button is clicked', () => {
      render(<PublicHeader />)

      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      fireEvent.click(mobileMenuButton)

      const mobileMenu = screen.getByRole('navigation', { name: /navegación móvil/i })
      expect(mobileMenu).toBeInTheDocument()
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')
      expect(mobileMenuButton).toHaveAttribute('aria-label', 'Cerrar menú')
    })

    test('should close mobile menu when button is clicked again', () => {
      render(<PublicHeader />)

      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })

      // Open menu
      fireEvent.click(mobileMenuButton)
      expect(screen.getByRole('navigation', { name: /navegación móvil/i })).toBeInTheDocument()

      // Close menu
      fireEvent.click(mobileMenuButton)
      expect(screen.queryByRole('navigation', { name: /navegación móvil/i })).not.toBeInTheDocument()
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
    })

    test('should close mobile menu when navigation link is clicked', () => {
      render(<PublicHeader />)

      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      fireEvent.click(mobileMenuButton)

      const mobileMenu = screen.getByRole('navigation', { name: /navegación móvil/i })
      const eventosLink = within(mobileMenu).getByRole('link', { name: 'Eventos' })

      fireEvent.click(eventosLink)

      expect(screen.queryByRole('navigation', { name: /navegación móvil/i })).not.toBeInTheDocument()
    })
  })

  describe('responsive behavior', () => {
    test('should hide desktop navigation on mobile', () => {
      render(<PublicHeader />)

      const desktopNav = screen.getByLabelText('Navegación principal')
      expect(desktopNav).toHaveClass('hidden', 'md:flex')
    })

    test('should hide mobile menu button on desktop', () => {
      render(<PublicHeader />)

      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      expect(mobileMenuButton).toHaveClass('md:hidden')
    })
  })

  describe('accessibility', () => {
    test('should have proper ARIA labels for navigation', () => {
      render(<PublicHeader />)

      const desktopNav = screen.getByLabelText('Navegación principal')
      expect(desktopNav).toBeInTheDocument()
      expect(desktopNav).toHaveAttribute('aria-label', 'Navegación principal')
    })

    test('should have proper ARIA attributes on mobile menu button', () => {
      render(<PublicHeader />)

      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })

      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
      expect(mobileMenuButton).toHaveAttribute('aria-controls', 'mobile-menu')
      expect(mobileMenuButton).toHaveAttribute('aria-label', 'Abrir menú')

      fireEvent.click(mobileMenuButton)

      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')
      expect(mobileMenuButton).toHaveAttribute('aria-label', 'Cerrar menú')
    })

    test('should have semantic HTML structure with header and nav elements', () => {
      render(<PublicHeader />)

      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
      expect(header.tagName).toBe('HEADER')

      const navs = screen.getAllByRole('navigation')
      expect(navs.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('mobile menu content', () => {
    test('should render all navigation links in mobile menu', () => {
      render(<PublicHeader />)

      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      fireEvent.click(mobileMenuButton)

      const mobileMenu = screen.getByRole('navigation', { name: /navegación móvil/i })
      const inicioLink = within(mobileMenu).getByRole('link', { name: 'Inicio' })
      const eventosLink = within(mobileMenu).getByRole('link', { name: 'Eventos' })

      expect(inicioLink).toBeInTheDocument()
      expect(eventosLink).toBeInTheDocument()
    })

    test('should render CTA buttons in mobile menu', () => {
      render(<PublicHeader />)

      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      fireEvent.click(mobileMenuButton)

      const mobileMenu = screen.getByRole('navigation', { name: /navegación móvil/i })
      const registerLink = within(mobileMenu).getByRole('link', { name: /registrar organización/i })
      const loginLink = within(mobileMenu).getByRole('link', { name: /acceso organizadores/i })

      expect(registerLink).toBeInTheDocument()
      expect(registerLink).toHaveAttribute('href', '/register-request')
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    test('should highlight active link in mobile menu', () => {
      mockUsePathname.mockReturnValue('/calendar')
      render(<PublicHeader />)

      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      fireEvent.click(mobileMenuButton)

      const mobileMenu = screen.getByRole('navigation', { name: /navegación móvil/i })
      const eventosLink = within(mobileMenu).getByRole('link', { name: 'Eventos' })

      expect(eventosLink).toHaveClass('text-primary-600', 'bg-primary-50')
    })
  })

  describe('edge cases', () => {
    test('should handle pathname edge cases correctly', () => {
      // Test that homepage link only matches exact path
      mockUsePathname.mockReturnValue('/calendar')
      const { rerender } = render(<PublicHeader />)

      const inicioLinks = screen.getAllByRole('link', { name: 'Inicio' })
      expect(inicioLinks[0]).not.toHaveClass('text-primary-600')

      // Test that calendar matches subpaths
      mockUsePathname.mockReturnValue('/calendar/detail/123')
      rerender(<PublicHeader />)

      const eventosLinks = screen.getAllByRole('link', { name: 'Eventos' })
      expect(eventosLinks[0]).toHaveClass('text-primary-600')
    })

    test('should close mobile menu when CTA buttons are clicked', () => {
      render(<PublicHeader />)

      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      fireEvent.click(mobileMenuButton)

      const mobileMenu = screen.getByRole('navigation', { name: /navegación móvil/i })
      const loginLink = within(mobileMenu).getByRole('link', { name: /acceso organizadores/i })

      fireEvent.click(loginLink)

      expect(screen.queryByRole('navigation', { name: /navegación móvil/i })).not.toBeInTheDocument()
    })
  })
})
