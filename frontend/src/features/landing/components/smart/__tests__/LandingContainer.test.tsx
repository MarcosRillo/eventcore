import { render, screen } from '@testing-library/react'

import { LandingContainer } from '@/features/landing/components/smart/LandingContainer'
import type { PublicEvent, EventType } from '@/features/public-calendar/types/public-calendar.types'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

// Mock dumb components
jest.mock('@/features/landing/components/dumb', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
  FeaturedEventsSection: ({ loading, events }: { loading: boolean; events: unknown[] }) => (
    <div data-testid="featured-section">
      Featured: {loading ? 'Loading' : events.length}
    </div>
  ),
  CategoriesSection: ({ loading, eventTypes }: { loading: boolean; eventTypes: unknown[] }) => (
    <div data-testid="categories-section">
      Event Types: {loading ? 'Loading' : eventTypes.length}
    </div>
  ),
  OrganizersSection: () => <div data-testid="organizers-section">Organizers Section</div>,
  Footer: () => <div data-testid="footer">Footer</div>
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
  featured_image: null,
  event_type: { id: 1, name: 'Cultural', slug: 'cultural', icon: 'star', color: '#000' },
  event_subtype: null,
  location: { id: 1, name: 'Test Location', address: 'Test Address' },
  organization: { id: 1, name: 'Test Org' },
  ...overrides
})

const createMockEventType = (overrides: Partial<EventType> = {}): EventType => ({
  id: 1,
  name: 'Cultural',
  slug: 'cultural',
  icon: 'star',
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
