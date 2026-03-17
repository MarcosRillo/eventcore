import { render, screen } from '@testing-library/react'

import { LandingContainer } from '@/features/landing/components/smart/LandingContainer'
import type { EventType,PublicEvent } from '@/features/public-calendar/types/public-calendar.types'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

// Mock next/dynamic to return components synchronously
jest.mock('next/dynamic', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')
  return function dynamic(importFn: () => Promise<{ default: React.ComponentType }>) {
    // Determine which component to return based on the import path
    const importStr = importFn.toString()
    if (importStr.includes('CategoriesSection')) {
      return function MockCategoriesSection({ loading, eventTypes }: { loading: boolean; eventTypes: unknown[] }) {
        return React.createElement('div', { 'data-testid': 'categories-section' },
          `Event Types: ${loading ? 'Loading' : eventTypes.length}`
        )
      }
    }
    if (importStr.includes('OrganizersSection')) {
      return function MockOrganizersSection() {
        return React.createElement('div', { 'data-testid': 'organizers-section' }, 'Organizers Section')
      }
    }
    // Fallback: return a placeholder
    return function MockComponent() {
      return React.createElement('div', null, 'Dynamic Component')
    }
  }
})

// Mock HeroSection (direct import)
jest.mock('@/features/landing/components/dumb/HeroSection', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>
}))

// Mock FeaturedEventsSection (direct import)
jest.mock('@/features/landing/components/dumb/FeaturedEventsSection', () => ({
  FeaturedEventsSection: ({ loading, events }: { loading: boolean; events: unknown[] }) => (
    <div data-testid="featured-section">
      Featured: {loading ? 'Loading' : events.length}
    </div>
  )
}))

// Helper to create mock data
const createMockEvent = (overrides: Partial<PublicEvent> = {}): PublicEvent => ({
  id: 1,
  title: 'Test Event',
  description: 'Test description',
  start_date: '2025-01-01',
  end_date: '2025-01-02',
  start_time: '10:00',
  end_time: '18:00',
  featured_image: undefined,
  event_type: { id: 1, name: 'Cultural', color: '#000' },
  event_subtype: undefined,
  locations: [{ id: 1, name: 'Test Location', city: 'Test City', address: 'Test Address' }],
  is_featured: false,
  ...overrides
})

const createMockEventType = (overrides: Partial<EventType> = {}): EventType => ({
  id: 1,
  name: 'Cultural',
  slug: 'cultural',
  color: '#000',
  is_active: true,
  ...overrides
})

describe('LandingContainer', () => {
  const defaultProps = {
    initialFeaturedEvents: [] as PublicEvent[],
    initialEventTypes: [] as EventType[]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all sections with empty data', () => {
    render(<LandingContainer {...defaultProps} />)

    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('featured-section')).toBeInTheDocument()
    expect(screen.getByTestId('categories-section')).toBeInTheDocument()
    expect(screen.getByTestId('organizers-section')).toBeInTheDocument()
  })

  it('passes server-fetched data to sections', () => {
    const mockEvents = [createMockEvent()]
    const mockEventTypes = [createMockEventType()]

    render(
      <LandingContainer
        initialFeaturedEvents={mockEvents}
        initialEventTypes={mockEventTypes}
      />
    )

    expect(screen.getByText('Featured: 1')).toBeInTheDocument()
    expect(screen.getByText('Event Types: 1')).toBeInTheDocument()
  })

  it('renders with multiple events and event types', () => {
    const mockEvents = [
      createMockEvent({ id: 1, title: 'Event 1' }),
      createMockEvent({ id: 2, title: 'Event 2' }),
      createMockEvent({ id: 3, title: 'Event 3' })
    ]
    const mockEventTypes = [
      createMockEventType({ id: 1, name: 'Cultural' }),
      createMockEventType({ id: 2, name: 'Gastronómico' })
    ]

    render(
      <LandingContainer
        initialFeaturedEvents={mockEvents}
        initialEventTypes={mockEventTypes}
      />
    )

    expect(screen.getByText('Featured: 3')).toBeInTheDocument()
    expect(screen.getByText('Event Types: 2')).toBeInTheDocument()
  })

  it('always renders with loading=false (data is server-fetched)', () => {
    render(<LandingContainer {...defaultProps} />)

    // Both sections should show count (not "Loading")
    expect(screen.getByText('Featured: 0')).toBeInTheDocument()
    expect(screen.getByText('Event Types: 0')).toBeInTheDocument()
  })
})
