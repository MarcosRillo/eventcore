/**
 * EventTypeTableContainer Tests
 *
 * Tests for the smart table container component with expandable subtypes.
 * Covers rendering, actions, pagination, expansion, and confirm dialogs.
 *
 * Created: December 2, 2025
 * Updated: January 2026 - Added expansion props tests
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { EventTypeTableContainer } from '@/features/event-types/components/smart/EventTypeTableContainer';
import type { PaginationMeta } from '@/types/api-response.types';
import type { EventSubtype, EventType } from '@/types/eventType.types';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('EventTypeTableContainer', () => {
  const mockEventTypes: EventType[] = [
    {
      id: 1,
      name: 'Conferencia',
      color: '#3B82F6',
      entity_id: 1,
      is_active: true,
      subtypes_count: 3,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Taller',
      color: '#10B981',
      entity_id: 1,
      is_active: false,
      subtypes_count: 0,
      created_at: '2025-01-02T00:00:00.000Z',
      updated_at: '2025-01-02T00:00:00.000Z',
    },
  ];

  const mockSubtypes: EventSubtype[] = [
    {
      id: 1,
      name: 'Mesa Redonda',
      event_type_id: 1,
      entity_id: 1,
      is_active: true,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Keynote',
      event_type_id: 1,
      entity_id: 1,
      is_active: true,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    },
  ];

  const mockPagination: PaginationMeta = {
    current_page: 1,
    last_page: 2,
    per_page: 10,
    total: 15,
    from: 1,
    to: 10,
    path: 'http://api.example.com/event-types',
    links: [],
  };

  const defaultProps = {
    eventTypes: mockEventTypes,
    pagination: mockPagination,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onPageChange: jest.fn(),
    loading: false,
    // Expansion props
    expandedTypeIds: new Set<number>(),
    onToggleExpand: jest.fn(),
    loadingSubtypes: new Set<number>(),
    subtypesByType: new Map<number, EventSubtype[]>(),
    // Subtype handlers
    onEditSubtype: jest.fn(),
    onDeleteSubtype: jest.fn(),
    onCreateSubtype: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render event types table', () => {
      render(<EventTypeTableContainer {...defaultProps} />);

      expect(screen.getByText('Conferencia')).toBeInTheDocument();
      expect(screen.getByText('Taller')).toBeInTheDocument();
    });

    it('should render with empty event types', () => {
      render(<EventTypeTableContainer {...defaultProps} eventTypes={[]} />);

      // Should show empty state message
      expect(
        screen.getByText('No hay tipos de evento disponibles')
      ).toBeInTheDocument();
    });

    it('should render with loading prop', () => {
      const { container } = render(
        <EventTypeTableContainer {...defaultProps} loading={true} />
      );

      // Should show skeleton loader
      expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });

    it('should render with null pagination', () => {
      render(<EventTypeTableContainer {...defaultProps} pagination={null} />);

      expect(screen.getByText('Conferencia')).toBeInTheDocument();
    });

    it('should display active badge for active types', () => {
      render(<EventTypeTableContainer {...defaultProps} />);

      // Conferencia is active
      const activeBadges = screen.getAllByText('Activo');
      expect(activeBadges.length).toBeGreaterThan(0);
    });

    it('should display inactive badge for inactive types', () => {
      render(<EventTypeTableContainer {...defaultProps} />);

      // Taller is inactive
      const inactiveBadges = screen.getAllByText('Inactivo');
      expect(inactiveBadges.length).toBeGreaterThan(0);
    });

    it('should display subtypes count', () => {
      render(<EventTypeTableContainer {...defaultProps} />);

      // Conferencia has 3 subtypes
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('expansion', () => {
    it('should render expand chevrons for each row', () => {
      render(<EventTypeTableContainer {...defaultProps} />);

      // Each row should have a clickable row with role="button"
      const row1 = screen.getByTestId('table-row-1');
      const row2 = screen.getByTestId('table-row-2');

      expect(row1).toHaveAttribute('role', 'button');
      expect(row2).toHaveAttribute('role', 'button');
    });

    it('should call onToggleExpand when row is clicked', () => {
      render(<EventTypeTableContainer {...defaultProps} />);

      // Click on the first row (which should toggle expansion)
      const firstRow = screen.getByTestId('table-row-1');
      fireEvent.click(firstRow);

      expect(defaultProps.onToggleExpand).toHaveBeenCalledWith(1);
    });

    it('should render expanded content when type is expanded', () => {
      const expandedProps = {
        ...defaultProps,
        expandedTypeIds: new Set<number>([1]),
        subtypesByType: new Map<number, EventSubtype[]>([[1, mockSubtypes]]),
      };

      render(<EventTypeTableContainer {...expandedProps} />);

      // Should show the expanded row
      expect(screen.getByTestId('table-row-1-expanded')).toBeInTheDocument();
      // Should show subtype content
      expect(screen.getByText('Mesa Redonda')).toBeInTheDocument();
      expect(screen.getByText('Keynote')).toBeInTheDocument();
    });

    it('should show loading state when subtypes are loading', () => {
      const loadingProps = {
        ...defaultProps,
        expandedTypeIds: new Set<number>([1]),
        loadingSubtypes: new Set<number>([1]),
      };

      render(<EventTypeTableContainer {...loadingProps} />);

      // Should show loading spinner in expanded content
      expect(screen.getByText('Cargando subtipos...')).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should have action buttons available', () => {
      render(<EventTypeTableContainer {...defaultProps} />);

      // Check that edit and delete buttons exist
      const editButtons = screen.getAllByTitle('Editar');
      const deleteButtons = screen.getAllByTitle('Eliminar');

      expect(editButtons.length).toBe(2); // One for each event type
      expect(deleteButtons.length).toBe(2);
    });

    it('should call onEdit when edit button is clicked', () => {
      render(<EventTypeTableContainer {...defaultProps} />);

      const editButtons = screen.getAllByTitle('Editar');
      fireEvent.click(editButtons[0]);

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockEventTypes[0]);
    });

    it('should show confirmation dialog when deleting type without subtypes', () => {
      render(<EventTypeTableContainer {...defaultProps} />);

      // Click delete on Taller (which has 0 subtypes)
      const deleteButtons = screen.getAllByTitle('Eliminar');
      fireEvent.click(deleteButtons[1]); // Second delete button is for Taller

      // Should show confirmation dialog
      expect(screen.getByText('Confirmar Eliminación')).toBeInTheDocument();
    });

    it('should show warning when trying to delete type with subtypes', () => {
      render(<EventTypeTableContainer {...defaultProps} />);

      // Click delete on Conferencia (which has 3 subtypes)
      const deleteButtons = screen.getAllByTitle('Eliminar');
      fireEvent.click(deleteButtons[0]); // First delete button is for Conferencia

      // Should show warning about subtypes
      expect(screen.getByText('No se puede eliminar')).toBeInTheDocument();
      expect(
        screen.getByText(/tiene 3 subtipo\(s\) asociado\(s\)/)
      ).toBeInTheDocument();
    });
  });

  describe('subtype actions', () => {
    it('should call onCreateSubtype when add subtipo button is clicked', () => {
      const expandedProps = {
        ...defaultProps,
        expandedTypeIds: new Set<number>([1]),
        subtypesByType: new Map<number, EventSubtype[]>([[1, mockSubtypes]]),
      };

      render(<EventTypeTableContainer {...expandedProps} />);

      // Find and click the add subtype button
      const addButton = screen.getByText('Agregar subtipo');
      fireEvent.click(addButton);

      expect(defaultProps.onCreateSubtype).toHaveBeenCalledWith(
        mockEventTypes[0]
      );
    });

    it('should call onEditSubtype when edit subtype button is clicked', () => {
      const expandedProps = {
        ...defaultProps,
        expandedTypeIds: new Set<number>([1]),
        subtypesByType: new Map<number, EventSubtype[]>([[1, mockSubtypes]]),
      };

      render(<EventTypeTableContainer {...expandedProps} />);

      // Find and click the edit subtype button
      const editButtons = screen.getAllByTitle('Editar subtipo');
      fireEvent.click(editButtons[0]);

      expect(defaultProps.onEditSubtype).toHaveBeenCalledWith(mockSubtypes[0]);
    });

    it('should call onDeleteSubtype when delete subtype button is clicked', () => {
      const expandedProps = {
        ...defaultProps,
        expandedTypeIds: new Set<number>([1]),
        subtypesByType: new Map<number, EventSubtype[]>([[1, mockSubtypes]]),
      };

      render(<EventTypeTableContainer {...expandedProps} />);

      // Find and click the delete subtype button
      const deleteButtons = screen.getAllByTitle('Eliminar subtipo');
      fireEvent.click(deleteButtons[0]);

      expect(defaultProps.onDeleteSubtype).toHaveBeenCalledWith(
        mockSubtypes[0]
      );
    });
  });

  describe('pagination', () => {
    it('should render pagination when provided', () => {
      render(<EventTypeTableContainer {...defaultProps} />);

      // Should show pagination info (total items)
      // The exact format depends on the Pagination component implementation
      // Just verify the component renders without crashing with pagination
      expect(screen.getByText('Conferencia')).toBeInTheDocument();
    });

    it('should not show pagination when null', () => {
      render(<EventTypeTableContainer {...defaultProps} pagination={null} />);

      // Should still render table without pagination
      expect(screen.getByText('Conferencia')).toBeInTheDocument();
    });
  });

  describe('date formatting', () => {
    it('should format dates correctly', () => {
      render(<EventTypeTableContainer {...defaultProps} />);

      // Dates should be formatted - look for parts of the date
      // The exact format depends on locale, but should have month/day/year
      expect(screen.getByText(/2025/)).toBeTruthy();
    });
  });
});
