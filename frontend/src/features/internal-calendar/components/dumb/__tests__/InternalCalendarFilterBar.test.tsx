/**
 * InternalCalendarFilterBar Component Tests
 *
 * Tests for filter bar with event type, status, and date filters.
 */

import { fireEvent,render, screen } from '@testing-library/react';

import { InternalCalendarFilterBar } from '@/features/internal-calendar/components/dumb/InternalCalendarFilterBar';
import type {
  EventType,
  InternalCalendarStatusCode,
} from '@/features/internal-calendar/types/internal-calendar.types';

describe('InternalCalendarFilterBar', () => {
  const mockOnFiltersChange = jest.fn();
  const mockEventTypes: EventType[] = [
    { id: 1, name: 'Conferencia', color: '#FF0000' },
    { id: 2, name: 'Taller', color: '#00FF00' },
    { id: 3, name: 'Exposición', color: '#0000FF' },
  ];
  const mockStatuses: InternalCalendarStatusCode[] = [
    'approved_internal',
    'pending_public_approval',
    'published',
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all filter controls', () => {
    render(
      <InternalCalendarFilterBar
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        eventTypes={mockEventTypes}
        statuses={mockStatuses}
      />
    );

    // Verify all 4 filter labels
    expect(screen.getByText('Tipo de Evento')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Desde')).toBeInTheDocument();
    expect(screen.getByText('Hasta')).toBeInTheDocument();

    // Verify select triggers (Headless UI Listbox buttons)
    expect(screen.getByRole('button', { name: /Todos los tipos/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Todos los estados/ })).toBeInTheDocument();

    // Verify date inputs (Input shared component has htmlFor)
    expect(screen.getByLabelText('Desde')).toBeInTheDocument();
    expect(screen.getByLabelText('Hasta')).toBeInTheDocument();
  });

  test('event type dropdown shows loading state when eventTypesLoading is true', () => {
    render(
      <InternalCalendarFilterBar
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        eventTypes={[]}
        eventTypesLoading={true}
        statuses={mockStatuses}
      />
    );

    const trigger = screen.getByRole('button', { name: /Todos los tipos/ });

    // Should be disabled when loading
    expect(trigger).toBeDisabled();
  });

  test('event type dropdown shows options when loaded', () => {
    render(
      <InternalCalendarFilterBar
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        eventTypes={mockEventTypes}
        eventTypesLoading={false}
        statuses={mockStatuses}
      />
    );

    const trigger = screen.getByRole('button', { name: /Todos los tipos/ });

    // Should not be disabled
    expect(trigger).not.toBeDisabled();

    // Open the dropdown
    fireEvent.click(trigger);

    // Should have 3 event type options (placeholder is in the button, not an option)
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(screen.getByRole('option', { name: 'Conferencia' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Taller' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Exposición' })).toBeInTheDocument();
  });

  test('calls onFiltersChange when event type selected', () => {
    render(
      <InternalCalendarFilterBar
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        eventTypes={mockEventTypes}
        statuses={mockStatuses}
      />
    );

    // Open the event type dropdown and select "Taller" (id: 2)
    fireEvent.click(screen.getByRole('button', { name: /Todos los tipos/ }));
    fireEvent.click(screen.getByRole('option', { name: 'Taller' }));

    // Should call onFiltersChange with event_type_id
    expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      event_type_id: 2,
    });
  });

  test('calls onFiltersChange when status selected', () => {
    render(
      <InternalCalendarFilterBar
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        eventTypes={mockEventTypes}
        statuses={mockStatuses}
      />
    );

    // Open the status dropdown and select "Aprobado Interno"
    fireEvent.click(screen.getByRole('button', { name: /Todos los estados/ }));
    fireEvent.click(screen.getByRole('option', { name: 'Aprobado Interno' }));

    // Should call onFiltersChange with status
    expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      status: 'approved_internal',
    });
  });

  test('status dropdown shows options from statuses prop', () => {
    render(
      <InternalCalendarFilterBar
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        eventTypes={mockEventTypes}
        statuses={mockStatuses}
      />
    );

    // Open the status dropdown
    fireEvent.click(screen.getByRole('button', { name: /Todos los estados/ }));

    // Should have 3 status options (placeholder is in the button, not an option)
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(screen.getByRole('option', { name: 'Aprobado Interno' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pendiente Aprobación Pública' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Publicado' })).toBeInTheDocument();
  });

  test('status dropdown is disabled when statusesLoading is true', () => {
    render(
      <InternalCalendarFilterBar
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        eventTypes={mockEventTypes}
        statuses={[]}
        statusesLoading={true}
      />
    );

    expect(screen.getByRole('button', { name: /Todos los estados/ })).toBeDisabled();
  });

  test('calls onFiltersChange when dates selected', () => {
    render(
      <InternalCalendarFilterBar
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        eventTypes={mockEventTypes}
        statuses={mockStatuses}
      />
    );

    // Open the start date picker
    const startDateTrigger = screen.getByLabelText('Desde');
    fireEvent.click(startDateTrigger);

    // Click a day in the calendar (pick the first available day button with number 15)
    const dayButtons = screen.getAllByRole('gridcell');
    const day15 = dayButtons.find((btn) => btn.textContent === '15');
    expect(day15).toBeTruthy();
    fireEvent.click(day15!.firstChild as Element);

    // Should call onFiltersChange with a date string matching yyyy-MM-dd format
    expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
    expect(mockOnFiltersChange.mock.calls[0][0].start_date).toMatch(
      /^\d{4}-\d{2}-\d{2}$/
    );
  });

  test('clear button appears when filters are applied', () => {
    const { rerender } = render(
      <InternalCalendarFilterBar
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        eventTypes={mockEventTypes}
        statuses={mockStatuses}
      />
    );

    // Initially, no clear button (no filters applied)
    expect(screen.queryByText('Limpiar filtros')).not.toBeInTheDocument();

    // Rerender with filters applied
    rerender(
      <InternalCalendarFilterBar
        filters={{ event_type_id: 1 }}
        onFiltersChange={mockOnFiltersChange}
        eventTypes={mockEventTypes}
        statuses={mockStatuses}
      />
    );

    // Clear button should now be visible
    expect(screen.getByText('Limpiar filtros')).toBeInTheDocument();
  });

  test('clear button calls onFiltersChange with empty object', () => {
    render(
      <InternalCalendarFilterBar
        filters={{
          event_type_id: 1,
          status: 'approved_internal',
          start_date: '2025-12-01',
          end_date: '2025-12-31',
        }}
        onFiltersChange={mockOnFiltersChange}
        eventTypes={mockEventTypes}
        statuses={mockStatuses}
      />
    );

    const clearButton = screen.getByText('Limpiar filtros');

    // Click clear button
    fireEvent.click(clearButton);

    // Should call onFiltersChange with empty object
    expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
    expect(mockOnFiltersChange).toHaveBeenCalledWith({});
  });

  test('has Spanish aria-label', () => {
    render(
      <InternalCalendarFilterBar
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        eventTypes={mockEventTypes}
        statuses={mockStatuses}
      />
    );

    expect(screen.getByRole('region', { name: 'Filtros de eventos' })).toBeInTheDocument();
  });
});
