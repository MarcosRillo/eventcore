/**
 * useResetPassword Hook Tests
 */
import { act, renderHook, waitFor } from '@testing-library/react';

import { useResetPassword } from '@/features/auth/hooks/useResetPassword';
import * as authService from '@/features/auth/services/authService';
import { useToast } from '@/shared/context';

// Mock next/navigation
const mockSearchParams = new Map<string, string>();
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null,
  }),
}));

jest.mock('@/features/auth/services/authService');
jest.mock('@/shared/context', () => ({
  useToast: jest.fn(),
}));

const mockValidateResetToken = authService.validateResetToken as jest.MockedFunction<
  typeof authService.validateResetToken
>;
const mockResetPassword = authService.resetPassword as jest.MockedFunction<
  typeof authService.resetPassword
>;
const mockAddToast = jest.fn();

describe('useResetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.clear();
    (useToast as jest.Mock).mockReturnValue({
      addToast: mockAddToast,
    });
  });

  describe('initial state without token', () => {
    it('should set tokenValid to false when no token provided', async () => {
      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      expect(result.current.tokenValid).toBe(false);
      expect(result.current.error).toContain('inválido');
    });
  });

  describe('token validation', () => {
    it('should validate token on mount', async () => {
      mockSearchParams.set('token', 'valid-token');
      mockSearchParams.set('email', 'test@example.com');
      mockValidateResetToken.mockResolvedValueOnce({
        success: true,
        data: { valid: true },
      });

      const { result } = renderHook(() => useResetPassword());

      expect(result.current.isValidating).toBe(true);

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      expect(mockValidateResetToken).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: 'valid-token',
      });
      expect(result.current.tokenValid).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle invalid token', async () => {
      mockSearchParams.set('token', 'invalid-token');
      mockSearchParams.set('email', 'test@example.com');
      mockValidateResetToken.mockResolvedValueOnce({
        success: true,
        data: { valid: false },
      });

      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      expect(result.current.tokenValid).toBe(false);
      expect(result.current.error).toContain('expirado');
    });

    it('should handle validation error', async () => {
      mockSearchParams.set('token', 'some-token');
      mockSearchParams.set('email', 'test@example.com');
      mockValidateResetToken.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      expect(result.current.tokenValid).toBe(false);
      expect(result.current.error).toContain('Error');
    });
  });

  describe('password requirements', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'valid-token');
      mockSearchParams.set('email', 'test@example.com');
      mockValidateResetToken.mockResolvedValueOnce({
        success: true,
        data: { valid: true },
      });
    });

    it('should show all requirements as not met initially', async () => {
      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      expect(result.current.passwordRequirements.every((req) => !req.met)).toBe(true);
    });

    it('should update requirements as password changes', async () => {
      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      act(() => {
        result.current.setPassword('Password1');
      });

      const requirements = result.current.passwordRequirements;
      expect(requirements.find((r) => r.label === 'Mínimo 8 caracteres')?.met).toBe(true);
      expect(requirements.find((r) => r.label === 'Al menos una mayúscula')?.met).toBe(true);
      expect(requirements.find((r) => r.label === 'Al menos una minúscula')?.met).toBe(true);
      expect(requirements.find((r) => r.label === 'Al menos un número')?.met).toBe(true);
    });

    it('should be valid only when all requirements met and passwords match', async () => {
      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      act(() => {
        result.current.setPassword('Password1');
        result.current.setConfirmPassword('Password1');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should be invalid when passwords do not match', async () => {
      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      act(() => {
        result.current.setPassword('Password1');
        result.current.setConfirmPassword('Different1');
      });

      expect(result.current.isValid).toBe(false);
    });
  });

  describe('handleSubmit', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'valid-token');
      mockSearchParams.set('email', 'test@example.com');
      mockValidateResetToken.mockResolvedValueOnce({
        success: true,
        data: { valid: true },
      });
    });

    it('should set field errors for invalid form', async () => {
      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.fieldErrors.password).toBeDefined();
      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('should call resetPassword on valid submit', async () => {
      mockResetPassword.mockResolvedValueOnce({
        success: true,
        message: 'Password reset',
        data: { user_id: 1 },
      });

      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      act(() => {
        result.current.setPassword('NewPassword1');
        result.current.setConfirmPassword('NewPassword1');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockResetPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: 'valid-token',
        password: 'NewPassword1',
        password_confirmation: 'NewPassword1',
      });
      expect(result.current.success).toBe(true);
    });

    it('should show success toast on successful password reset', async () => {
      mockResetPassword.mockResolvedValueOnce({
        success: true,
        message: 'Password reset',
        data: { user_id: 1 },
      });

      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      act(() => {
        result.current.setPassword('NewPassword1');
        result.current.setConfirmPassword('NewPassword1');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Tu contraseña ha sido restablecida exitosamente.',
        type: 'success',
        duration: 5000,
      });
    });

    it('should handle reset error', async () => {
      mockResetPassword.mockRejectedValueOnce(new Error('Reset failed'));

      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      act(() => {
        result.current.setPassword('NewPassword1');
        result.current.setConfirmPassword('NewPassword1');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.success).toBe(false);
      expect(result.current.error).toContain('Error');
    });

    it('should show error toast on reset failure', async () => {
      mockResetPassword.mockRejectedValueOnce(new Error('Reset failed'));

      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      act(() => {
        result.current.setPassword('NewPassword1');
        result.current.setConfirmPassword('NewPassword1');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Error al restablecer la contraseña. Por favor intenta de nuevo.',
        type: 'error',
        duration: 5000,
      });
    });

    it('should show expired token toast on 400/422 error', async () => {
      const axiosError = {
        response: {
          status: 400,
        },
      };
      mockResetPassword.mockRejectedValueOnce(axiosError);

      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      act(() => {
        result.current.setPassword('NewPassword1');
        result.current.setConfirmPassword('NewPassword1');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'El enlace ha expirado. Por favor solicita uno nuevo.',
        type: 'error',
        duration: 5000,
      });
    });
  });

  describe('reset', () => {
    it('should reset form state', async () => {
      mockSearchParams.set('token', 'valid-token');
      mockSearchParams.set('email', 'test@example.com');
      mockValidateResetToken.mockResolvedValueOnce({
        success: true,
        data: { valid: true },
      });

      const { result } = renderHook(() => useResetPassword());

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      act(() => {
        result.current.setPassword('Password1');
        result.current.setConfirmPassword('Password1');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.password).toBe('');
      expect(result.current.confirmPassword).toBe('');
      expect(result.current.error).toBeNull();
      expect(result.current.fieldErrors).toEqual({});
    });
  });
});
