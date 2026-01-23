/**
 * Reset Password Page Tests
 * Tests for token validation, form rendering, success state, and error handling
 */
import { fireEvent,render, screen } from '@testing-library/react';

import { useResetPassword } from '@/features/auth';

import ResetPasswordPage from '../page';

// Mock dependencies
jest.mock('@/features/auth', () => ({
  useResetPassword: jest.fn(),
}));

const mockUseResetPassword = useResetPassword as jest.MockedFunction<typeof useResetPassword>;

// Helper to create default mock
const createMockResetPassword = (overrides = {}) => ({
  password: '',
  confirmPassword: '',
  setPassword: jest.fn(),
  setConfirmPassword: jest.fn(),
  isLoading: false,
  isValidating: false,
  error: null,
  fieldErrors: {},
  success: false,
  tokenValid: true,
  isValid: false,
  passwordRequirements: [
    { label: 'Mínimo 8 caracteres', met: false },
    { label: 'Al menos una mayúscula', met: false },
    { label: 'Al menos una minúscula', met: false },
    { label: 'Al menos un número', met: false },
  ],
  handleSubmit: jest.fn((e) => e?.preventDefault()),
  reset: jest.fn(),
  ...overrides,
});

// Helpers to get inputs
const getPasswordInput = () => screen.getByPlaceholderText('Tu nueva contraseña');
const getConfirmInput = () => screen.getByPlaceholderText('Repite tu contraseña');

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseResetPassword.mockReturnValue(createMockResetPassword());
  });

  describe('token validation', () => {
    it('should show loading while validating token', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        isValidating: true,
      }));

      render(<ResetPasswordPage />);

      expect(screen.getByText('Validando enlace...')).toBeInTheDocument();
      expect(screen.queryByText('Nueva contraseña')).not.toBeInTheDocument();
    });

    it('should show error for invalid token', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        tokenValid: false,
        error: 'El token ha expirado',
      }));

      render(<ResetPasswordPage />);

      expect(screen.getByText('Enlace inválido')).toBeInTheDocument();
      expect(screen.getByText(/expirado o ya fue utilizado/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Solicitar nuevo enlace/i })).toBeInTheDocument();
    });

    it('should show form for valid token', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        tokenValid: true,
        isValidating: false,
      }));

      render(<ResetPasswordPage />);

      expect(screen.getByRole('heading', { name: 'Nueva contraseña' })).toBeInTheDocument();
      expect(getPasswordInput()).toBeInTheDocument();
      expect(getConfirmInput()).toBeInTheDocument();
    });
  });

  describe('form rendering', () => {
    it('should render password inputs with correct attributes', () => {
      render(<ResetPasswordPage />);

      const passwordInput = getPasswordInput();
      const confirmInput = getConfirmInput();

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(confirmInput).toHaveAttribute('type', 'password');
      expect(confirmInput).toHaveAttribute('name', 'confirmPassword');
    });

    it('should show password requirements', () => {
      render(<ResetPasswordPage />);

      expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
      expect(screen.getByText('Al menos una mayúscula')).toBeInTheDocument();
      expect(screen.getByText('Al menos una minúscula')).toBeInTheDocument();
      expect(screen.getByText('Al menos un número')).toBeInTheDocument();
    });

    it('should show met requirements with green styling', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        passwordRequirements: [
          { label: 'Mínimo 8 caracteres', met: true },
          { label: 'Al menos una mayúscula', met: true },
          { label: 'Al menos una minúscula', met: false },
          { label: 'Al menos un número', met: false },
        ],
      }));

      render(<ResetPasswordPage />);

      const metReq = screen.getByText('Mínimo 8 caracteres');
      expect(metReq).toHaveClass('text-success-600');
    });
  });

  describe('interactions', () => {
    it('should call setPassword when password changes', () => {
      const mockSetPassword = jest.fn();
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        setPassword: mockSetPassword,
      }));

      render(<ResetPasswordPage />);

      const passwordInput = getPasswordInput();
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });

      expect(mockSetPassword).toHaveBeenCalledWith('NewPassword123');
    });

    it('should call setConfirmPassword when confirm password changes', () => {
      const mockSetConfirmPassword = jest.fn();
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        setConfirmPassword: mockSetConfirmPassword,
      }));

      render(<ResetPasswordPage />);

      const confirmInput = getConfirmInput();
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });

      expect(mockSetConfirmPassword).toHaveBeenCalledWith('NewPassword123');
    });

    it('should disable submit button when form is invalid', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        isValid: false,
      }));

      render(<ResetPasswordPage />);

      const submitButton = screen.getByRole('button', { name: /restablecer contraseña/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        isValid: true,
      }));

      render(<ResetPasswordPage />);

      const submitButton = screen.getByRole('button', { name: /restablecer contraseña/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should call handleSubmit when form is submitted', () => {
      const mockHandleSubmit = jest.fn((e) => e?.preventDefault());
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        isValid: true,
        handleSubmit: mockHandleSubmit,
      }));

      render(<ResetPasswordPage />);

      const form = screen.getByRole('button', { name: /restablecer contraseña/i }).closest('form');
      fireEvent.submit(form!);

      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should disable inputs when loading', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        isLoading: true,
      }));

      render(<ResetPasswordPage />);

      expect(getPasswordInput()).toBeDisabled();
      expect(getConfirmInput()).toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        isLoading: true,
        isValid: true,
      }));

      render(<ResetPasswordPage />);

      const submitButton = screen.getByRole('button', { name: /restablecer contraseña/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('success state', () => {
    it('should show success message after reset', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        success: true,
      }));

      render(<ResetPasswordPage />);

      expect(screen.getByText('Contraseña actualizada')).toBeInTheDocument();
      expect(screen.getByText(/restablecida exitosamente/)).toBeInTheDocument();
    });

    it('should show login button after success', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        success: true,
      }));

      render(<ResetPasswordPage />);

      expect(screen.getByRole('button', { name: /Iniciar sesión/i })).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        error: 'Error al restablecer la contraseña',
      }));

      render(<ResetPasswordPage />);

      expect(screen.getByText('Error al restablecer la contraseña')).toBeInTheDocument();
    });

    it('should display field errors for password', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        fieldErrors: {
          password: 'La contraseña es muy débil',
        },
      }));

      render(<ResetPasswordPage />);

      expect(screen.getByText('La contraseña es muy débil')).toBeInTheDocument();
    });

    it('should display field errors for confirm password', () => {
      mockUseResetPassword.mockReturnValue(createMockResetPassword({
        fieldErrors: {
          confirmPassword: 'Las contraseñas no coinciden',
        },
      }));

      render(<ResetPasswordPage />);

      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    });
  });
});
