/**
 * Public API Client
 * Axios configuration for PUBLIC API calls (no authentication required)
 *
 * Use this client for:
 * - Public calendar data (/public/events)
 * - Landing page data (/public/stats)
 * - Any endpoint that doesn't require authentication
 *
 * This client does NOT include:
 * - Authentication tokens (Bearer header)
 * - Cookie credentials (withCredentials: false)
 * - Auto-redirect on 401
 */

import axios, { AxiosInstance } from 'axios';

// Base API URL - use internal Docker URL for server-side, public URL for client-side
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return '';  // Client-side: use Next.js rewrite proxy (relative URLs)
  }
  return process.env.INTERNAL_API_URL
    || process.env.NEXT_PUBLIC_API_URL
    || 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Create a clean axios instance for public endpoints
 * No authentication interceptors, no credentials
 */
const publicApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // IMPORTANT: Don't send credentials for public routes
  // This allows SSR to work without browser cookies
  withCredentials: false,
  timeout: 35000,
});

// Request interceptor: only add API prefix
publicApiClient.interceptors.request.use(
  (config) => {
    // Add /api/v1 prefix to all requests that don't already have it
    if (config.url && !config.url.startsWith('/api/v1')) {
      config.url = `/api/v1${config.url}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: minimal error handling (no auth logic)
publicApiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default publicApiClient;
