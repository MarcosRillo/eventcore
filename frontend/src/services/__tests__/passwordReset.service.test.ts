/**
 * Password Reset Service Tests
 * Tests for forgotPassword, validateResetToken, and resetPassword functions
 */
import { forgotPassword, validateResetToken, resetPassword } from '@/services/authService';

// Mock apiClient
jest.mock('@/services/apiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

describe('Password Reset Service', () => {
  let mockApiClient: jest.Mocked<{ post: jest.Mock }>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const apiClientModule = await import('@/services/apiClient');
    mockApiClient = apiClientModule.default as unknown as jest.Mocked<{ post: jest.Mock }>;
  });

  describe('forgotPassword', () => {
    it('should send forgot password request successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await forgotPassword({ email: 'test@example.com' });

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain('enlace');
    });

    it('should handle network errors', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(forgotPassword({ email: 'test@example.com' })).rejects.toThrow('Network error');
    });

    it('should always return success message for security', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await forgotPassword({ email: 'nonexistent@example.com' });

      expect(result.success).toBe(true);
    });
  });

  describe('validateResetToken', () => {
    it('should validate a valid token', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { valid: true },
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await validateResetToken({
        email: 'test@example.com',
        token: 'valid-token-123',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/validate-reset-token', {
        email: 'test@example.com',
        token: 'valid-token-123',
      });
      expect(result.data.valid).toBe(true);
    });

    it('should return invalid for expired token', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { valid: false },
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await validateResetToken({
        email: 'test@example.com',
        token: 'expired-token',
      });

      expect(result.data.valid).toBe(false);
    });

    it('should handle validation errors', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Validation failed'));

      await expect(
        validateResetToken({ email: 'test@example.com', token: 'bad-token' })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Contraseña restablecida exitosamente.',
          data: { user_id: 1 },
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await resetPassword({
        email: 'test@example.com',
        token: 'valid-token',
        password: 'NewPassword123',
        password_confirmation: 'NewPassword123',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
        email: 'test@example.com',
        token: 'valid-token',
        password: 'NewPassword123',
        password_confirmation: 'NewPassword123',
      });
      expect(result.success).toBe(true);
      expect(result.data.user_id).toBe(1);
    });

    it('should handle expired token error', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Token expired'));

      await expect(
        resetPassword({
          email: 'test@example.com',
          token: 'expired-token',
          password: 'NewPassword123',
          password_confirmation: 'NewPassword123',
        })
      ).rejects.toThrow('Token expired');
    });

    it('should handle password mismatch error', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Passwords do not match'));

      await expect(
        resetPassword({
          email: 'test@example.com',
          token: 'valid-token',
          password: 'NewPassword123',
          password_confirmation: 'DifferentPassword123',
        })
      ).rejects.toThrow('Passwords do not match');
    });
  });
});
