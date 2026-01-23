/**
 * API Client
 * Axios configuration for authenticated API calls
 *
 * SECURITY: Uses httpOnly cookies for authentication (XSS protection)
 * - Cookies are set by the backend on login/refresh
 * - Browser sends cookies automatically with withCredentials: true
 * - Backend CookieTokenMiddleware extracts token from cookie
 * - NO tokens stored in localStorage (XSS safe)
 */

import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { ApiErrorResponse, ApiResponse } from '@/types/api-response.types';

/**
 * API Base URL
 *
 * In development: Uses Next.js proxy (/api/v1) to avoid CORS issues
 * In production: Direct API calls (same domain via nginx proxy)
 */
const getBaseUrl = (): string => {
  // In browser (client-side), use relative URL to leverage Next.js proxy
  if (typeof window !== 'undefined') {
    return '';  // Relative URL, uses Next.js rewrites proxy
  }

  // In server-side (SSR), call backend directly
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

// Token refresh state management (handles race conditions)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Process queued requests after refresh completes
 */
const processQueue = (error: Error | null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(undefined);
    }
  });
  failedQueue = [];
};

/**
 * Perform token refresh using httpOnly cookie
 * Cookie is sent automatically by browser
 */
const performTokenRefresh = async (): Promise<void> => {
  // Use relative URL to go through Next.js proxy
  await axios.post(
    '/api/v1/auth/refresh',
    {},  // Empty body - refresh_token comes from httpOnly cookie
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,  // Send cookies
    }
  );
  // New tokens are set as cookies by backend response
};

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,  // CRITICAL: Send httpOnly cookies with requests
  timeout: 10000,
});

// Request interceptor - only add API prefix
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add /api/v1 prefix if not present
    if (config.url && !config.url.startsWith('/api/v1')) {
      config.url = `/api/v1${config.url}`;
    }

    // NO manual token injection - cookies are sent automatically
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Public API routes that should not trigger redirect on 401
 */
const PUBLIC_API_ROUTES = [
  '/public/events',
  '/public/stats',
  '/public/locations/active',
  '/public/event-types',
];

const isPublicApiRoute = (url: string | undefined): boolean => {
  if (!url) return false;
  return PUBLIC_API_ROUTES.some(route => url.includes(route));
};

// Response interceptor with auto-refresh on 401
apiClient.interceptors.response.use(
  <T>(response: AxiosResponse<ApiResponse<T>>) => response,
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

      // For public routes with 401: just reject (no auth needed)
      if (isPublicApiRoute(originalRequest.url)) {
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      // Mark as refreshing and attempt refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await performTokenRefresh();

        // Process queued requests
        processQueue(null);

        // Retry original request (new cookie is already set)
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        processQueue(refreshError as Error);

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Generic API request wrapper
export const makeApiRequest = async <T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: Record<string, unknown>,
  config?: Record<string, unknown>
): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T>> = await apiClient[method](url, data, config);
  return response.data.data;
};

/**
 * Check if user appears to be authenticated
 * Note: This is a client-side check only. Actual auth is validated by backend.
 *
 * For middleware/SSR: check cookies directly
 * For client: we can't read httpOnly cookies, so check if we got a successful /me response
 */
export const isAuthenticated = (): boolean => {
  // Can't check httpOnly cookies from JS - this is by design (XSS protection)
  // The actual authentication state should be managed by AuthContext
  // This function is kept for backward compatibility but always returns false
  // Real auth state comes from successful API calls
  return false;
};

export default apiClient;
