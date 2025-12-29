/**
 * Tests for AdminStatsGrid component
 *
 * Tests the dumb component that displays approval statistics in a grid.
 * Following TDD: RED phase.
 */

import { render, screen, fireEvent } from '@testing-library/react';

import { AdminStatsGrid } from '@/features/entity-admin/components/dumb/AdminStatsGrid';
import type { AdminStatCardData } from '@/features/entity-admin/types';

describe('AdminStatsGrid', () => {
  const mockCardData: AdminStatCardData[] = [
    { key: 'pending_internal', label: 'Pend. Interno', value: 15, color: 'warning', statusFilter: 'pending_internal_approval' },
    { key: 'pending_public', label: 'Pend. Público', value: 8, color: 'warning', statusFilter: 'pending_public_approval' },
    { key: 'published', label: 'Publicados', value: 45, color: 'success', statusFilter: 'published' },
    { key: 'requires_changes', label: 'Req. Cambios', value: 5, color: 'error', statusFilter: 'requires_changes' },
  ];

  test('renders all stat cards', () => {
    render(<AdminStatsGrid cardData={mockCardData} />);

    expect(screen.getByText('Pend. Interno')).toBeInTheDocument();
    expect(screen.getByText('Pend. Público')).toBeInTheDocument();
    expect(screen.getByText('Publicados')).toBeInTheDocument();
    expect(screen.getByText('Req. Cambios')).toBeInTheDocument();
  });

  test('displays correct values for each card', () => {
    render(<AdminStatsGrid cardData={mockCardData} />);

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('renders with correct semantic colors', () => {
    const { container } = render(<AdminStatsGrid cardData={mockCardData} />);

    // Check for warning color class on pending cards
    const warningCards = container.querySelectorAll('[class*="warning"]');
    expect(warningCards.length).toBeGreaterThan(0);

    // Check for success color class on published card
    const successCards = container.querySelectorAll('[class*="success"]');
    expect(successCards.length).toBeGreaterThan(0);

    // Check for error color class on requires_changes card
    const errorCards = container.querySelectorAll('[class*="error"]');
    expect(errorCards.length).toBeGreaterThan(0);
  });

  test('calls onStatClick when a card is clicked', () => {
    const onStatClick = jest.fn();
    render(<AdminStatsGrid cardData={mockCardData} onStatClick={onStatClick} />);

    const pendingCard = screen.getByText('Pend. Interno').closest('button');
    fireEvent.click(pendingCard!);

    expect(onStatClick).toHaveBeenCalledWith('pending_internal_approval');
  });

  test('renders as non-interactive when onStatClick is not provided', () => {
    const { container } = render(<AdminStatsGrid cardData={mockCardData} />);

    // Cards should be divs, not buttons
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });

  test('shows loading state', () => {
    render(<AdminStatsGrid cardData={[]} isLoading={true} />);

    expect(screen.getByText('Cargando estadísticas...')).toBeInTheDocument();
  });

  test('handles empty card data', () => {
    render(<AdminStatsGrid cardData={[]} />);

    expect(screen.queryByText('Pend. Interno')).not.toBeInTheDocument();
  });

  test('applies correct grid layout classes', () => {
    const { container } = render(<AdminStatsGrid cardData={mockCardData} />);

    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('md:grid-cols-3');
    expect(grid).toHaveClass('lg:grid-cols-6');
  });
});
