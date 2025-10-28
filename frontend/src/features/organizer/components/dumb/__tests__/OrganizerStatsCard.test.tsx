import { render, screen } from '@testing-library/react';
import { OrganizerStatsCard } from '@/features/organizer/components/dumb/OrganizerStatsCard';
import { StatCardData } from '@/features/organizer/types/organizerStats.types';

describe('OrganizerStatsCard', () => {
  const mockStats: StatCardData[] = [
    { label: 'Pendiente Interno', value: 2, color: 'yellow' },
    { label: 'Aprobado Interno', value: 3, color: 'blue' },
    { label: 'Pendiente Público', value: 1, color: 'orange' },
    { label: 'Publicado', value: 4, color: 'green' },
    { label: 'Requiere Cambios', value: 1, color: 'orange' },
    { label: 'Rechazado', value: 0, color: 'red' },
  ];

  test('should render total events correctly', () => {
    render(<OrganizerStatsCard stats={mockStats} totalEvents={11} />);

    expect(screen.getByText('Mis Eventos')).toBeInTheDocument();
    expect(screen.getByText(/11/)).toBeInTheDocument();
  });

  test('should render all stat cards', () => {
    render(<OrganizerStatsCard stats={mockStats} totalEvents={11} />);

    expect(screen.getByText('Pendiente Interno')).toBeInTheDocument();
    expect(screen.getByText('Aprobado Interno')).toBeInTheDocument();
    expect(screen.getByText('Pendiente Público')).toBeInTheDocument();
    expect(screen.getByText('Publicado')).toBeInTheDocument();
    expect(screen.getByText('Requiere Cambios')).toBeInTheDocument();
    expect(screen.getByText('Rechazado')).toBeInTheDocument();
  });

  test('should display correct values for each stat', () => {
    render(<OrganizerStatsCard stats={mockStats} totalEvents={11} />);

    expect(screen.getByText('2')).toBeInTheDocument(); // pending_internal
    expect(screen.getByText('3')).toBeInTheDocument(); // approved_internal
    expect(screen.getAllByText('1')).toHaveLength(2); // pending_public and requires_changes
    expect(screen.getByText('4')).toBeInTheDocument(); // published
    expect(screen.getByText('0')).toBeInTheDocument(); // rejected
  });

  test('should render with empty stats', () => {
    render(<OrganizerStatsCard stats={[]} totalEvents={0} />);

    expect(screen.getByText('Mis Eventos')).toBeInTheDocument();
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});
