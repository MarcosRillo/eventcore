/**
 * Tests for AdminQuickFilters component
 *
 * Tests the quick filter tabs for the event table.
 */

import { render, screen, fireEvent } from '@testing-library/react';

import { AdminQuickFilters } from '@/features/entity-admin/components/dumb/AdminQuickFilters';

describe('AdminQuickFilters', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all filter options', () => {
    render(<AdminQuickFilters activeFilter={null} onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Pend. Interno')).toBeInTheDocument();
    expect(screen.getByText('Pend. Público')).toBeInTheDocument();
    expect(screen.getByText('Publicados')).toBeInTheDocument();
    expect(screen.getByText('Req. Cambios')).toBeInTheDocument();
  });

  test('highlights active filter', () => {
    render(
      <AdminQuickFilters
        activeFilter="pending_internal_approval"
        onFilterChange={mockOnFilterChange}
      />
    );

    const activeButton = screen.getByText('Pend. Interno').closest('button');
    expect(activeButton).toHaveClass('bg-primary-600');
  });

  test('calls onFilterChange when filter is clicked', () => {
    render(<AdminQuickFilters activeFilter={null} onFilterChange={mockOnFilterChange} />);

    fireEvent.click(screen.getByText('Publicados'));

    expect(mockOnFilterChange).toHaveBeenCalledWith('published');
  });

  test('calls onFilterChange with null when "Todos" is clicked', () => {
    render(
      <AdminQuickFilters
        activeFilter="published"
        onFilterChange={mockOnFilterChange}
      />
    );

    fireEvent.click(screen.getByText('Todos'));

    expect(mockOnFilterChange).toHaveBeenCalledWith(null);
  });

  test('displays counts when provided', () => {
    const counts: Record<string, number> = {
      all: 100,
      pending_internal_approval: 15,
      published: 45,
    };

    render(
      <AdminQuickFilters
        activeFilter={null}
        onFilterChange={mockOnFilterChange}
        counts={counts}
      />
    );

    expect(screen.getByText('(100)')).toBeInTheDocument();
    expect(screen.getByText('(15)')).toBeInTheDocument();
    expect(screen.getByText('(45)')).toBeInTheDocument();
  });
});
