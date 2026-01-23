/**
 * Authentication Service
 *
 * SECURITY: Uses httpOnly cookies for authentication (XSS protection)
 * - Tokens are stored in httpOnly cookies by backend
 * - Browser sends cookies automatically with withCredentials: true
 * - NO tokens stored in localStorage
 */

import axios from 'axios';

import {
  ForgotPasswordData,
  LoginCredentials,
  LoginResponse,
  PasswordResetResponse,
  RefreshTokenResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  User,
  ValidateResetTokenData,
  ValidateTokenResponse,
} from '@/types/auth.types';

/**
 * Login with email and password
 * Backend sets httpOnly cookies automatically
 */
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { default: apiClient } = await import('@/services/apiClient');
  const response = await apiClient.post<{ data: LoginResponse }>('/auth/login', credentials);
  return response.data.data;
};

/**
 * Get current authenticated user
 * Uses httpOnly cookie sent automatically by browser
 */
export const getCurrentUser = async (): Promise<User> => {
  const { default: apiClient } = await import('@/services/apiClient');
  const response = await apiClient.get<{ data: User }>('/auth/me');
  return response.data.data;
};

/**
 * Logout user - backend clears httpOnly cookies
 */
export const logoutUser = async (): Promise<void> => {
  const { default: apiClient } = await import('@/services/apiClient');
  await apiClient.post<void>('/auth/logout');
};

/**
 * Refresh tokens using httpOnly cookie
 * Cookie is sent automatically by browser
 * Backend sets new cookies in response
 */
export const refreshTokens = async (): Promise<RefreshTokenResponse> => {
  // Use relative URL to go through Next.js proxy
  const response = await axios.post<{ success: boolean; data: RefreshTokenResponse }>(
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

  if (!response.data.success || !response.data.data) {
    throw new Error('Invalid refresh response');
  }

  return response.data.data;
};

/**
 * Validate current session by calling /auth/me
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
