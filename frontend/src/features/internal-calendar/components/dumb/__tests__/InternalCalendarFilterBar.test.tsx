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

    // Verify all 4 filter inputs
    expect(screen.getByLabelText('Tipo de Evento')).toBeInTheDocument();
    expect(screen.getByLabelText('Estado')).toBeInTheDocument();
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

    const eventTypeSelect = screen.getByLabelText('Tipo de Evento') as HTMLSelectElement;

    // Should be disabled when loading
    expect(eventTypeSelect).toBeDisabled();

    // Should show only default option when loading
    expect(eventTypeSelect.options.length).toBe(1);
    expect(eventTypeSelect.options[0].text).toBe('Todos los tipos');
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

    const eventTypeSelect = screen.getByLabelText('Tipo de Evento') as HTMLSelectElement;

    // Should not be disabled
    expect(eventTypeSelect).not.toBeDisabled();

    // Should have default option + 3 event types
    expect(eventTypeSelect.options.length).toBe(4);
    expect(eventTypeSelect.options[0].text).toBe('Todos los tipos');
    expect(eventTypeSelect.options[1].text).toBe('Conferencia');
    expect(eventTypeSelect.options[2].text).toBe('Taller');
    expect(eventTypeSelect.options[3].text).toBe('Exposición');
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

    const eventTypeSelect = screen.getByLabelText('Tipo de Evento') as HTMLSelectElement;

    // Select event type with id 2 (Taller)
    fireEvent.change(eventTypeSelect, { target: { value: '2' } });

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

    const statusSelect = screen.getByLabelText('Estado') as HTMLSelectElement;

    // Select status 'approved_internal'
    fireEvent.change(statusSelect, { target: { value: 'approved_internal' } });

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

    const statusSelect = screen.getByLabelText('Estado') as HTMLSelectElement;

    // Should have default option + 3 statuses
    expect(statusSelect.options.length).toBe(4);
    expect(statusSelect.options[0].text).toBe('Todos los estados');
    expect(statusSelect.options[1].text).toBe('Aprobado Interno');
    expect(statusSelect.options[2].text).toBe('Pendiente Aprobación Pública');
    expect(statusSelect.options[3].text).toBe('Publicado');
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

    const statusSelect = screen.getByLabelText('Estado') as HTMLSelectElement;
    expect(statusSelect).toBeDisabled();
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

    const startDateInput = screen.getByLabelText('Desde') as HTMLInputElement;
    const endDateInput = screen.getByLabelText('Hasta') as HTMLInputElement;

    // Select start date
    fireEvent.change(startDateInput, { target: { value: '2025-12-01' } });
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      start_date: '2025-12-01',
    });

    // Clear mock
    mockOnFiltersChange.mockClear();

    // Select end date
    fireEvent.change(endDateInput, { target: { value: '2025-12-31' } });
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      end_date: '2025-12-31',
    });

    // Should have been called twice total (once for each date)
    expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
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
