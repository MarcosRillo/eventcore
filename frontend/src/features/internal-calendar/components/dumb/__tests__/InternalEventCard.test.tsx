import { render, screen } from '@testing-library/react';

import { InternalEventCard } from '@/features/internal-calendar/components/dumb/InternalEventCard';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

describe('InternalEventCard', () => {
  const mockEvent: InternalCalendarEvent = {
    id: 1,
    title: 'Conferencia de Tecnología',
    description: 'Evento sobre las últimas tendencias en tecnología',
    start_date: '2025-12-15',
    end_date: '2025-12-16',
    status: {
      id: 1,
      status_code: 'approved_internal',
      status_name: 'Approved Internal',
      description: 'Event approved for internal use',
    },
    organization: {
      id: 1,
      name: 'Tech Corp',
    },
    eventType: {
      id: 1,
      name: 'Conferencia',
      color: '#FF5733',
    },
    locations: [
      {
        id: 1,
        name: 'Centro de Convenciones',
        city: 'San Miguel de Tucumán',
      },
    ],
  };

  test('should render event title correctly', () => {
    render(<InternalEventCard event={mockEvent} />);

    expect(screen.getByText('Conferencia de Tecnología')).toBeInTheDocument();
  });

  test('should render event status badge', () => {
    render(<InternalEventCard event={mockEvent} />);

    const badge = screen.getByText('Aprobado Interno');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');
  });

  test('should render organization name', () => {
    render(<InternalEventCard event={mockEvent} />);

    expect(screen.getByText(/Tech Corp/i)).toBeInTheDocument();
  });

  test('should render location information when available', () => {
    render(<InternalEventCard event={mockEvent} />);

    expect(screen.getByText(/Centro de Convenciones/i)).toBeInTheDocument();
    expect(screen.getByText(/San Miguel de Tucumán/i)).toBeInTheDocument();
  });
});
