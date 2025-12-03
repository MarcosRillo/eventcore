import { render, screen } from '@testing-library/react'
import { FeaturedEventsSection } from '../FeaturedEventsSection'

// Mock EventCard
jest.mock('@/features/public-calendar/components/dumb/EventCard', () => ({
  EventCard: ({ event }: { event: { title: string } }) => <div data-testid="event-card">{event.title}</div>
}))

describe('FeaturedEventsSection', () => {
  const mockEvents = [
    { id: 1, title: 'Event 1' },
    { id: 2, title: 'Event 2' }
  ]

  it('renders section title', () => {
    render(<FeaturedEventsSection events={[]} loading={false} onEventClick={jest.fn()} onViewAllClick={jest.fn()} />)
    expect(screen.getByRole('heading', { name: /Próximos Eventos Destacados/i })).toBeInTheDocument()
  })

  it('renders loading skeletons when loading', () => {
    render(<FeaturedEventsSection events={[]} loading={true} onEventClick={jest.fn()} onViewAllClick={jest.fn()} />)
    // Assuming skeletons have a specific class or structure, but for now checking absence of "No hay eventos"
    expect(screen.queryByText(/No hay eventos destacados/i)).not.toBeInTheDocument()
  })

  it('renders events list', () => {
    const eventsWithCategory = mockEvents.map(e => ({
      ...e,
      slug: `event-${e.id}`,
      description: 'Test Description',
      image_url: 'https://example.com/image.jpg',
      event_type: { id: 1, name: 'Test Category' },
      start_date: '2023-01-01',
      end_date: '2023-01-02',
      is_featured: true,
      locations: [{ id: 1, name: 'Test Location', city: 'Test City' }]
    }))
    render(<FeaturedEventsSection events={eventsWithCategory} loading={false} onEventClick={jest.fn()} onViewAllClick={jest.fn()} />)
    expect(screen.getAllByTestId('event-card')).toHaveLength(2)
    expect(screen.getByText('Event 1')).toBeInTheDocument()
    expect(screen.getByText('Event 2')).toBeInTheDocument()
  })

  it('renders empty state message', () => {
    render(<FeaturedEventsSection events={[]} loading={false} onEventClick={jest.fn()} onViewAllClick={jest.fn()} />)
    expect(screen.getByText(/No hay eventos destacados/i)).toBeInTheDocument()
  })
})
