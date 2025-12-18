/**
 * API Client
 * Axios configuration for API calls with authentication and auto-refresh
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiErrorResponse } from '@/types/api-response.types';
import { getAccessToken, storeTokens, clearTokens, getRefreshToken } from '@/services/tokenUtils';

// Base API URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Token refresh state management (handles race conditions)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Process queued requests after refresh completes
 */
const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Perform token refresh using refresh_token
 * Uses standalone axios call to avoid interceptor loops
 */
const performTokenRefresh = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post<{
    success: boolean;
    data: { access_token: string; refresh_token: string; expires_at: string };
  }>(
    `${API_BASE_URL}/api/v1/auth/refresh`,
    { refresh_token: refreshToken },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error('Invalid refresh response');
  }

  const { access_token, refresh_token: newRefreshToken, expires_at } = response.data.data;

  // Store new tokens
  storeTokens(access_token, newRefreshToken, expires_at);

  return access_token;
};

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add authentication token and API prefix
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add /api/v1 prefix to all requests
    if (config.url && !config.url.startsWith('/api')) {
      config.url = `/api/v1${config.url}`;
    }

    // Add authentication token
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Public API routes that should not trigger redirect on 401
 * These routes are accessible without authentication
 */
const PUBLIC_API_ROUTES = [
  '/public/events',
  '/public/stats',
  '/public/locations/active',
  '/public/event-types',
];

/**
 * Check if a URL is a public API route
 */
const isPublicApiRoute = (url: string | undefined): boolean => {
  if (!url) return false;
  return PUBLIC_API_ROUTES.some(route => url.includes(route));
};

// Response interceptor with auto-refresh on 401
apiClient.interceptors.response.use(
  <T>(response: AxiosResponse<ApiResponse<T>>) => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Skip refresh for auth endpoints to avoid infinite loops
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                            originalRequest.url?.includes('/auth/refresh');

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // For public routes with 401: clear invalid token but do NOT redirect
      // This happens when there's an expired token stored locally
      if (isPublicApiRoute(originalRequest.url)) {
        clearTokens();  // Clear invalid/expired token
        return Promise.reject(error);  // Let component handle error (will retry without token)
      }

      // Check if we have a refresh token (only for protected routes)
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // No refresh token - clear state and redirect (protected routes only)
        clearTokens();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Mark as refreshing and attempt refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await performTokenRefresh();

        // Process queued requests with new token
        processQueue(null, newToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear state and redirect
        processQueue(refreshError as Error, null);
        clearTokens();

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other error scenarios
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 403:
          // Forbidden - user doesn't have permission
          break;

        case 404:
          // Not found
          break;

        case 422:
          // Validation errors
          break;

        case 500:
          // Server error
          break;

        default:
          // Unknown error
          break;
      }
    }

    return Promise.reject(error);
  }
);

// Generic API request wrapper with better typing
export const makeApiRequest = async <T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: Record<string, unknown>,
  config?: Record<string, unknown>
): Promise<T> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient[method](url, data, config);
    return response.data.data;
  } catch (error: unknown) {
    // Re-throw the error to be handled by the calling function
    throw error;
  }
};

// Re-export token utilities for backward compatibility
export {
  getAccessToken as getAuthToken,
  storeTokens as setAuthToken,
  clearTokens as removeAuthToken,
  getAccessToken,
  getRefreshToken,
  storeTokens,
  clearTokens
} from '@/services/tokenUtils';

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null;
};

export default apiClient;
