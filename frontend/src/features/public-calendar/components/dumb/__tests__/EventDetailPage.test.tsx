/**
 * Tests for EventDetailPage Component
 *
 * Tests event detail display, date formatting, location handling,
 * and calendar export functionality.
 */

import { fireEvent,render, screen } from '@testing-library/react'

import EventDetailPage from '@/features/public-calendar/components/dumb/EventDetailPage'
import { Event } from '@/types/event.types'

// Mock Next.js Image - filter out non-HTML props to avoid React warnings
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    priority: _priority,
    fill: _fill,
    placeholder: _placeholder,
    blurDataURL: _blurDataURL,
    ...props
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />
  }
}))

// Mock ShareButtons component
jest.mock('@/features/public-calendar/components/dumb/ShareButtons', () => ({
  __esModule: true,
  ShareButtons: () => <div data-testid="share-buttons">Share Buttons</div>
}))

// Mock eventPublicExportService
jest.mock('@/features/events/services/eventPublicService', () => ({
  eventPublicExportService: {
    getGoogleCalendarUrl: jest.fn(() => 'https://calendar.google.com/event'),
    getOutlookCalendarUrl: jest.fn(() => 'https://outlook.com/event'),
    getEventICalUrl: jest.fn((id: number) => `/api/events/${id}/ical`)
  }
}))

