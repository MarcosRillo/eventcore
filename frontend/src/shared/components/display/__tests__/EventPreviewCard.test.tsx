/**
 * Tests for EventPreviewCard Component
 *
 * Tests rendering of image, overlays, event type badge, title, metadata, and actions slot.
 */

import { render, screen } from '@testing-library/react'

import EventPreviewCard from '@/shared/components/display/EventPreviewCard'

// Mock next/image - filter non-DOM props to avoid React warnings
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, style, loading }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src as string} alt={alt as string} className={className as string} style={style as React.CSSProperties} loading={loading as "lazy" | "eager" | undefined} />
  },
}))

describe('EventPreviewCard', () => {
  const defaultProps = {
    imageAlt: 'Test Event',
    title: 'Test Event Title',
    date: '15 jun 2025',
    location: 'Buenos Aires',
  }

  describe('image', () => {
    test('should show SafeImage when imageUrl is provided', () => {
      render(
        <EventPreviewCard
          {...defaultProps}
          imageUrl="https://example.com/image.jpg"
        />
      )

      const img = screen.getByAltText('Test Event')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    test('should show ImagePlaceholder when no imageUrl', () => {
      render(<EventPreviewCard {...defaultProps} />)

      expect(screen.getByTestId('event-image-placeholder')).toBeInTheDocument()
    })
  })

  describe('status badge', () => {
    test('should render status overlay when status is provided', () => {
      render(
        <EventPreviewCard
          {...defaultProps}
          status={{ label: 'Borrador', variant: 'default' }}
        />
      )

      expect(screen.getByText('Borrador')).toBeInTheDocument()
    })

    test('should not render status overlay when no status', () => {
      render(<EventPreviewCard {...defaultProps} />)

      expect(screen.queryByText('Borrador')).not.toBeInTheDocument()
    })
  })

  describe('featured badge', () => {
    test('should render "Destacado" when isFeatured is true', () => {
      render(<EventPreviewCard {...defaultProps} isFeatured={true} />)

      expect(screen.getByText('Destacado')).toBeInTheDocument()
    })

    test('should not render "Destacado" when isFeatured is false', () => {
      render(<EventPreviewCard {...defaultProps} isFeatured={false} />)

      expect(screen.queryByText('Destacado')).not.toBeInTheDocument()
    })

    test('should not render "Destacado" by default', () => {
      render(<EventPreviewCard {...defaultProps} />)

      expect(screen.queryByText('Destacado')).not.toBeInTheDocument()
    })
  })

  describe('event type', () => {
    test('should render event type badge when eventType is provided', () => {
      render(
        <EventPreviewCard
          {...defaultProps}
          eventType={{ name: 'Concierto', color: '#FF5733' }}
        />
      )

      const badge = screen.getByText('Concierto')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveStyle({ backgroundColor: '#FF5733' })
    })

    test('should use default color when eventType has no color', () => {
      render(
        <EventPreviewCard
          {...defaultProps}
          eventType={{ name: 'Festival' }}
        />
      )

      const badge = screen.getByText('Festival')
      expect(badge).toHaveStyle({ backgroundColor: '#3B82F6' })
    })

    test('should not render event type badge when no eventType', () => {
      render(<EventPreviewCard {...defaultProps} />)

      expect(screen.queryByText('Concierto')).not.toBeInTheDocument()
    })
  })

  describe('content', () => {
    test('should render title in h3 element', () => {
      render(<EventPreviewCard {...defaultProps} />)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Test Event Title')
    })

    test('should render date', () => {
      render(<EventPreviewCard {...defaultProps} />)

      expect(screen.getByText('15 jun 2025')).toBeInTheDocument()
    })

    test('should render location', () => {
      render(<EventPreviewCard {...defaultProps} />)

      expect(screen.getByText('Buenos Aires')).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    test('should render actions slot when provided', () => {
      render(
        <EventPreviewCard
          {...defaultProps}
          actions={<button>Gestionar</button>}
        />
      )

      expect(screen.getByRole('button', { name: 'Gestionar' })).toBeInTheDocument()
    })

    test('should not render actions footer when no actions', () => {
      const { container } = render(<EventPreviewCard {...defaultProps} />)

      // No border-t footer should exist for actions
      const footerBorders = container.querySelectorAll('.border-t')
      expect(footerBorders.length).toBe(0)
    })
  })

  describe('accessibility', () => {
    test('should render as article element', () => {
      render(<EventPreviewCard {...defaultProps} />)

      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    test('should have aria-hidden on decorative icons', () => {
      render(
        <EventPreviewCard
          {...defaultProps}
          isFeatured={true}
        />
      )

      const svgs = screen.getByRole('article').querySelectorAll('svg')
      svgs.forEach(svg => {
        expect(svg).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('memoization', () => {
    test('should be a memoized component', () => {
      expect(typeof EventPreviewCard).toBe('object')
      expect(EventPreviewCard.$$typeof?.toString()).toContain('react.memo')
    })
  })

  describe('className', () => {
    test('should apply custom className', () => {
      render(<EventPreviewCard {...defaultProps} className="custom-class" />)

      expect(screen.getByRole('article')).toHaveClass('custom-class')
    })
  })
})
