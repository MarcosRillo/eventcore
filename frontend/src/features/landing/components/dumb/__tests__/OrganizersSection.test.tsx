/**
 * Tests for OrganizersSection (Dumb Component)
 *
 * Tests CTA section rendering, benefits cards, links, and accessibility.
 */

import { render, screen } from '@testing-library/react'
import { OrganizersSection } from '../OrganizersSection'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe('OrganizersSection', () => {
  describe('rendering', () => {
    test('should render section with correct semantic element and background', () => {
      const { container } = render(<OrganizersSection />)

      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
      expect(section).toHaveClass('bg-primary-600', 'py-16')
    })

    test('should render icon container with SVG', () => {
      const { container } = render(<OrganizersSection />)

      const iconContainer = container.querySelector('.w-16.h-16')
      expect(iconContainer).toHaveClass('bg-white/10', 'rounded-full', 'flex', 'items-center', 'justify-center')

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('w-8', 'h-8', 'text-white')
    })

    test('should render title with correct text and styling', () => {
      render(<OrganizersSection />)

      const title = screen.getByText(/¿Organizás eventos en Tucumán?/i)
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-3xl', 'md:text-4xl', 'font-bold', 'text-white')
    })

    test('should render description text', () => {
      render(<OrganizersSection />)

      const description = screen.getByText(/Sumá tu organización a la plataforma oficial/i)
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-lg', 'text-primary-100')
    })

    test('should apply correct container and max-width classes', () => {
      const { container } = render(<OrganizersSection />)

      const innerContainer = container.querySelector('.container')
      expect(innerContainer).toHaveClass('mx-auto', 'px-4', 'max-w-4xl')
    })
  })

  describe('benefits cards', () => {
    test('should render all 3 benefit cards', () => {
      render(<OrganizersSection />)

      expect(screen.getByText('Mayor Visibilidad')).toBeInTheDocument()
      expect(screen.getByText('Gestión Simple')).toBeInTheDocument()
      expect(screen.getByText('Apoyo Institucional')).toBeInTheDocument()
    })

    test('should render benefit card descriptions', () => {
      render(<OrganizersSection />)

      expect(screen.getByText(/Tu evento visible en el calendario oficial/i)).toBeInTheDocument()
      expect(screen.getByText(/Panel de control para administrar/i)).toBeInTheDocument()
      expect(screen.getByText(/Respaldo del Ente de Turismo/i)).toBeInTheDocument()
    })

    test('should apply correct grid layout to benefits section', () => {
      const { container } = render(<OrganizersSection />)

      const benefitsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3')
      expect(benefitsGrid).toBeInTheDocument()
      expect(benefitsGrid).toHaveClass('gap-6', 'mb-10')
    })

    test('should style benefit cards with semi-transparent background', () => {
      const { container } = render(<OrganizersSection />)

      const benefitCards = container.querySelectorAll('.bg-white\\/10.rounded-lg')
      expect(benefitCards.length).toBe(3) // 3 benefit cards (icon uses rounded-full)

      // Verify each benefit card has correct styling
      benefitCards.forEach(card => {
        expect(card).toHaveClass('p-4')
      })
    })
  })

  describe('CTA buttons', () => {
    test('should render Solicitar Registro button with correct link', () => {
      render(<OrganizersSection />)

      const registerButton = screen.getByRole('link', { name: /solicitar registro/i })
      expect(registerButton).toBeInTheDocument()
      expect(registerButton).toHaveAttribute('href', '/register-request')
    })

    test('should render Ya tengo cuenta button with correct link', () => {
      render(<OrganizersSection />)

      const loginButton = screen.getByRole('link', { name: /ya tengo cuenta/i })
      expect(loginButton).toBeInTheDocument()
      expect(loginButton).toHaveAttribute('href', '/login')
    })

    test('should apply primary button styles to Solicitar Registro', () => {
      render(<OrganizersSection />)

      const registerButton = screen.getByRole('link', { name: /solicitar registro/i })
      expect(registerButton).toHaveClass('bg-white', 'text-primary-600', 'font-semibold', 'hover:bg-primary-50')
    })

    test('should apply ghost button styles to Ya tengo cuenta', () => {
      render(<OrganizersSection />)

      const loginButton = screen.getByRole('link', { name: /ya tengo cuenta/i })
      expect(loginButton).toHaveClass('bg-transparent', 'text-white', 'border', 'border-white/30', 'hover:bg-white/10')
    })

    test('should render buttons in flex container with correct responsive classes', () => {
      const { container } = render(<OrganizersSection />)

      const buttonsContainer = container.querySelector('.flex.flex-col.sm\\:flex-row')
      expect(buttonsContainer).toHaveClass('items-center', 'justify-center', 'gap-4')
    })
  })

  describe('accessibility', () => {
    test('should have focus styles on primary button', () => {
      render(<OrganizersSection />)

      const registerButton = screen.getByRole('link', { name: /solicitar registro/i })
      expect(registerButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-white/50')
    })

    test('should have focus styles on secondary button', () => {
      render(<OrganizersSection />)

      const loginButton = screen.getByRole('link', { name: /ya tengo cuenta/i })
      expect(loginButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-white/50')
    })
  })

  describe('layout and content', () => {
    test('should center all content', () => {
      const { container } = render(<OrganizersSection />)

      const centerContainer = container.querySelector('.text-center')
      expect(centerContainer).toBeInTheDocument()
    })

    test('should render all main sections in correct order', () => {
      const { container } = render(<OrganizersSection />)

      const section = container.querySelector('section')
      const text = section?.textContent || ''

      // Check content appears in correct order
      const titleIndex = text.indexOf('¿Organizás eventos')
      const descriptionIndex = text.indexOf('Sumá tu organización')
      const benefitsIndex = text.indexOf('Mayor Visibilidad')
      const ctaIndex = text.indexOf('Solicitar Registro')

      expect(titleIndex).toBeGreaterThan(-1)
      expect(descriptionIndex).toBeGreaterThan(titleIndex)
      expect(benefitsIndex).toBeGreaterThan(descriptionIndex)
      expect(ctaIndex).toBeGreaterThan(benefitsIndex)
    })
  })
})
