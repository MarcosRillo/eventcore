/**
 * Authentication Service
 * Service functions for authentication-related API calls
 */

import { apiClient } from '@/lib/api';
import { User, LoginCredentials, LoginResponse } from '@/types/auth.types';

/**
 * Login with email and password
 */
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  return await apiClient.post<LoginResponse>('/auth/login', credentials);
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  return await apiClient.get<User>('/auth/me');
};

/**
 * Logout user (if backend supports logout endpoint)
 */
export const logoutUser = async (): Promise<void> => {
  await apiClient.post<void>('/auth/logout');
};

/**
 * Refresh user token (if backend supports token refresh)
 */
export const refreshToken = async (): Promise<LoginResponse> => {
  return await apiClient.post<LoginResponse>('/auth/refresh');
};

/**
 * Validate current token
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    await apiClient.get<User>('/auth/me');
    return true;
  } catch {
    return false;
  }
};

const authService = {
  loginUser,
  getCurrentUser,
  logoutUser,
  refreshToken,
  validateToken,
};

export default authService;
