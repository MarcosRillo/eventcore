/**
 * Tests for CategoriesSection (Dumb Component)
 *
 * Tests category grid rendering, icon mapping, interactions, and accessibility.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { CategoriesSection } from '../CategoriesSection'
import type { EventType } from '@/features/landing/types/landing.types'

describe('CategoriesSection', () => {
  const mockOnCategoryClick = jest.fn()

  const mockEventTypes: EventType[] = [
    { id: 1, name: 'Música', is_active: true },
    { id: 2, name: 'Cultura y Arte', is_active: true },
    { id: 3, name: 'Gastronomía', is_active: true },
    { id: 4, name: 'Deportes', is_active: true },
  ]

  const defaultProps = {
    eventTypes: mockEventTypes,
    loading: false,
    onCategoryClick: mockOnCategoryClick
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    test('should render section header with title and description', () => {
      render(<CategoriesSection {...defaultProps} />)

      expect(screen.getByText('Explorar Eventos')).toBeInTheDocument()
      expect(screen.getByText('Encuentra eventos según tus intereses')).toBeInTheDocument()

      const heading = screen.getByRole('heading', { name: /explorar eventos/i })
      expect(heading).toHaveClass('text-3xl', 'md:text-4xl', 'font-bold')
    })

    test('should render loading spinner when loading is true', () => {
      render(<CategoriesSection {...defaultProps} loading={true} />)

      expect(screen.getByRole('status', { name: /cargando/i })).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    test('should render event type buttons when data is loaded', () => {
      render(<CategoriesSection {...defaultProps} />)

      expect(screen.getByRole('button', { name: /ver eventos de música/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /ver eventos de cultura y arte/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /ver eventos de gastronomía/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /ver eventos de deportes/i })).toBeInTheDocument()
    })

    test('should render empty state when no event types exist', () => {
      render(<CategoriesSection {...defaultProps} eventTypes={[]} />)

      expect(screen.getByText('Sin tipos de eventos disponibles')).toBeInTheDocument()
      expect(screen.getByText('No hay tipos de eventos en este momento.')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    test('should apply correct grid layout classes', () => {
      const { container } = render(<CategoriesSection {...defaultProps} />)

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4')
    })
  })

  describe('icon mapping', () => {
    test('should display music icon for Música category', () => {
      const musicTypes: EventType[] = [{ id: 1, name: 'Música', is_active: true }]
      const { container } = render(<CategoriesSection {...defaultProps} eventTypes={musicTypes} />)

      const iconElement = container.querySelector('[aria-hidden="true"]')
      expect(iconElement?.textContent).toBe('🎵')
    })

    test('should display culture icon for Cultura/Arte category', () => {
      const cultureTypes: EventType[] = [{ id: 1, name: 'Cultura y Arte', is_active: true }]
      const { container } = render(<CategoriesSection {...defaultProps} eventTypes={cultureTypes} />)

      const iconElement = container.querySelector('[aria-hidden="true"]')
      expect(iconElement?.textContent).toBe('🎭')
    })

    test('should display food icon for Gastronomía category', () => {
      const foodTypes: EventType[] = [{ id: 1, name: 'Gastronomía', is_active: true }]
      const { container } = render(<CategoriesSection {...defaultProps} eventTypes={foodTypes} />)

      const iconElement = container.querySelector('[aria-hidden="true"]')
      expect(iconElement?.textContent).toBe('🍴')
    })

    test('should display sports icon for Deportes category', () => {
      const sportsTypes: EventType[] = [{ id: 1, name: 'Deportes', is_active: true }]
      const { container } = render(<CategoriesSection {...defaultProps} eventTypes={sportsTypes} />)

      const iconElement = container.querySelector('[aria-hidden="true"]')
      expect(iconElement?.textContent).toBe('⚽')
    })

    test('should display festival icon for Festival category', () => {
      const festivalTypes: EventType[] = [{ id: 1, name: 'Festival de Cine', is_active: true }]
      const { container } = render(<CategoriesSection {...defaultProps} eventTypes={festivalTypes} />)

      const iconElement = container.querySelector('[aria-hidden="true"]')
      expect(iconElement?.textContent).toBe('🎉')
    })

    test('should display tourism icon for Turismo category', () => {
      const tourismTypes: EventType[] = [{ id: 1, name: 'Turismo Aventura', is_active: true }]
      const { container } = render(<CategoriesSection {...defaultProps} eventTypes={tourismTypes} />)

      const iconElement = container.querySelector('[aria-hidden="true"]')
      expect(iconElement?.textContent).toBe('🏔️')
    })

    test('should display default calendar icon for unknown category', () => {
      const unknownTypes: EventType[] = [{ id: 1, name: 'Conferencias', is_active: true }]
      const { container } = render(<CategoriesSection {...defaultProps} eventTypes={unknownTypes} />)

      const iconElement = container.querySelector('[aria-hidden="true"]')
      expect(iconElement?.textContent).toBe('📅')
    })

    test('should handle case-insensitive category name matching', () => {
      const mixedCaseTypes: EventType[] = [{ id: 1, name: 'MÚSICA CLÁSICA', is_active: true }]
      const { container } = render(<CategoriesSection {...defaultProps} eventTypes={mixedCaseTypes} />)

      const iconElement = container.querySelector('[aria-hidden="true"]')
      expect(iconElement?.textContent).toBe('🎵')
    })
  })

  describe('interactions', () => {
    test('should call onCategoryClick with correct id when button is clicked', () => {
      render(<CategoriesSection {...defaultProps} />)

      const musicaButton = screen.getByRole('button', { name: /ver eventos de música/i })
      fireEvent.click(musicaButton)

      expect(mockOnCategoryClick).toHaveBeenCalledTimes(1)
      expect(mockOnCategoryClick).toHaveBeenCalledWith(1)
    })

    test('should call onCategoryClick for different categories', () => {
      render(<CategoriesSection {...defaultProps} />)

      const culturaButton = screen.getByRole('button', { name: /ver eventos de cultura y arte/i })
      fireEvent.click(culturaButton)
      expect(mockOnCategoryClick).toHaveBeenCalledWith(2)

      const gastronomiaButton = screen.getByRole('button', { name: /ver eventos de gastronomía/i })
      fireEvent.click(gastronomiaButton)
      expect(mockOnCategoryClick).toHaveBeenCalledWith(3)

      expect(mockOnCategoryClick).toHaveBeenCalledTimes(2)
    })

    test('should apply hover styles on button', () => {
      render(<CategoriesSection {...defaultProps} />)

      const button = screen.getByRole('button', { name: /ver eventos de música/i })
      expect(button).toHaveClass('hover:bg-white', 'hover:border-neutral-200', 'hover:shadow-md')
    })
  })

  describe('accessibility', () => {
    test('should have descriptive aria-label on category buttons', () => {
      render(<CategoriesSection {...defaultProps} />)

      const musicaButton = screen.getByRole('button', { name: 'Ver eventos de Música' })
      expect(musicaButton).toHaveAttribute('aria-label', 'Ver eventos de Música')
    })

    test('should hide decorative icons from screen readers', () => {
      const { container } = render(<CategoriesSection {...defaultProps} />)

      const icons = container.querySelectorAll('[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })

    test('should have focus styles on buttons', () => {
      render(<CategoriesSection {...defaultProps} />)

      const button = screen.getByRole('button', { name: /ver eventos de música/i })
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary-500/20')
    })
  })

  describe('edge cases', () => {
    test('should render single event type correctly', () => {
      const singleType: EventType[] = [{ id: 1, name: 'Música', is_active: true }]
      render(<CategoriesSection {...defaultProps} eventTypes={singleType} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
      expect(screen.getByText('Música')).toBeInTheDocument()
    })

    test('should render many event types in grid layout', () => {
      const manyTypes: EventType[] = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Categoría ${i + 1}`,
        is_active: true
      }))
      render(<CategoriesSection {...defaultProps} eventTypes={manyTypes} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(12)
    })

    test('should handle long category names without breaking layout', () => {
      const longNameTypes: EventType[] = [
        { id: 1, name: 'Música Electrónica y Festivales de Arte Contemporáneo Internacional', is_active: true }
      ]
      render(<CategoriesSection {...defaultProps} eventTypes={longNameTypes} />)

      expect(screen.getByText(/Música Electrónica y Festivales/)).toBeInTheDocument()
    })

    test('should not render empty state when loading with empty data', () => {
      render(<CategoriesSection {...defaultProps} eventTypes={[]} loading={true} />)

      expect(screen.getByRole('status', { name: /cargando/i })).toBeInTheDocument()
      expect(screen.queryByText('Sin tipos de eventos disponibles')).not.toBeInTheDocument()
    })
  })
})
