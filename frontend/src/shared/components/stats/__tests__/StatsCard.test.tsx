/**
 * Tests for StatsCard Component
 */

import { render, screen } from '@testing-library/react';

import { StatsCard } from '@/shared/components/stats/StatsCard';

describe('StatsCard', () => {
  const mockIcon = <svg data-testid="mock-icon" />;

  const defaultProps = {
    label: 'Total Events',
    value: 100,
    icon: mockIcon,
  };

  describe('rendering', () => {
    it('should render label', () => {
      render(<StatsCard {...defaultProps} />);

      expect(screen.getByText('Total Events')).toBeInTheDocument();
    });

    it('should render numeric value', () => {
      render(<StatsCard {...defaultProps} />);

      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should render string value', () => {
      render(<StatsCard {...defaultProps} value="N/A" />);

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<StatsCard {...defaultProps} />);

      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('should use testId when provided', () => {
      render(<StatsCard {...defaultProps} testId="stat-total" />);

      expect(screen.getByTestId('stat-total')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have white background with shadow', () => {
      render(<StatsCard {...defaultProps} testId="stat-card" />);

      const card = screen.getByTestId('stat-card');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('shadow-sm');
    });

    it('should use primary color by default', () => {
      const { container } = render(<StatsCard {...defaultProps} />);

      const iconContainer = container.querySelector('.bg-primary-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should use success color when specified', () => {
      const { container } = render(<StatsCard {...defaultProps} color="success" />);

      const iconContainer = container.querySelector('.bg-success-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should use warning color when specified', () => {
      const { container } = render(<StatsCard {...defaultProps} color="warning" />);

      const iconContainer = container.querySelector('.bg-warning-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should use error color when specified', () => {
      const { container } = render(<StatsCard {...defaultProps} color="error" />);

      const iconContainer = container.querySelector('.bg-error-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should style label correctly', () => {
      render(<StatsCard {...defaultProps} />);

      const label = screen.getByText('Total Events');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('text-neutral-500');
    });

    it('should style value correctly', () => {
      render(<StatsCard {...defaultProps} />);

      const value = screen.getByText('100');
      expect(value).toHaveClass('text-2xl');
      expect(value).toHaveClass('text-neutral-900');
    });
  });
});
