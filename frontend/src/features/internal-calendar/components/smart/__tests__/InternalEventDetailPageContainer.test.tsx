/**
 * InternalEventDetailPageContainer Component Tests
 *
 * Tests for event detail page container with loading, error, and success states.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { InternalEventDetailPageContainer } from '@/features/internal-calendar/components/smart/InternalEventDetailPageContainer';
import { internalCalendarService } from '@/features/internal-calendar/services/internalCalendar.service';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

// Mock dependencies
jest.mock('@/features/internal-calendar/services/internalCalendar.service');
jest.mock('next/navigation');
jest.mock('@/features/internal-calendar/components/dumb/InternalEventDetailPage', () => ({
  InternalEventDetailPage: ({ event, onBack }: { event: InternalCalendarEvent; onBack: () => void }) => (
    <div data-testid="event-detail-page">
      <h1>{event.title}</h1>
      <button onClick={onBack} data-testid="back-button">Volver</button>
    </div>
  ),
}));

describe('InternalEventDetailPageContainer', () => {
  const mockRouterBack = jest.fn();
  const mockGetEventById = internalCalendarService.getEventById as jest.MockedFunction<typeof internalCalendarService.getEventById>;

  const mockEvent: InternalCalendarEvent = {
    id: 1,
    title: 'Test Event',
    description: 'Test Description',
    start_date: '2025-12-15T10:00:00Z',
    end_date: '2025-12-15T12:00:00Z',
    status: {
      id: 1,
      status_code: 'approved_internal',
      status_name: 'Approved Internal',
      description: 'Event approved for internal use',
    },
    organization: {
      id: 1,
      name: 'Test Organization',
    },
    event_type: {
      id: 1,
      name: 'Conference',
      color: '#FF0000',
      active: true,
      created_at: '',
      updated_at: '',
    },
    locations: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockRouterBack,
    });
  });

  test('shows loading state initially', () => {
    mockGetEventById.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<InternalEventDetailPageContainer eventId={1} />);

    // Should show loading spinner and message
    expect(screen.getByText('Cargando evento...')).toBeInTheDocument();
  });

  test('fetches event by ID on mount and renders detail page', async () => {
    mockGetEventById.mockResolvedValue(mockEvent);

    render(<InternalEventDetailPageContainer eventId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByTestId('event-detail-page')).toBeInTheDocument();
    });

    // Should fetch event by ID
    expect(mockGetEventById).toHaveBeenCalledTimes(1);
    expect(mockGetEventById).toHaveBeenCalledWith(1);

    // Should render event detail page with correct event
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  test('shows error when event not found (404)', async () => {
    // Return null when event not found
    mockGetEventById.mockResolvedValue(null);

    render(<InternalEventDetailPageContainer eventId={1} />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Evento no encontrado')).toBeInTheDocument();
    });

    // Should show error message
    expect(screen.getByText('No se pudo cargar la información del evento.')).toBeInTheDocument();

    // Should show back button
    expect(screen.getByText('Volver al calendario')).toBeInTheDocument();
  });

  test('shows error when network fails', async () => {
    mockGetEventById.mockRejectedValue(new Error('Network error'));

    render(<InternalEventDetailPageContainer eventId={1} />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Error al cargar el evento')).toBeInTheDocument();
    });

    // Should show error message
    expect(screen.getByText('No se pudo cargar la información del evento.')).toBeInTheDocument();

    // Should show back button
    expect(screen.getByText('Volver al calendario')).toBeInTheDocument();
  });

  test('renders InternalEventDetailPage when loaded successfully', async () => {
    mockGetEventById.mockResolvedValue(mockEvent);

    render(<InternalEventDetailPageContainer eventId={1} />);

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByTestId('event-detail-page')).toBeInTheDocument();
    });

    // Should render the detail page component
    expect(screen.getByText('Test Event')).toBeInTheDocument();

    // Should have back button from detail page
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  test('calls router.back() when back button clicked', async () => {
    mockGetEventById.mockResolvedValue(mockEvent);

    render(<InternalEventDetailPageContainer eventId={1} />);

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByTestId('event-detail-page')).toBeInTheDocument();
    });

    // Click back button from detail page
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    // Should call router.back()
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });

  test('calls router.back() when back button clicked from error state', async () => {
    mockGetEventById.mockRejectedValue(new Error('Network error'));

    render(<InternalEventDetailPageContainer eventId={1} />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Error al cargar el evento')).toBeInTheDocument();
    });

    // Click back button from error state
    const backButton = screen.getByText('Volver al calendario');
    fireEvent.click(backButton);

    // Should call router.back()
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });
});
