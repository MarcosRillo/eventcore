/**
 * Auth Service Tests
 *
 * Tests for loginUser, getCurrentUser, logoutUser, refreshTokens, validateToken
 *
 * Note: Authentication now uses httpOnly cookies (XSS protection).
 * - Tokens are set by backend via Set-Cookie headers
 * - Browser sends cookies automatically with withCredentials: true
 * - No manual token handling in frontend
 */
import axios from 'axios';

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshTokens,
  validateToken,
} from '@/services/authService';

// Mock apiClient
jest.mock('@/services/apiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Mock axios for refreshTokens
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Auth Service', () => {
  let mockApiClient: jest.Mocked<{ post: jest.Mock; get: jest.Mock }>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const apiClientModule = await import('@/services/apiClient');
    mockApiClient = apiClientModule.default as unknown as jest.Mocked<{ post: jest.Mock; get: jest.Mock }>;
  });

  describe('loginUser', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'Password123',
    };

    it('should login successfully and return tokens with user', async () => {
      const mockResponse = {
        data: {
          data: {
            access_token: 'access-token-123',
            refresh_token: 'refresh-token-456',
            expires_at: '2025-12-31T23:59:59Z',
            user: {
              id: 1,
              name: 'Test User',
              email: 'test@example.com',
              role: 'organizer',
            },
          },
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await loginUser(validCredentials);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', validCredentials);
      expect(result.access_token).toBe('access-token-123');
      expect(result.refresh_token).toBe('refresh-token-456');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe('organizer');
    });

    it('should handle invalid credentials (401)', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      await expect(loginUser(validCredentials)).rejects.toEqual(error);
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', validCredentials);
    });

    it('should handle validation errors (422)', async () => {
      const error = {
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            errors: {
              email: ['The email field is required'],
              password: ['The password field is required'],
            },
          },
        },
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      await expect(loginUser({ email: '', password: '' })).rejects.toEqual(error);
    });

    it('should handle network errors', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Network Error'));

      await expect(loginUser(validCredentials)).rejects.toThrow('Network Error');
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'organizer',
        entity_id: 5,
      };
      mockApiClient.get.mockResolvedValueOnce({
        data: { data: mockUser },
      });

      const result = await getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result.id).toBe(1);
      expect(result.name).toBe('Test User');
      expect(result.email).toBe('test@example.com');
      expect(result.role).toBe('organizer');
    });

    it('should handle unauthorized error (401)', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthenticated' },
        },
      };
      mockApiClient.get.mockRejectedValueOnce(error);

      await expect(getCurrentUser()).rejects.toEqual(error);
      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
    });

    it('should handle network errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(getCurrentUser()).rejects.toThrow('Network Error');
    });
  });

  describe('logoutUser', () => {
    it('should logout successfully', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: null });

      await expect(logoutUser()).resolves.toBeUndefined();
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should handle errors during logout', async () => {
      const error = new Error('Logout failed');
      mockApiClient.post.mockRejectedValueOnce(error);

      await expect(logoutUser()).rejects.toThrow('Logout failed');
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully using httpOnly cookie', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            expires_at: '2025-12-31T23:59:59Z',
          },
        },
      });

      const result = await refreshTokens();

      // With httpOnly cookies, we send empty body - cookie is sent automatically
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/auth/refresh',
        {},  // Empty body - refresh_token comes from httpOnly cookie
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          withCredentials: true,  // Sends cookies
        })
      );
      expect(result.access_token).toBe('new-access-token');
      expect(result.refresh_token).toBe('new-refresh-token');
      expect(result.expires_at).toBe('2025-12-31T23:59:59Z');
    });

    it('should throw error for invalid refresh response', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: {
          success: false,
          data: null,
        },
      });

      await expect(refreshTokens()).rejects.toThrow('Invalid refresh response');
    });

    it('should handle network errors during refresh', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      await expect(refreshTokens()).rejects.toThrow('Network Error');
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'organizer',
      };
      mockApiClient.get.mockResolvedValueOnce({
        data: { data: mockUser },
      });

      const result = await validateToken();

      expect(result).toBe(true);
      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
    });

    it('should return false for invalid/expired token', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

      const result = await validateToken();

      expect(result).toBe(false);
      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
    });

    it('should return false when network error occurs', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network Error'));

      const result = await validateToken();

      expect(result).toBe(false);
    });
  });
});
