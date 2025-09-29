/**
 * API Client
 * Axios configuration for API calls with authentication and error handling
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiErrorResponse } from '../types/api-response.types';

// Base API URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


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
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common response scenarios
apiClient.interceptors.response.use(
  <T>(response: AxiosResponse<ApiResponse<T>>) => {
    // Return successful responses as-is
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle different error scenarios
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            // Redirect to login page if not already there
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          break;
          
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

// Authentication helper functions
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

export default apiClient;
