/**
 * Token Utilities
 * Helper functions for token storage and validation
 */

import { TOKEN_KEYS } from '@/types/auth.types';

/**
 * Check if a token is expired based on its expiration timestamp
 * @param expiresAt - ISO timestamp string
 * @returns true if token is expired
 */
export const isTokenExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return true;

  try {
    const expirationTime = new Date(expiresAt).getTime();
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
};

/**
 * Check if token is expiring soon (within threshold)
 * Used to proactively refresh before expiration
 * @param expiresAt - ISO timestamp string
 * @param thresholdMs - Threshold in milliseconds (default: 60 seconds)
 * @returns true if token expires within threshold
 */
export const isTokenExpiringSoon = (
  expiresAt: string | null,
  thresholdMs: number = 60 * 1000
): boolean => {
  if (!expiresAt) return true;

  try {
    const expirationTime = new Date(expiresAt).getTime();
    return Date.now() >= expirationTime - thresholdMs;
  } catch {
    return true;
  }
};

/**
 * Get access token from localStorage
 *
 * Note: With httpOnly cookie migration, tokens are stored in BOTH places:
 * - HttpOnly cookies: Used automatically for API requests (XSS-protected)
 * - localStorage: Used for frontend React state management (this function)
 *
 * This function reads from localStorage for frontend state checks (isAuthenticated, etc.)
 * API requests automatically use httpOnly cookies via withCredentials: true
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
};

/**
 * Get token expiration timestamp from localStorage
 */
export const getTokenExpiresAt = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRES_AT);
};

/**
 * Store all tokens in localStorage
 * @param accessToken
 * @param refreshToken
 * @param expiresAt
 */
export const storeTokens = (
  accessToken: string,
  refreshToken: string,
  expiresAt: string
): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRES_AT, expiresAt);
};

/**
 * Clear all tokens from localStorage
 */
export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRES_AT);
  localStorage.removeItem(TOKEN_KEYS.USER);
};

/**
 * Check if user has valid tokens stored
 */
export const hasValidTokens = (): boolean => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const expiresAt = getTokenExpiresAt();

  // Must have all tokens
  if (!accessToken || !refreshToken || !expiresAt) {
    return false;
  }

  // Check if access token is still valid (not expired)
  // If expired, we can still use refresh token to get new ones
  return true;
};

/**
 * Check if we should attempt a token refresh
 * Returns true if access token is expired but refresh token exists
 */
export const shouldRefreshToken = (): boolean => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const expiresAt = getTokenExpiresAt();

  // No refresh token = can't refresh
  if (!refreshToken) return false;

  // No access token but has refresh = should refresh
  if (!accessToken) return true;

  // Access token expiring soon = should refresh
  return isTokenExpiringSoon(expiresAt, 60 * 1000); // 1 minute threshold
};
