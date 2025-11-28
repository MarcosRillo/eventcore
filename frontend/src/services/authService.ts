/**
 * Authentication Service
 * Service functions for authentication-related API calls
 */

import axios from 'axios';
import { User, LoginCredentials, LoginResponse, RefreshTokenResponse } from '@/types/auth.types';
import { getRefreshToken } from '@/services/tokenUtils';

// Base API URL - used for refresh endpoint (which doesn't need auth)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Login with email and password
 * Returns access_token, refresh_token, expires_at, and user
 */
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  // Import apiClient dynamically to avoid circular dependency
  const { default: apiClient } = await import('@/services/apiClient');
  const response = await apiClient.post<{ data: LoginResponse }>('/auth/login', credentials);
  return response.data.data;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  const { default: apiClient } = await import('@/services/apiClient');
  const response = await apiClient.get<{ data: User }>('/auth/me');
  return response.data.data;
};

/**
 * Logout user - revokes all tokens (access + refresh)
 */
export const logoutUser = async (): Promise<void> => {
  const { default: apiClient } = await import('@/services/apiClient');
  await apiClient.post<void>('/auth/logout');
};

/**
 * Refresh tokens using refresh_token
 * This endpoint is called WITHOUT the apiClient interceptors to avoid infinite loops
 * Uses a standalone axios instance
 */
export const refreshTokens = async (): Promise<RefreshTokenResponse> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Use standalone axios call to avoid interceptor loops
  const response = await axios.post<{ success: boolean; data: RefreshTokenResponse }>(
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

  return response.data.data;
};

/**
 * Validate current token by calling /auth/me
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
};

const authService = {
  loginUser,
  getCurrentUser,
  logoutUser,
  refreshTokens,
  validateToken,
};

export default authService;
