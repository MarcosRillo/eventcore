/**
 * Authentication Service
 * Service functions for authentication-related API calls
 */

import axios from 'axios';
import {
  User,
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  ForgotPasswordData,
  ResetPasswordData,
  ValidateResetTokenData,
  PasswordResetResponse,
  ValidateTokenResponse,
  ResetPasswordResponse,
} from '@/types/auth.types';
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

// ============================================
// Password Reset Functions
// ============================================

/**
 * Request password reset link
 * Always returns success to prevent email enumeration
 */
export const forgotPassword = async (data: ForgotPasswordData): Promise<PasswordResetResponse> => {
  const { default: apiClient } = await import('@/services/apiClient');
  const response = await apiClient.post<PasswordResetResponse>('/auth/forgot-password', data);
  return response.data;
};

/**
 * Validate reset token before showing reset form
 */
export const validateResetToken = async (data: ValidateResetTokenData): Promise<ValidateTokenResponse> => {
  const { default: apiClient } = await import('@/services/apiClient');
  const response = await apiClient.post<ValidateTokenResponse>('/auth/validate-reset-token', data);
  return response.data;
};

/**
 * Reset password with token
 */
export const resetPassword = async (data: ResetPasswordData): Promise<ResetPasswordResponse> => {
  const { default: apiClient } = await import('@/services/apiClient');
  const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
  return response.data;
};

const authService = {
  loginUser,
  getCurrentUser,
  logoutUser,
  refreshTokens,
  validateToken,
  forgotPassword,
  validateResetToken,
  resetPassword,
};

export default authService;
