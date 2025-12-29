/**
 * Tests for AuthContext
 *
 * Coverage areas:
 * 1. Login (successful login + error handling)
 * 2. Logout (clear state + localStorage)
 * 3. Token Persistence (restore from localStorage)
 * 4. Session Management
 * 5. Error Handling
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';
import { getAccessToken, storeTokens, clearTokens } from '@/services/tokenUtils';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock API client
jest.mock('@/services/apiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Mock token utilities
jest.mock('@/services/tokenUtils', () => ({
  getAccessToken: jest.fn(),
  storeTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockPush.mockClear();
  });

  // ============================================================
  // LOGIN TESTS
  // ============================================================

  describe('Login', () => {

    test('should login successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { code: 'entity_admin' } as { code: 'entity_admin' },
      };
      const mockAccessToken = 'mock-access-token-123';
      const mockRefreshToken = 'mock-refresh-token-456';
      const mockExpiresAt = '2025-12-31T23:59:59.000Z';
      const mockResponse = {
        data: {
          data: {
            user: mockUser,
            access_token: mockAccessToken,
            refresh_token: mockRefreshToken,
            expires_at: mockExpiresAt,
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password' });
      });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(storeTokens).toHaveBeenCalledWith(mockAccessToken, mockRefreshToken, mockExpiresAt);
      expect(localStorageMock.getItem('user')).toBe(JSON.stringify(mockUser));
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe(mockAccessToken);
    });

    test('should handle login error with 401 status', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      };

      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const success = await result.current.login({
          email: 'test@example.com',
          password: 'wrong',
        });
        expect(success).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    test('should handle login error with 422 validation', async () => {
      const mockError = {
        response: {
          status: 422,
          data: {
            errors: {
              email: ['El campo email es requerido'],
            },
          },
        },
      };

      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({ email: '', password: 'password' });
      });

      expect(result.current.error).toContain('El campo email es requerido');
    });

    test('should handle generic login error', async () => {
      const mockError = new Error('Network error');

      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password' });
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ============================================================
  // LOGOUT TESTS
  // ============================================================

  describe('Logout', () => {

    test('should logout successfully and clear all state', async () => {
      // Setup: login first
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { code: 'entity_admin' } as { code: 'entity_admin' },
      };
      const mockAccessToken = 'mock-access-token-123';
      const mockRefreshToken = 'mock-refresh-token-456';
      const mockExpiresAt = '2025-12-31T23:59:59.000Z';
      const mockResponse = {
        data: {
          data: {
            user: mockUser,
            access_token: mockAccessToken,
            refresh_token: mockRefreshToken,
            expires_at: mockExpiresAt,
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login
      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password' });
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Now logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(clearTokens).toHaveBeenCalled();
      // Note: localStorage clearing is handled by clearTokens (tested in tokenUtils.test.ts)
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    test('should clear error on logout', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate error state
      const mockError = new Error('Login error');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'wrong' });
      });

      expect(result.current.error).toBeTruthy();

      // Logout should clear error
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ============================================================
  // TOKEN PERSISTENCE TESTS
  // ============================================================

  describe('Token Persistence', () => {

    test('should restore session from localStorage on mount', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { code: 'entity_admin' } as { code: 'entity_admin' },
      };
      const mockToken = 'stored-token-123';

      // Pre-populate localStorage
      localStorageMock.setItem('user', JSON.stringify(mockUser));
      (getAccessToken as jest.Mock).mockReturnValue(mockToken);
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    });

    test('should clear invalid token from localStorage', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { code: 'entity_admin' } as { code: 'entity_admin' },
      };
      const mockToken = 'invalid-token';

      localStorageMock.setItem('user', JSON.stringify(mockUser));
      (getAccessToken as jest.Mock).mockReturnValue(mockToken);
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Token expired'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(clearTokens).toHaveBeenCalled();
      // Note: localStorage clearing is handled by clearTokens (tested in tokenUtils.test.ts)
    });

    test('should handle corrupted user data in localStorage', async () => {
      const mockToken = 'valid-token';

      localStorageMock.setItem('user', 'invalid-json-{{{');
      (getAccessToken as jest.Mock).mockReturnValue(mockToken);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(clearTokens).toHaveBeenCalled();
    });

    test('should not restore session when no token exists', async () => {
      (getAccessToken as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ============================================================
  // ERROR HANDLING TESTS
  // ============================================================

  describe('Error Handling', () => {

    test('should clear error manually', async () => {
      const mockError = new Error('Test error');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'wrong' });
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    test('should handle missing response data structure', async () => {
      const mockResponse = {
        data: {}, // Missing nested data
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const success = await result.current.login({
          email: 'test@example.com',
          password: 'password',
        });
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ============================================================
  // CONTEXT USAGE TESTS
  // ============================================================

  describe('Context Usage', () => {

    test('should throw error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });
  });

  // ============================================================
  // AUTHENTICATION STATE TESTS
  // ============================================================

  describe('Authentication State', () => {

    test('should correctly compute isAuthenticated', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initially not authenticated
      expect(result.current.isAuthenticated).toBe(false);

      // After successful login
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { code: 'entity_admin' } as { code: 'entity_admin' },
      };
      const mockAccessToken = 'mock-access-token-123';
      const mockRefreshToken = 'mock-refresh-token-456';
      const mockExpiresAt = '2025-12-31T23:59:59.000Z';
      const mockResponse = {
        data: {
          data: {
            user: mockUser,
            access_token: mockAccessToken,
            refresh_token: mockRefreshToken,
            expires_at: mockExpiresAt,
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password' });
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    test('should complete loading state after login', async () => {
      const mockResponse = {
        data: {
          data: {
            user: { id: 1, email: 'test@example.com', role: { code: 'entity_admin' } },
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_at: '2025-12-31T23:59:59.000Z',
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password' });
      });

      // Should not be loading after login completes
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
