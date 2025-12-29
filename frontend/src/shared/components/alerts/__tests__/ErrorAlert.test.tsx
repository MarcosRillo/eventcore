/**
 * Tests for ErrorAlert Component
 */

import { render, screen, fireEvent } from '@testing-library/react';

import { ErrorAlert } from '@/shared/components/alerts/ErrorAlert';

describe('ErrorAlert', () => {
  const defaultProps = {
    message: 'Something went wrong',
  };

  describe('rendering', () => {
    it('should render error message', () => {
      render(<ErrorAlert {...defaultProps} />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render default title "Error"', () => {
      render(<ErrorAlert {...defaultProps} />);

      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(<ErrorAlert {...defaultProps} title="Error de conexión" />);

      expect(screen.getByText('Error de conexión')).toBeInTheDocument();
    });

    it('should render details when provided', () => {
      render(
        <ErrorAlert
          {...defaultProps}
          details="Please check your internet connection"
        />
      );

      expect(screen.getByText('Please check your internet connection')).toBeInTheDocument();
    });

    it('should not render details when not provided', () => {
      render(<ErrorAlert {...defaultProps} />);

      // Only the main message should be present, not details
      expect(screen.queryByText(/Please check/)).not.toBeInTheDocument();
    });

    it('should have role="alert" for accessibility', () => {
      render(<ErrorAlert {...defaultProps} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should use default testId', () => {
      render(<ErrorAlert {...defaultProps} />);

      expect(screen.getByTestId('error-alert')).toBeInTheDocument();
    });

    it('should use custom testId', () => {
      render(<ErrorAlert {...defaultProps} testId="custom-error" />);

      expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    });
  });

  describe('dismiss functionality', () => {
    it('should render dismiss button when onDismiss is provided', () => {
      const onDismiss = jest.fn();
      render(<ErrorAlert {...defaultProps} onDismiss={onDismiss} />);

      expect(screen.getByLabelText('Cerrar')).toBeInTheDocument();
    });

    it('should not render dismiss button when onDismiss is not provided', () => {
      render(<ErrorAlert {...defaultProps} />);

      expect(screen.queryByLabelText('Cerrar')).not.toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      const onDismiss = jest.fn();
      render(<ErrorAlert {...defaultProps} onDismiss={onDismiss} />);

      fireEvent.click(screen.getByLabelText('Cerrar'));

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('retry functionality', () => {
    it('should render retry button when onRetry is provided', () => {
      const onRetry = jest.fn();
      render(<ErrorAlert {...defaultProps} onRetry={onRetry} />);

      expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
    });

    it('should not render retry button when onRetry is not provided', () => {
      render(<ErrorAlert {...defaultProps} />);

      expect(screen.queryByText('Intentar de nuevo')).not.toBeInTheDocument();
    });

    it('should render custom retry text', () => {
      const onRetry = jest.fn();
      render(
        <ErrorAlert {...defaultProps} onRetry={onRetry} retryText="Reintentar" />
      );

      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const onRetry = jest.fn();
      render(<ErrorAlert {...defaultProps} onRetry={onRetry} />);

      fireEvent.click(screen.getByText('Intentar de nuevo'));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('styling', () => {
    it('should use semantic error color tokens', () => {
      render(<ErrorAlert {...defaultProps} />);

      const alert = screen.getByTestId('error-alert');
      expect(alert).toHaveClass('bg-error-50');
      expect(alert).toHaveClass('border-error-200');
    });

    it('should have error-styled title', () => {
      render(<ErrorAlert {...defaultProps} />);

      const title = screen.getByText('Error');
      expect(title).toHaveClass('text-error-800');
    });

    it('should have error-styled message', () => {
      render(<ErrorAlert {...defaultProps} />);

      const message = screen.getByText('Something went wrong');
      expect(message.closest('div')).toHaveClass('text-error-700');
    });
  });

  describe('complete usage', () => {
    it('should render all features together', () => {
      const onDismiss = jest.fn();
      const onRetry = jest.fn();

      render(
        <ErrorAlert
          message="Failed to load data"
          title="Network Error"
          details="Check your connection"
          onDismiss={onDismiss}
          onRetry={onRetry}
          retryText="Try again"
        />
      );

      expect(screen.getByText('Network Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
      expect(screen.getByText('Check your connection')).toBeInTheDocument();
      expect(screen.getByLabelText('Cerrar')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
  });
});
