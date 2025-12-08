import { render, screen } from '@testing-library/react';
import { InternalCalendarView } from '@/features/internal-calendar/components/dumb/InternalCalendarView.tsx';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

describe('InternalCalendarView', () => {
  const mockEvents: InternalCalendarEvent[] = [
    {
      id: 1,
      title: 'Evento 1',
      start_date: '2025-12-15',
      end_date: '2025-12-16',
      status: {
        id: 1,
        status_code: 'approved_internal',
        name: 'Approved Internal',
      },
      organization: {
        id: 1,
        name: 'Org 1',
      },
    },
    {
      id: 2,
      title: 'Evento 2',
      start_date: '2025-12-20',
      end_date: '2025-12-21',
      status: {
        id: 2,
        status_code: 'published',
        name: 'Published',
      },
      organization: {
        id: 2,
        name: 'Org 2',
      },
    },
  ];

  test('should render all events in the list', () => {
    render(<InternalCalendarView events={mockEvents} loading={false} />);

    expect(screen.getByText('Evento 1')).toBeInTheDocument();
    expect(screen.getByText('Evento 2')).toBeInTheDocument();
  });

  test('should display loading state when loading is true', () => {
    render(<InternalCalendarView events={[]} loading={true} />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  test('should display empty state when no events and not loading', () => {
    render(<InternalCalendarView events={[]} loading={false} />);

    expect(screen.getByText(/no hay eventos/i)).toBeInTheDocument();
  });
});
