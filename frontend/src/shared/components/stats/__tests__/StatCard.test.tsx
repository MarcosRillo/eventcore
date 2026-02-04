/**
 * Tests for StatCard Component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import StatCard from '@/shared/components/stats/StatCard';

describe('StatCard', () => {
  const mockIcon = <svg data-testid="mock-icon" />;

  const defaultProps = {
    label: 'Total Events',
    value: 100,
    icon: mockIcon,
  };

  describe('rendering', () => {
    it('should render label', () => {
      render(<StatCard {...defaultProps} />);

      expect(screen.getByText('Total Events')).toBeInTheDocument();
    });

    it('should render numeric value', () => {
      render(<StatCard {...defaultProps} />);

      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should render string value', () => {
      render(<StatCard {...defaultProps} value="N/A" />);

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<StatCard {...defaultProps} />);

      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('should format large numbers', () => {
      render(<StatCard {...defaultProps} value={10000} />);

      // Locale-specific formatting
      expect(screen.getByText('10,000')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have white background with border', () => {
      const { container } = render(<StatCard {...defaultProps} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('border-neutral-200');
    });

    it('should use default variant styling', () => {
      const { container } = render(<StatCard {...defaultProps} />);

      const iconContainer = container.querySelector('.bg-neutral-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should use primary variant styling', () => {
      const { container } = render(<StatCard {...defaultProps} variant="primary" />);

      const iconContainer = container.querySelector('.bg-primary-50');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should use success variant styling', () => {
      const { container } = render(<StatCard {...defaultProps} variant="success" />);

      const iconContainer = container.querySelector('.bg-success-50');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should use warning variant styling', () => {
      const { container } = render(<StatCard {...defaultProps} variant="warning" />);

      const iconContainer = container.querySelector('.bg-warning-50');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should use danger variant styling', () => {
      const { container } = render(<StatCard {...defaultProps} variant="danger" />);

      const iconContainer = container.querySelector('.bg-error-50');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should support error as alias for danger', () => {
      const { container } = render(<StatCard {...defaultProps} variant="error" />);

      const iconContainer = container.querySelector('.bg-error-50');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should use info variant styling', () => {
      const { container } = render(<StatCard {...defaultProps} variant="info" />);

      const iconContainer = container.querySelector('.bg-info-50');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('should use sm size', () => {
      const { container } = render(<StatCard {...defaultProps} size="sm" />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');
    });

    it('should use md size by default', () => {
      const { container } = render(<StatCard {...defaultProps} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-5');
    });

    it('should use lg size', () => {
      const { container } = render(<StatCard {...defaultProps} size="lg" />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });
  });

  describe('trend indicator', () => {
    it('should show positive trend with up arrow', () => {
      render(<StatCard {...defaultProps} trend={{ value: 10 }} />);

      expect(screen.getByText('+10%')).toBeInTheDocument();
    });

    it('should show negative trend with down arrow', () => {
      render(<StatCard {...defaultProps} trend={{ value: -5 }} />);

      expect(screen.getByText('-5%')).toBeInTheDocument();
    });

    it('should show trend label when provided', () => {
      render(<StatCard {...defaultProps} trend={{ value: 10, label: 'vs last month' }} />);

      expect(screen.getByText('vs last month')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should be clickable when onClick is provided', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();

      render(<StatCard {...defaultProps} onClick={onClick} />);

      const card = screen.getByRole('button');
      await user.click(card);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should have hover styles when clickable', () => {
      render(<StatCard {...defaultProps} onClick={() => {}} />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('cursor-pointer');
      expect(card).toHaveClass('hover:border-neutral-300');
    });

    it('should be keyboard accessible when clickable', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();

      render(<StatCard {...defaultProps} onClick={onClick} />);

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should render as div when not clickable', () => {
      const { container } = render(<StatCard {...defaultProps} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect((container.firstChild as HTMLElement).tagName).toBe('DIV');
    });
  });

  describe('accessibility', () => {
    it('should have aria-label when clickable', () => {
      render(<StatCard {...defaultProps} onClick={() => {}} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'Ver detalles de Total Events');
    });

    it('should use tabular-nums for numeric values', () => {
      render(<StatCard {...defaultProps} />);

      const valueEl = screen.getByText('100');
      expect(valueEl).toHaveClass('tabular-nums');
    });
  });
});
