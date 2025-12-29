import { render, screen } from '@testing-library/react';

import { EventStatusBadge } from '@/features/internal-calendar/components/dumb/EventStatusBadge';

describe('EventStatusBadge', () => {
  test('should render approved_internal status correctly', () => {
    render(<EventStatusBadge statusCode="approved_internal" />);

    const badge = screen.getByText('Aprobado Interno');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');
  });

  test('should render pending_public_approval status correctly', () => {
    render(<EventStatusBadge statusCode="pending_public_approval" />);

    const badge = screen.getByText('Pendiente Aprobación Pública');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100');
    expect(badge).toHaveClass('text-yellow-800');
  });

  test('should render published status correctly', () => {
    render(<EventStatusBadge statusCode="published" />);

    const badge = screen.getByText('Publicado');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  test('should render unknown status with default styling', () => {
    render(<EventStatusBadge statusCode="unknown_status" />);

    const badge = screen.getByText('unknown_status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-800');
  });
});
