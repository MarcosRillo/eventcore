/**
 * Tests for AuthContext
 *
 * SECURITY ARCHITECTURE:
 * - Tokens are stored in httpOnly cookies (XSS protection)
 * - Browser sends cookies automatically with withCredentials: true
 * - NO tokens stored in localStorage
 * - Auth state is validated by calling /auth/me
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { ReactNode } from 'react';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';

// Mock axios for isCancel control
jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  isCancel: jest.fn(),
}));

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

// Type the mocked apiClient
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock document.cookie to accumulate cookies like the real browser
const mockCookies: string[] = [];
Object.defineProperty(document, 'cookie', {
  get: () => mockCookies.join('; '),
  set: (value: string) => {
    // Parse cookie name
    const cookieName = value.split('=')[0];
    // Remove existing cookie with same name
    const existingIndex = mockCookies.findIndex(c => c.startsWith(cookieName + '='));
    if (existingIndex !== -1) {
      mockCookies.splice(existingIndex, 1);
    }
    // Check if cookie is being deleted (expires in past or max-age=0 without value)
    const isDeleting = value.includes('expires=Thu, 01 Jan 1970') ||
                       (value.includes('max-age=0') && !value.includes(cookieName + '=%7B'));
    if (!isDeleting) {
      mockCookies.push(value);
    }
  },
  configurable: true,
});

// Create wrapper with fresh AuthProvider for each test
const createWrapper = () => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );
  return Wrapper;
};

describe('AuthContext', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockCookies.length = 0;

    // Reset mock implementations
    mockedApiClient.get.mockReset();
    mockedApiClient.post.mockReset();

    // Reset axios.isCancel to return false by default
    (axios.isCancel as jest.Mock).mockReturnValue(false);
  });

  // Helper to create standard mock responses
  const createMockUser = (overrides = {}) => ({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: { code: 'entity_admin' as const },
    ...overrides,
  });

  const createLoginResponse = (user = createMockUser()) => ({
    data: {
      data: {
        user,
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: '2025-12-31T23:59:59.000Z',
      },
    },
  });

  // ============================================================
  // LOGIN TESTS
  // ============================================================

  describe('Login', () => {
    test('should login successfully with cookies', async () => {
      const mockUser = createMockUser();

      // Setup: initial /auth/me fails (not logged in)
      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthenticated'));
      // Login succeeds
      mockedApiClient.post.mockResolvedValueOnce(createLoginResponse(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initially not authenticated
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();

      // Perform login
      let loginResult: boolean = false;
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'password',
        });
      });

      // Verify login succeeded
      expect(loginResult).toBe(true);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });

      // Wait for state update
      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBeNull(); // httpOnly cookies can't be read
      expect(document.cookie).toContain('user=');
    });

    test('should handle login error with 401 status', async () => {
      // Setup: initial auth fails, login also fails
      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthenticated'));
      mockedApiClient.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean = true;
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'wrong',
        });
      });

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    test('should handle login error with 422 validation', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthenticated'));
      mockedApiClient.post.mockRejectedValueOnce({
        response: {
          status: 422,
          data: {
            errors: {
              email: ['El campo email es requerido'],
            },
          },
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({ email: '', password: 'password' });
      });

      expect(result.current.error).toContain('El campo email es requerido');
    });

    test('should handle generic login error', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthenticated'));
      mockedApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

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
      const mockUser = createMockUser();

      // Setup: initial auth fails, then login succeeds
      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthenticated'));
      mockedApiClient.post
        .mockResolvedValueOnce(createLoginResponse(mockUser)) // login
        .mockResolvedValueOnce({}); // logout

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login first
      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password' });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Now logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    test('should clear error on logout', async () => {
      // Setup: auth fails, login fails
      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthenticated'));
      mockedApiClient.post
        .mockRejectedValueOnce(new Error('Login error')) // failed login
        .mockResolvedValueOnce({}); // logout

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger error
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
  // SESSION INITIALIZATION TESTS
  // ============================================================

  describe('Session Initialization', () => {
    test('should restore session via /auth/me on mount', async () => {
      const mockUser = createMockUser();

      // Set user cookie to trigger /auth/me validation
      mockCookies.push('user=' + encodeURIComponent(JSON.stringify(mockUser)));

      // /auth/me succeeds (valid httpOnly cookie exists)
      mockedApiClient.get.mockResolvedValueOnce({
        data: { data: mockUser },
      });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBeNull();
      expect(mockedApiClient.get).toHaveBeenCalledWith('/auth/me', expect.objectContaining({ signal: expect.any(AbortSignal) }));
    });

    test('should skip /auth/me when no session cookie exists', async () => {
      // No user cookie → skip API call entirely
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    test('should handle expired session on mount', async () => {
      // Set user cookie so /auth/me is attempted
      mockCookies.push('user=' + encodeURIComponent(JSON.stringify(createMockUser())));

      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 401 },
      });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    test('should abort and logout when /auth/me hangs past timeout', async () => {
      jest.useFakeTimers();

      // Set user cookie to trigger /auth/me
      mockCookies.push('user=' + encodeURIComponent(JSON.stringify(createMockUser())));

      // Return a promise that rejects when the AbortController signal fires
      mockedApiClient.get.mockImplementationOnce((_url: string, config?: { signal?: AbortSignal }) => {
        return new Promise<never>((_resolve, reject) => {
          if (config?.signal) {
            config.signal.addEventListener('abort', () => {
              const canceledError = new Error('canceled');
              canceledError.name = 'CanceledError';
              reject(canceledError);
            });
          }
        });
      });

      // Make axios.isCancel return true for CanceledError
      (axios.isCancel as jest.Mock).mockImplementation((error: unknown) => {
        return error instanceof Error && error.name === 'CanceledError';
      });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      // Advance timers past the 5000ms timeout
      await act(async () => {
        jest.advanceTimersByTime(5001);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      jest.useRealTimers();
    });

    test('should logout on 403 during initialization', async () => {
      // Set user cookie to trigger /auth/me
      mockCookies.push('user=' + encodeURIComponent(JSON.stringify(createMockUser())));

      // /auth/me rejects with 403
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 403 },
      });

      // axios.isCancel returns false for non-cancel errors
      (axios.isCancel as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    test('should preserve session on 5xx during initialization', async () => {
      // Set user cookie to trigger /auth/me
      mockCookies.push('user=' + encodeURIComponent(JSON.stringify(createMockUser())));

      // /auth/me rejects with 500 (server error — transient, not an auth failure)
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 500 },
      });

      // axios.isCancel returns false for non-cancel errors
      (axios.isCancel as jest.Mock).mockReturnValue(false);

      const cookiesBefore = [...mockCookies];

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // user is null (no data set from failed /auth/me), but session cookie is preserved
      expect(result.current.user).toBeNull();
      // The user cookie must NOT have been cleared by handleLogout
      expect(document.cookie).toContain('user=');
      expect(mockCookies).toEqual(cookiesBefore);
    });

    test('should clear timeout after successful /auth/me', async () => {
      const mockUser = createMockUser();

      // Set user cookie to trigger /auth/me
      mockCookies.push('user=' + encodeURIComponent(JSON.stringify(mockUser)));

      // /auth/me succeeds
      mockedApiClient.get.mockResolvedValueOnce({
        data: { data: mockUser },
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  // ============================================================
  // ERROR HANDLING TESTS
  // ============================================================

  describe('Error Handling', () => {
    test('should clear error manually', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthenticated'));
      mockedApiClient.post.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

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
      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthenticated'));
      mockedApiClient.post.mockResolvedValueOnce({ data: {} }); // Missing nested data

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean = true;
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'password',
        });
      });

      expect(loginResult).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ============================================================
  // CONTEXT USAGE TESTS
  // ============================================================

  describe('Context Usage', () => {
    test('should throw error when useAuth is used outside AuthProvider', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      errorSpy.mockRestore();
    });
  });

  // ============================================================
  // AUTHENTICATION STATE TESTS
  // ============================================================

  describe('Authentication State', () => {
    test('should correctly compute isAuthenticated after login', async () => {
      const mockUser = createMockUser();

      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthenticated'));
      mockedApiClient.post.mockResolvedValueOnce(createLoginResponse(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password' });
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    test('should complete loading state after login', async () => {
      const mockUser = createMockUser();

      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthenticated'));
      mockedApiClient.post.mockResolvedValueOnce(createLoginResponse(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password' });
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
