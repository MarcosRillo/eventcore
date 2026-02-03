/**
 * Internal Calendar Grid View Tests
 *
 * Tests for the internal calendar grid view component.
 * Following TDD methodology (tests written first).
 */

'use client';

import { render, screen } from '@testing-library/react';

import { InternalCalendar } from '@/features/internal-calendar/components/dumb/InternalCalendar';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

// Mock InternalEventCard
jest.mock('../InternalEventCard', () => ({
  InternalEventCard: ({ event, basePath }: { event: InternalCalendarEvent; basePath: string }) => (
    <div data-testid={`event-card-${event.id}`} data-basepath={basePath}>
      {event.title}
    </div>
  ),
}));

describe('InternalCalendar (Grid View)', () => {
  const mockEvents: InternalCalendarEvent[] = [
    {
      id: 1,
      title: 'Evento 1',
      start_date: '2025-12-15',
      end_date: '2025-12-15',
      status: { id: 1, status_code: 'approved_internal', status_name: 'Aprobado Interno', description: 'Event approved for internal use' },
      organization: { id: 1, name: 'Org 1' },
      event_type: { id: 1, name: 'Concierto', color: '#FF5733' },
      locations: [{ id: 1, name: 'Venue 1', city: 'Tucumán' }],
    },
    {
      id: 2,
      title: 'Evento 2',
      start_date: '2025-12-20',
      end_date: '2025-12-20',
      status: { id: 2, status_code: 'published', status_name: 'Publicado', description: 'Event published' },
      organization: { id: 2, name: 'Org 2' },
      event_type: { id: 2, name: 'Festival', color: '#33FF57' },
      locations: [{ id: 2, name: 'Venue 2', city: 'San Miguel de Tucumán' }],
    },
  ];

  const defaultProps = {
    events: mockEvents,
    loading: false,
    error: null,
    basePath: '/internal-calendar',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading is true', () => {
      render(<InternalCalendar {...defaultProps} loading={true} />);

      expect(screen.getByLabelText('Cargando eventos')).toBeInTheDocument();
      expect(screen.getByText(/cargando eventos/i)).toBeInTheDocument();
    });

    it('does not show events when loading', () => {
      render(<InternalCalendar {...defaultProps} loading={true} />);

      expect(screen.queryByTestId('event-card-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('event-card-2')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when error exists', () => {
      render(<InternalCalendar {...defaultProps} error="Error loading events" />);

      expect(screen.getByText('Error loading events')).toBeInTheDocument();
    });

    it('does not show events when error exists', () => {
      render(<InternalCalendar {...defaultProps} error="Error occurred" />);

      expect(screen.queryByTestId('event-card-1')).not.toBeInTheDocument();
    });

    it('has correct error styling', () => {
      render(<InternalCalendar {...defaultProps} error="Error occurred" />);

      const errorElement = screen.getByText('Error occurred');
      expect(errorElement).toHaveClass('text-error-600');
    });
  });

  describe('Empty State', () => {
    it('shows empty message when no events', () => {
      render(<InternalCalendar {...defaultProps} events={[]} />);

      expect(screen.getByRole('heading', { name: /no hay eventos/i })).toBeInTheDocument();
    });

    it('shows appropriate empty state message', () => {
      render(<InternalCalendar {...defaultProps} events={[]} />);

      expect(screen.getByText(/no hay eventos aprobados en este momento/i)).toBeInTheDocument();
    });

    it('renders empty state icon', () => {
      render(<InternalCalendar {...defaultProps} events={[]} />);

      // Icon has aria-hidden="true", so query by the container
      const emptyStateContainer = screen.getByRole('heading', { name: /no hay eventos/i }).closest('div');
      expect(emptyStateContainer).toBeInTheDocument();
    });
  });

  describe('Events Display', () => {
    it('renders all events in grid', () => {
      render(<InternalCalendar {...defaultProps} />);

      expect(screen.getByTestId('event-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('event-card-2')).toBeInTheDocument();
    });

    it('has correct grid layout classes', () => {
      render(<InternalCalendar {...defaultProps} />);

      const grid = screen.getByRole('region', { name: /event grid/i });
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for grid', () => {
      render(<InternalCalendar {...defaultProps} />);

      const grid = screen.getByRole('region', { name: /event grid/i });
      expect(grid).toBeInTheDocument();
    });

    it('has proper ARIA label for loading state', () => {
      render(<InternalCalendar {...defaultProps} loading={true} />);

      const loadingElement = screen.getByLabelText('Cargando eventos');
      expect(loadingElement).toBeInTheDocument();
      expect(loadingElement).toHaveAttribute('aria-label', 'Cargando eventos');
    });
  });

  describe('Responsive Layout', () => {
    it('renders with responsive grid classes', () => {
      render(<InternalCalendar {...defaultProps} />);

      const grid = screen.getByRole('region', { name: /event grid/i });
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });
  });

  describe('Multiple Events', () => {
    it('renders correct number of events', () => {
      render(<InternalCalendar {...defaultProps} />);

      const eventCards = screen.getAllByTestId(/event-card-/);
      expect(eventCards).toHaveLength(2);
    });

    it('renders events in correct order', () => {
      render(<InternalCalendar {...defaultProps} />);

      const eventCards = screen.getAllByTestId(/event-card-/);
      expect(eventCards[0]).toHaveTextContent('Evento 1');
      expect(eventCards[1]).toHaveTextContent('Evento 2');
    });
  });
});
