/**
 * Organizer Calendar Event Detail Page Tests
 *
 * Tests for the dynamic route page that renders event details for organizers.
 */

import { render, screen } from '@testing-library/react';

import OrganizerEventDetailPage, { generateMetadata } from '@/app/organizer/calendar/[id]/page';

// Mock the container component
jest.mock('@/features/internal-calendar/components/smart/InternalEventDetailPageContainer', () => ({
  InternalEventDetailPageContainer: ({ eventId, basePath }: { eventId: number; basePath: string }) => (
    <div data-testid="event-detail-container" data-event-id={eventId} data-base-path={basePath} />
  ),
}));

describe('OrganizerEventDetailPage', () => {
  test('renders InternalEventDetailPageContainer with parsed eventId', async () => {
    const params = Promise.resolve({ id: '42' });

    const Page = await OrganizerEventDetailPage({ params });
    render(Page);

    const container = screen.getByTestId('event-detail-container');
    expect(container).toHaveAttribute('data-event-id', '42');
    expect(container).toHaveAttribute('data-base-path', '/organizer/calendar');
  });

  test('renders error message for invalid (non-numeric) ID', async () => {
    const params = Promise.resolve({ id: 'abc' });

    const Page = await OrganizerEventDetailPage({ params });
    render(Page);

    expect(screen.getByText('ID de evento inválido')).toBeInTheDocument();
    expect(screen.getByText('El ID proporcionado no es válido.')).toBeInTheDocument();
    expect(screen.queryByTestId('event-detail-container')).not.toBeInTheDocument();
  });

  test('renders error message for empty ID', async () => {
    const params = Promise.resolve({ id: '' });

    const Page = await OrganizerEventDetailPage({ params });
    render(Page);

    expect(screen.getByText('ID de evento inválido')).toBeInTheDocument();
  });
});

describe('generateMetadata', () => {
  test('returns metadata with event ID in title', async () => {
    const params = Promise.resolve({ id: '42' });

    const metadata = await generateMetadata({ params });

    expect(metadata.title).toBe('Evento #42 - Calendario Organizador');
    expect(metadata.description).toBe('Detalle del evento en el calendario del organizador');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
