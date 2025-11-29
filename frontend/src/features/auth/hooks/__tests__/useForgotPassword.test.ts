/**
 * useForgotPassword Hook Tests
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useForgotPassword } from '../useForgotPassword';
import * as authService from '@/services/authService';

jest.mock('@/services/authService');

const mockForgotPassword = authService.forgotPassword as jest.MockedFunction<
  typeof authService.forgotPassword
>;

describe('useForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useForgotPassword());

      expect(result.current.email).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.success).toBe(false);
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('email validation', () => {
    it('should be invalid with empty email', () => {
      const { result } = renderHook(() => useForgotPassword());

      expect(result.current.isValid).toBe(false);
    });

    it('should be invalid with malformed email', () => {
      const { result } = renderHook(() => useForgotPassword());

      act(() => {
        result.current.setEmail('invalid-email');
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should be valid with proper email format', () => {
      const { result } = renderHook(() => useForgotPassword());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('handleSubmit', () => {
    it('should set error for invalid email', async () => {
      const { result } = renderHook(() => useForgotPassword());

      act(() => {
        result.current.setEmail('invalid-email');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Por favor ingresa un email válido');
      expect(mockForgotPassword).not.toHaveBeenCalled();
    });

    it('should call forgotPassword service on valid submit', async () => {
      mockForgotPassword.mockResolvedValueOnce({
        success: true,
        message: 'Email sent',
      });

      const { result } = renderHook(() => useForgotPassword());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockForgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result.current.success).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should set loading state during submission', async () => {
      let resolvePromise: (value: { success: boolean; message: string }) => void;
      const promise = new Promise<{ success: boolean; message: string }>((resolve) => {
        resolvePromise = resolve;
      });
      mockForgotPassword.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useForgotPassword());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({ success: true, message: 'Email sent' });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle network errors', async () => {
      mockForgotPassword.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useForgotPassword());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Error de conexión. Por favor intenta de nuevo.');
      expect(result.current.success).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state', async () => {
      mockForgotPassword.mockResolvedValueOnce({
        success: true,
        message: 'Email sent',
      });

      const { result } = renderHook(() => useForgotPassword());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.success).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.email).toBe('');
      expect(result.current.error).toBeNull();
      expect(result.current.success).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
