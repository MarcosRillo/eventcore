/**
 * Tests for EventCard component
 *
 * Tests event card display, featured badge, and click handling.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { EventCard } from '../components/dumb/EventCard'
import { PublicEvent } from '../types/public-calendar.types'

describe('EventCard', () => {
  const mockEvent: PublicEvent = {
    id: 1,
    title: 'Festival de Música',
    description: 'Gran evento musical con artistas nacionales e internacionales',
    start_date: '2025-11-15',
    end_date: '2025-11-17',
    start_time: '18:00',
    end_time: '23:00',
    category: { id: 1, name: 'Música' },
    locations: [
      {
        id: 1,
        name: 'Teatro San Martín',
        city: 'San Miguel de Tucumán',
        address: 'San Martín 251'
      }
    ],
    is_featured: true,
    image_url: 'https://example.com/image.jpg'
  }

  const mockHandlers = {
    onClick: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Display', () => {
    test('renders event title', () => {
      render(<EventCard event={mockEvent} {...mockHandlers} />)

      expect(screen.getByText('Festival de Música')).toBeInTheDocument()
    })

    test('renders event category', () => {
      render(<EventCard event={mockEvent} {...mockHandlers} />)

      expect(screen.getByText('Música')).toBeInTheDocument()
    })

    test('renders event location', () => {
      render(<EventCard event={mockEvent} {...mockHandlers} />)

      expect(screen.getByText(/Teatro San Martín/i)).toBeInTheDocument()
      expect(screen.getByText(/San Miguel de Tucumán/i)).toBeInTheDocument()
    })

    test('renders event date', () => {
      render(<EventCard event={mockEvent} {...mockHandlers} />)

      // Should format dates nicely
      const dateElement = screen.getByText(/nov/i)
      expect(dateElement).toBeInTheDocument()
    })
  })

  describe('Featured Badge', () => {
    test('displays featured badge when is_featured is true', () => {
      render(<EventCard event={mockEvent} {...mockHandlers} />)

      expect(screen.getByText(/destacado/i)).toBeInTheDocument()
    })

    test('does not display featured badge when is_featured is false', () => {
      const nonFeaturedEvent = { ...mockEvent, is_featured: false }

      render(<EventCard event={nonFeaturedEvent} {...mockHandlers} />)

      expect(screen.queryByText(/destacado/i)).not.toBeInTheDocument()
    })
  })

  describe('Image Display', () => {
    test('displays event image when image_url is provided', () => {
      render(<EventCard event={mockEvent} {...mockHandlers} />)

      const image = screen.getByRole('img', { name: /Festival de Música/i })
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    test('displays placeholder when image_url is not provided', () => {
      const eventWithoutImage = { ...mockEvent, image_url: undefined }

      render(<EventCard event={eventWithoutImage} {...mockHandlers} />)

      // Should have a placeholder or default image
      const placeholder = screen.getByTestId('event-image-placeholder')
      expect(placeholder).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    test('calls onClick when card is clicked', () => {
      render(<EventCard event={mockEvent} {...mockHandlers} />)

      const card = screen.getByRole('article')
      fireEvent.click(card)

      expect(mockHandlers.onClick).toHaveBeenCalledWith(mockEvent.id)
    })

    test('card is keyboard accessible', () => {
      render(<EventCard event={mockEvent} {...mockHandlers} />)

      const card = screen.getByRole('article')

      expect(card).toHaveAttribute('tabIndex', '0')
    })

    test('calls onClick on Enter key press', () => {
      render(<EventCard event={mockEvent} {...mockHandlers} />)

      const card = screen.getByRole('article')
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' })

      expect(mockHandlers.onClick).toHaveBeenCalledWith(mockEvent.id)
    })
  })

  describe('Styling', () => {
    test('applies hover effect classes', () => {
      render(<EventCard event={mockEvent} {...mockHandlers} />)

      const card = screen.getByRole('article')

      expect(card.className).toContain('hover')
    })

    test('applies responsive classes', () => {
      render(<EventCard event={mockEvent} {...mockHandlers} />)

      const card = screen.getByRole('article')

      // Should have responsive padding/sizing
      expect(card.className).toMatch(/p-/)
    })
  })
})
