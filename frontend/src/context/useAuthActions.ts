/**
 * Authentication Actions Hook
 *
 * SECURITY: Uses httpOnly cookies for authentication (XSS protection)
 * - NO tokens stored in localStorage
 * - Cookies are set/cleared by backend automatically
 * - Authentication state is validated by calling /auth/me
 */

import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback,useEffect, useRef, useState } from 'react';

import apiClient from '@/services/apiClient';
import { clearTokens } from '@/services/tokenUtils';
import {
  AuthContextType,
  LoginCredentials,
  LoginResponse,
  Permission,
  RESOURCE_PERMISSIONS,
  ROLE_PERMISSIONS,
  User,
  UserRoleCode,
} from '@/types/auth.types';

export const useAuthActions = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Prevent multiple initialization attempts (React Strict Mode)
  const hasInitialized = useRef(false);

  /**
   * Clear all authentication state
   */
  const handleLogout = useCallback(() => {
    // Clear any legacy localStorage items
    clearTokens();
    setUser(null);
    setError(null);

    // Clear non-httpOnly user cookie used by middleware
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'token_expires_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }, []);

  /**
   * Initialize auth state by checking if user is authenticated
   * Uses httpOnly cookie (sent automatically by browser)
   */
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeAuth = async () => {
      // Optimistic check: skip API call if no session indicator exists
      // The 'user' cookie (non-httpOnly) is set during login alongside httpOnly tokens
      const hasSessionCookie = document.cookie
        .split(';')
        .some(c => c.trim().startsWith('user='));

      if (!hasSessionCookie) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Cookie exists — validate session with backend
        const response = await apiClient.get<{ data: User }>('/auth/me');

        if (response.data?.data) {
          setUser(response.data.data);
        }
      } catch (error) {
        // Only logout on auth failures (401/403). Network errors and 5xx
        // MUST NOT clear the session — they are transient, not auth failures.
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        if (status === 401 || status === 403) {
          handleLogout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [handleLogout]);

  /**
   * Login with credentials
   * Backend sets httpOnly cookies automatically
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post<{ data: LoginResponse }>('/auth/login', credentials);

      if (!response.data?.data) {
        throw new Error('Invalid response structure from login API');
      }

      const { user: userData, expires_at } = response.data.data;

      if (!userData) {
        throw new Error('Missing user data in login response');
      }

      // Set non-httpOnly user cookie for Next.js middleware (role checks)
      // This cookie only contains non-sensitive user info
      // max-age matches refresh_token TTL (7 days) so the cookie survives access_token rotation
      const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 604800 seconds — matches refresh_token httpOnly cookie
      document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
      document.cookie = `token_expires_at=${encodeURIComponent(expires_at)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;

      // Update state
      setUser(userData);

      // Note: access_token and refresh_token are set as httpOnly cookies by backend

      return true;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;

      let errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo.';

      if (axiosError.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (axiosError.response?.status === 403) {
        // Account blocked
        errorMessage = 'Tu cuenta ha sido bloqueada. Contacta a soporte para más información.';
      } else if (axiosError.response?.status === 429) {
        // Rate limiting
        errorMessage = 'Demasiados intentos. Por favor, espera unos minutos antes de intentar de nuevo.';
      } else if (axiosError.response?.status === 422) {
        const errors = axiosError.response.data.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
        }
      } else if (axiosError.response?.status === 503) {
        // Service unavailable
        errorMessage = 'El servicio no está disponible en este momento. Intenta más tarde.';
      } else if (!axiosError.response) {
        // Network error (no response from server)
        errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.';
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      }

      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   * Backend clears httpOnly cookies
   */
  const logout = async () => {
    try {
      // Call backend to clear httpOnly cookies
      await apiClient.post('/auth/logout');
    } catch {
      // Even if logout endpoint fails, clear local state
    } finally {
      handleLogout();
      router.push('/login');
    }
  };

  const clearError = () => {
    setError(null);
  };

  /**
   * Refresh user data from server
   * @returns true if user was successfully refreshed, false otherwise
   */
  const refreshUser = async (): Promise<boolean> => {
    try {
      const response = await apiClient.get<{ data: User }>('/auth/me');

      if (response.data?.data) {
        const userData = response.data.data;
        setUser(userData);

        // Update user cookie for middleware
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const maxAgeSeconds = 7 * 24 * 60 * 60;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
        return true;
      }
      return false;
    } catch {
      handleLogout();
      // Don't redirect - caller decides navigation based on context
      return false;
    }
  };

  // Role & Permission Methods
  const hasRole = (role: UserRoleCode): boolean => {
    return user?.role?.role_code === role;
  };

  const getUserPermissions = (): Permission[] => {
    if (!user?.role?.role_code) return [];

    if (user.permissions && user.permissions.length > 0) {
      return user.permissions;
    }

    return ROLE_PERMISSIONS[user.role.role_code] || [];
  };

  const canAccess = (resource: string): boolean => {
    const userPermissions = getUserPermissions();
    const requiredPermissions = RESOURCE_PERMISSIONS[resource] || [];

    return requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );
  };

  const canManageEvents = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.some(p =>
      ['manage_entity_events', 'manage_own_events', 'create_events'].includes(p)
    );
  };

  const canApproveEvents = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes('approve_events');
  };

  const canAccessAdmin = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.some(p =>
      ['manage_platform', 'manage_entity_events', 'approve_events'].includes(p)
    );
  };

  const canManageUsers = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.some(p =>
      ['manage_users', 'manage_entity_users'].includes(p)
    );
  };

  const canManageOrganization = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes('manage_organizations');
  };

  const canViewAnalytics = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.some(p =>
      ['view_analytics', 'view_own_analytics'].includes(p)
    );
  };

  return {
    // State
    user,
    token: null,  // Deprecated: tokens are in httpOnly cookies
    isLoading,
    error,
    isAuthenticated: Boolean(user),

    // Actions
    login,
    logout,
    clearError,
    refreshUser,

    // Role & Permission Methods
    hasRole,
    canAccess,
    getUserPermissions,
    canManageEvents,
    canApproveEvents,
    canAccessAdmin,
    canManageUsers,
    canManageOrganization,
    canViewAnalytics,
  };
};
