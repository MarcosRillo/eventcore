/**
 * Tests for ApprovalHistoryTimeline component
 *
 * Tests the timeline display of approval history.
 */

import { fireEvent,render, screen } from '@testing-library/react';

import { ApprovalHistoryTimeline } from '@/features/entity-admin/components/dumb/ApprovalHistoryTimeline';
import type { ApprovalHistoryEntry } from '@/types/event.types';

describe('ApprovalHistoryTimeline', () => {
  const mockHistory: ApprovalHistoryEntry[] = [
    {
      action: 'approve_internal',
      user_id: 1,
      comment: 'Aprobado para calendario interno',
      timestamp: '2025-03-10T14:30:00',
    },
    {
      action: 'request_changes',
      user_id: 2,
      comment: 'Faltan detalles de ubicación',
      timestamp: '2025-03-08T10:00:00',
    },
  ];

  test('renders history entries when expanded', () => {
    render(<ApprovalHistoryTimeline history={mockHistory} isExpanded={true} />);

    expect(screen.getByText(/Aprobado para calendario interno/)).toBeInTheDocument();
    expect(screen.getByText(/Faltan detalles de ubicación/)).toBeInTheDocument();
  });

  test('renders collapsible header with count', () => {
    render(<ApprovalHistoryTimeline history={mockHistory} />);

    expect(screen.getByText(/Historial de Aprobación/)).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  test('toggles expansion when clicked', () => {
    render(<ApprovalHistoryTimeline history={mockHistory} />);

    const toggle = screen.getByRole('button');

    // Initially collapsed
    expect(screen.queryByText(/Aprobado para calendario interno/)).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(toggle);
    expect(screen.getByText(/Aprobado para calendario interno/)).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(toggle);
    expect(screen.queryByText(/Aprobado para calendario interno/)).not.toBeInTheDocument();
  });

  test('displays formatted timestamps', () => {
    render(<ApprovalHistoryTimeline history={mockHistory} isExpanded={true} />);

    // Should show dates in Spanish format (marzo = March)
    expect(screen.getAllByText(/marzo/i).length).toBeGreaterThan(0);
    // Timestamps should be rendered
    const timestamps = screen.getAllByText(/\d{1,2}.*marzo.*2025/i);
    expect(timestamps.length).toBeGreaterThan(0);
  });

  test('shows empty state when no history', () => {
    render(<ApprovalHistoryTimeline history={[]} />);

    expect(screen.getByText(/Sin historial/)).toBeInTheDocument();
  });

  test('renders action labels correctly', () => {
    render(<ApprovalHistoryTimeline history={mockHistory} isExpanded={true} />);

    expect(screen.getByText(/Aprobación Interna/)).toBeInTheDocument();
    expect(screen.getByText(/Cambios Solicitados/)).toBeInTheDocument();
  });
});
