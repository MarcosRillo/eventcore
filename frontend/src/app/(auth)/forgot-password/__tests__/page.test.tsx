/**
 * Forgot Password Page Tests
 * Tests for rendering, interactions, success state, and error handling
 */
import { render, screen, fireEvent } from '@testing-library/react';
import ForgotPasswordPage from '../page';
import { useForgotPassword } from '@/features/auth';

// Mock dependencies
jest.mock('@/features/auth', () => ({
  useForgotPassword: jest.fn(),
}));

const mockUseForgotPassword = useForgotPassword as jest.MockedFunction<typeof useForgotPassword>;

// Helper to create default mock
const createMockForgotPassword = (overrides = {}) => ({
  email: '',
  setEmail: jest.fn(),
  isLoading: false,
  error: null,
  success: false,
  isValid: false,
  handleSubmit: jest.fn((e) => e?.preventDefault()),
  reset: jest.fn(),
  ...overrides,
});

// Helper to get email input
const getEmailInput = () => screen.getByPlaceholderText('tu@ejemplo.com');

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseForgotPassword.mockReturnValue(createMockForgotPassword());
  });

  describe('rendering', () => {
    it('should render forgot password form with all elements', () => {
      render(<ForgotPasswordPage />);

      expect(screen.getByText('Recuperar contraseña')).toBeInTheDocument();
      expect(screen.getByText(/Ingresa tu email/)).toBeInTheDocument();
      expect(screen.getByText('Correo electrónico')).toBeInTheDocument();
      expect(getEmailInput()).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
    });

    it('should render email input with correct attributes', () => {
      render(<ForgotPasswordPage />);

      const emailInput = getEmailInput();

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
    });

    it('should render back to login link', () => {
      render(<ForgotPasswordPage />);

      const backLink = screen.getByText(/Volver a iniciar sesión/);
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/login');
    });
  });

  describe('success state', () => {
    it('should show success message after submission', () => {
      mockUseForgotPassword.mockReturnValue(createMockForgotPassword({
        success: true,
        email: 'test@example.com',
      }));

      render(<ForgotPasswordPage />);

      expect(screen.getByText('Revisa tu correo')).toBeInTheDocument();
      expect(screen.queryByText('Recuperar contraseña')).not.toBeInTheDocument();
    });

    it('should show email sent confirmation with user email', () => {
      mockUseForgotPassword.mockReturnValue(createMockForgotPassword({
        success: true,
        email: 'test@example.com',
      }));

      render(<ForgotPasswordPage />);

      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/Hemos enviado las instrucciones/)).toBeInTheDocument();
    });

    it('should show expiration info and back to login button', () => {
      mockUseForgotPassword.mockReturnValue(createMockForgotPassword({
        success: true,
        email: 'test@example.com',
      }));

      render(<ForgotPasswordPage />);

      expect(screen.getByText(/expirará en 60 minutos/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Volver a iniciar sesión/i })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call setEmail when email changes', () => {
      const mockSetEmail = jest.fn();
      mockUseForgotPassword.mockReturnValue(createMockForgotPassword({
        setEmail: mockSetEmail,
      }));

      render(<ForgotPasswordPage />);

      const emailInput = getEmailInput();
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(mockSetEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should disable submit button when form is invalid', () => {
      mockUseForgotPassword.mockReturnValue(createMockForgotPassword({ isValid: false }));

      render(<ForgotPasswordPage />);

      const submitButton = screen.getByRole('button', { name: /enviar enlace/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid', () => {
      mockUseForgotPassword.mockReturnValue(createMockForgotPassword({
        isValid: true,
        email: 'test@example.com',
      }));

      render(<ForgotPasswordPage />);

      const submitButton = screen.getByRole('button', { name: /enviar enlace/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should call handleSubmit when form is submitted', () => {
      const mockHandleSubmit = jest.fn((e) => e?.preventDefault());
      mockUseForgotPassword.mockReturnValue(createMockForgotPassword({
        isValid: true,
        handleSubmit: mockHandleSubmit,
      }));

      render(<ForgotPasswordPage />);

      const form = screen.getByRole('button', { name: /enviar enlace/i }).closest('form');
      fireEvent.submit(form!);

      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should disable email input when loading', () => {
      mockUseForgotPassword.mockReturnValue(createMockForgotPassword({ isLoading: true }));

      render(<ForgotPasswordPage />);

      const emailInput = getEmailInput();
      expect(emailInput).toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      mockUseForgotPassword.mockReturnValue(createMockForgotPassword({
        isLoading: true,
        isValid: true,
      }));

      render(<ForgotPasswordPage />);

      const submitButton = screen.getByRole('button', { name: /enviar enlace/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('error handling', () => {
    it('should display validation error', () => {
      mockUseForgotPassword.mockReturnValue(createMockForgotPassword({
        error: 'Por favor ingresa un email válido',
      }));

      render(<ForgotPasswordPage />);

      expect(screen.getByText('Por favor ingresa un email válido')).toBeInTheDocument();
    });

    it('should display network error', () => {
      mockUseForgotPassword.mockReturnValue(createMockForgotPassword({
        error: 'Error de conexión. Por favor intenta de nuevo.',
      }));

      render(<ForgotPasswordPage />);

      expect(screen.getByText('Error de conexión. Por favor intenta de nuevo.')).toBeInTheDocument();
    });

    it('should not display error when no error exists', () => {
      mockUseForgotPassword.mockReturnValue(createMockForgotPassword({ error: null }));

      render(<ForgotPasswordPage />);

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });
});