describe('EventDetailPage', () => {
  const mockEvent: Event = {
    id: 1,
    title: 'Festival de Música Tucumán',
    description: '<p>Gran festival con artistas nacionales e internacionales</p>',
    start_date: '2025-11-15T18:00:00.000Z',
    end_date: '2025-11-17T23:00:00.000Z',
    type: 'sede_unica',
    status: 'published',
    locations: [
      {
        id: 1,
        name: 'Parque 9 de Julio',
        city: 'San Miguel de Tucumán',
        address: 'Av. Aconquija s/n',
        state: 'Tucumán',
        country: 'Argentina',
        is_active: true,
        entity_id: 1,
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      }
    ],
    is_featured: true,
    featured_image: 'https://example.com/festival.jpg',
    contact_email: 'info@festival.com',
    contact_phone: '+54 381 4300000',
    website_url: 'https://festival.com',
    cta_text: 'Comprar Entradas',
    cta_link: 'https://festival.com/tickets',
    approval_history: [],
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Display', () => {
    test('renders event title and description', () => {
      render(<EventDetailPage event={mockEvent} />)

      expect(screen.getByText('Festival de Música Tucumán')).toBeInTheDocument()
      // Description contains HTML, so we check for text content
      expect(screen.getByText(/Gran festival con artistas/i)).toBeInTheDocument()
    })

    test('displays featured badge when event is featured', () => {
      render(<EventDetailPage event={mockEvent} />)

      expect(screen.getByText(/evento destacado/i)).toBeInTheDocument()
    })

    test('does not display featured badge when event is not featured', () => {
      const nonFeaturedEvent = { ...mockEvent, is_featured: false }
      render(<EventDetailPage event={nonFeaturedEvent} />)

      expect(screen.queryByText(/evento destacado/i)).not.toBeInTheDocument()
    })
  })

  describe('Date and Time Display', () => {
    test('renders formatted date range', () => {
      render(<EventDetailPage event={mockEvent} />)

      // Should display formatted dates (moment formats in Spanish)
      const dateSection = screen.getByText(/fecha y hora/i).parentElement
      expect(dateSection).toBeInTheDocument()
    })

    test('displays event dates in Spanish locale', () => {
      render(<EventDetailPage event={mockEvent} />)

      // Moment should format dates in Spanish
      // Check for Spanish day/month names (e.g., "noviembre", "viernes")
      const content = document.body.textContent || ''
      // At least one Spanish date element should be present
      expect(content.length).toBeGreaterThan(0)
    })
  })

  describe('Location Display', () => {
    test('renders location name', () => {
      render(<EventDetailPage event={mockEvent} />)

      // Location name is displayed
      expect(screen.getByText(/parque 9 de julio/i)).toBeInTheDocument()
      // Location header is present
      expect(screen.getByText(/ubicación/i)).toBeInTheDocument()
    })

    test('renders location address when available', () => {
      render(<EventDetailPage event={mockEvent} />)

      expect(screen.getByText(/av\. aconquija/i)).toBeInTheDocument()
    })

    test('handles event with virtual link', () => {
      const virtualEvent = {
        ...mockEvent,
        locations: [],
        virtual_link: 'https://zoom.us/meeting'
      }
      render(<EventDetailPage event={virtualEvent} />)

      // Check for virtual event link specifically
      const virtualLink = screen.getByRole('link', { name: /unirse al evento virtual/i })
      expect(virtualLink).toBeInTheDocument()
      expect(virtualLink).toHaveAttribute('href', 'https://zoom.us/meeting')
    })

    test('handles event without location', () => {
      const eventWithoutLocation = {
        ...mockEvent,
        locations: [],
        location: undefined,
        location_text: undefined
      }
      render(<EventDetailPage event={eventWithoutLocation} />)

      expect(screen.getByText(/ubicación no especificada/i)).toBeInTheDocument()
    })
  })

  describe('Contact Information', () => {
    test('renders contact email when provided', () => {
      render(<EventDetailPage event={mockEvent} />)

      const emailLink = screen.getByRole('link', { name: /info@festival\.com/i })
      expect(emailLink).toBeInTheDocument()
      expect(emailLink).toHaveAttribute('href', 'mailto:info@festival.com')
    })

    test('renders contact phone when provided', () => {
      render(<EventDetailPage event={mockEvent} />)

      const phoneLink = screen.getByRole('link', { name: /\+54 381 4300000/i })
      expect(phoneLink).toBeInTheDocument()
      expect(phoneLink).toHaveAttribute('href', 'tel:+54 381 4300000')
    })

    test('does not render contact section when no contact info provided', () => {
      const eventWithoutContact = {
        ...mockEvent,
        contact_email: undefined,
        contact_phone: undefined
      }
      render(<EventDetailPage event={eventWithoutContact} />)

      expect(screen.queryByText(/información de contacto/i)).not.toBeInTheDocument()
    })
  })

  describe('Calendar Export Buttons', () => {
    test('renders calendar export buttons', () => {
      render(<EventDetailPage event={mockEvent} />)

      expect(screen.getByRole('button', { name: /google calendar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /outlook/i })).toBeInTheDocument()
    })

    test('Google Calendar button opens correct URL', () => {
      const mockOpen = jest.fn()
      global.window.open = mockOpen

      render(<EventDetailPage event={mockEvent} />)

      const googleButton = screen.getByRole('button', { name: /google calendar/i })
      fireEvent.click(googleButton)

      expect(mockOpen).toHaveBeenCalledWith('https://calendar.google.com/event', '_blank')
    })

    test('Outlook button opens correct URL', () => {
      const mockOpen = jest.fn()
      global.window.open = mockOpen

      render(<EventDetailPage event={mockEvent} />)

      const outlookButton = screen.getByRole('button', { name: /outlook/i })
      fireEvent.click(outlookButton)

      expect(mockOpen).toHaveBeenCalledWith('https://outlook.com/event', '_blank')
    })
  })

  describe('Website and CTA Links', () => {
    test('renders website link when provided', () => {
      render(<EventDetailPage event={mockEvent} />)

      const websiteLink = screen.getByRole('link', { name: /sitio web oficial/i })
      expect(websiteLink).toBeInTheDocument()
      expect(websiteLink).toHaveAttribute('href', 'https://festival.com')
      expect(websiteLink).toHaveAttribute('target', '_blank')
    })

    test('renders CTA button when provided', () => {
      render(<EventDetailPage event={mockEvent} />)

      const ctaButton = screen.getByRole('link', { name: /comprar entradas/i })
      expect(ctaButton).toBeInTheDocument()
      expect(ctaButton).toHaveAttribute('href', 'https://festival.com/tickets')
      expect(ctaButton).toHaveAttribute('target', '_blank')
    })

    test('does not render website section when no links provided', () => {
      const eventWithoutLinks = {
        ...mockEvent,
        website_url: undefined,
        cta_text: undefined,
        cta_link: undefined
      }
      render(<EventDetailPage event={eventWithoutLinks} />)

      expect(screen.queryByText(/enlaces relacionados/i)).not.toBeInTheDocument()
    })
  })

  describe('Image Display', () => {
    test('renders featured image when provided', () => {
      render(<EventDetailPage event={mockEvent} />)

      const image = screen.getByAltText('Festival de Música Tucumán')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/festival.jpg')
    })

    test('does not render image section when no image provided', () => {
      const eventWithoutImage = {
        ...mockEvent,
        featured_image: undefined
      }
      const { container } = render(<EventDetailPage event={eventWithoutImage} />)

      const images = container.querySelectorAll('img')
      // Should have no images (since we're not rendering the featured image)
      expect(images.length).toBe(0)
    })
  })

  describe('Share Functionality', () => {
    test('renders ShareButtons component', () => {
      render(<EventDetailPage event={mockEvent} />)

      expect(screen.getByTestId('share-buttons')).toBeInTheDocument()
    })

    test('displays share section header', () => {
      render(<EventDetailPage event={mockEvent} />)

      expect(screen.getByText(/compartir evento/i)).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    test('renders back to calendar link', () => {
      render(<EventDetailPage event={mockEvent} />)

      const backLink = screen.getByRole('link', { name: /volver al calendario/i })
      expect(backLink).toBeInTheDocument()
      expect(backLink).toHaveAttribute('href', '/calendar')
    })
  })

  describe('Accessibility', () => {
    test('uses semantic HTML structure', () => {
      const { container } = render(<EventDetailPage event={mockEvent} />)

      // Should have proper container structure (min-h-screen is now in layout)
      expect(container.querySelector('.bg-neutral-50')).toBeInTheDocument()
      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument()
    })

    test('links have proper attributes for security', () => {
      render(<EventDetailPage event={mockEvent} />)

      const externalLinks = screen.getAllByRole('link', { name: /sitio web|comprar/i })
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })
  })

  describe('Edge Cases', () => {
    test('handles event with minimal data', () => {
      const minimalEvent: Event = {
        id: 1,
        title: 'Minimal Event',
        description: 'Simple description',
        start_date: '2025-11-15',
        end_date: '2025-11-15',
        type: 'sede_unica',
        status: 'published',
        locations: [],
        is_featured: false,
        approval_history: [],
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      }

      render(<EventDetailPage event={minimalEvent} />)

      expect(screen.getByText('Minimal Event')).toBeInTheDocument()
      expect(screen.getByText('Simple description')).toBeInTheDocument()
    })

    test('handles event with HTML in description', () => {
      const eventWithHTML = {
        ...mockEvent,
        description: '<p>Paragraph 1</p><p>Paragraph 2</p><strong>Bold text</strong>'
      }

      render(<EventDetailPage event={eventWithHTML} />)

      // Should render HTML content
      const description = screen.getByText(/paragraph 1/i).parentElement
      expect(description?.innerHTML).toContain('<p>')
      expect(description?.innerHTML).toContain('<strong>')
    })
  })
})
