/**
 * Token Utilities (DEPRECATED)
 *
 * SECURITY MIGRATION: This file is maintained for backward compatibility only.
 * All token storage now uses httpOnly cookies managed by the backend.
 *
 * httpOnly cookies provide XSS protection because JavaScript cannot access them.
 * The browser automatically sends cookies with requests when withCredentials: true.
 *
 * MIGRATION NOTES:
 * - getAccessToken() → Always returns null (tokens are in httpOnly cookies)
 * - storeTokens() → No-op (backend sets cookies automatically)
 * - clearTokens() → Clears legacy localStorage items (cookies cleared by backend)
 */

import { TOKEN_KEYS } from '@/types/auth.types';

/**
 * @deprecated Tokens are now stored in httpOnly cookies (XSS protection)
 * This function always returns null. Authentication is handled via cookies.
 */
export const getAccessToken = (): string | null => {
  // httpOnly cookies cannot be read from JavaScript - this is by design
  // The browser sends cookies automatically with requests
  return null;
};

/**
 * @deprecated Tokens are now stored in httpOnly cookies (XSS protection)
 * This function always returns null. Authentication is handled via cookies.
 */
export const getRefreshToken = (): string | null => {
  // httpOnly cookies cannot be read from JavaScript - this is by design
  return null;
};

/**
 * @deprecated Token expiration is managed by backend cookies
 */
export const getTokenExpiresAt = (): string | null => {
  return null;
};

/**
 * Check if a token is expired based on its expiration timestamp
 * @deprecated Use backend validation instead
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
 * @deprecated Token refresh is handled automatically by apiClient
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
 * @deprecated Tokens are now stored in httpOnly cookies by backend
 * This function is a no-op. Backend sets cookies on login/refresh.
 */
export const storeTokens = (
  _accessToken: string,
  _refreshToken: string,
  _expiresAt: string
): void => {
  // No-op: Backend sets httpOnly cookies automatically
  // This function is kept for backward compatibility
};

/**
 * Clear any legacy localStorage items
 * Note: httpOnly cookies are cleared by backend on logout
 */
export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;

  // Clear any legacy localStorage items that might exist
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRES_AT);
  localStorage.removeItem(TOKEN_KEYS.USER);
};

/**
 * @deprecated Cannot check httpOnly cookies from JavaScript
 * Use AuthContext.isAuthenticated instead
 */
export const hasValidTokens = (): boolean => {
  // Cannot check httpOnly cookies from JavaScript
  // This is intentional for XSS protection
  return false;
};

/**
 * @deprecated Token refresh is handled automatically by apiClient
 */
export const shouldRefreshToken = (): boolean => {
  // Cannot check httpOnly cookies from JavaScript
  return false;
};
