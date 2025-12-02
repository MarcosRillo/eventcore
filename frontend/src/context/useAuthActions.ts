/**
 * Authentication Actions Hook
 * All authentication business logic and side effects
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import apiClient from '@/services/apiClient';
import {
  getAccessToken,
  storeTokens,
  clearTokens,
} from '@/services/tokenUtils';
import {
  User,
  LoginCredentials,
  LoginResponse,
  AuthContextType,
  UserRoleCode,
  Permission,
  ROLE_PERMISSIONS,
  RESOURCE_PERMISSIONS,
  TOKEN_KEYS
} from '@/types/auth.types';

export const useAuthActions = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Prevent multiple initialization attempts (React Strict Mode)
  const hasInitialized = useRef(false);

  // Initialize authentication state on app load
  useEffect(() => {
    // CRITICAL FIX: Prevent multiple executions
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    const initializeAuth = async () => {
      try {
        const storedToken = getAccessToken();
        const storedUser = localStorage.getItem(TOKEN_KEYS.USER);

        if (storedToken && storedUser && storedUser !== 'undefined') {
          try {
            const parsedUser = JSON.parse(storedUser);
            setTokenState(storedToken);
            setUser(parsedUser);

            // Validate token by making a test request
            // If 401, apiClient interceptor will auto-refresh
            try {
              await apiClient.get('/auth/me');
            } catch {
              // Token is invalid and refresh failed, clear auth state
              handleLogout();
            }
          } catch {
            handleLogout();
          }
        }
      } catch {
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Internal logout helper
  const handleLogout = () => {
    clearTokens();
    setTokenState(null);
    setUser(null);
    setError(null);

    // Clear cookies (including new token_expires_at cookie)
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'token_expires_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post<{ data: LoginResponse }>('/auth/login', credentials);

      // Handle nested response structure: response.data.data
      if (!response.data?.data) {
        throw new Error('Invalid response structure from login API');
      }

      const { access_token, refresh_token, expires_at, user: userData } = response.data.data;

      // Validate that we have the required data
      if (!access_token || !refresh_token || !userData) {
        throw new Error('Missing token or user data in login response');
      }

      // Store all tokens in localStorage
      storeTokens(access_token, refresh_token, expires_at);
      localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(userData));

      // Calculate cookie max-age based on token expiry (sync with backend)
      const expiresAtTime = new Date(expires_at).getTime();
      const maxAgeSeconds = Math.max(0, Math.floor((expiresAtTime - Date.now()) / 1000));

      // Determine if we're in production (HTTPS) for secure cookie flag
      const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const secureFlag = isProduction ? '; secure' : '';

      // Store in cookies for middleware access (access token for API, user for role checks)
      document.cookie = `token=${access_token}; path=/; max-age=${maxAgeSeconds}; samesite=strict${secureFlag}`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${maxAgeSeconds}; samesite=strict${secureFlag}`;
      document.cookie = `token_expires_at=${encodeURIComponent(expires_at)}; path=/; max-age=${maxAgeSeconds}; samesite=strict${secureFlag}`;

      // Update state
      setTokenState(access_token);
      setUser(userData);

      return true;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;

      let errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo.';

      if (axiosError.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (axiosError.response?.status === 422) {
        const errors = axiosError.response.data.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
        }
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      }

      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Public logout function
  const logout = () => {
    handleLogout();
    router.push('/login');
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      if (!token) return;

      const response = await apiClient.get<{ data: { user: User } }>('/auth/me');

      // Handle nested response structure
      if (!response.data?.data?.user) {
        throw new Error('Invalid response structure from user API');
      }

      const userData = response.data.data.user;

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch {
      // Token is invalid or expired - clear auth state and redirect to login
      handleLogout();
      router.push('/login');
    }
  };

  // Role & Permission Methods
  const hasRole = (role: UserRoleCode): boolean => {
    return user?.role?.role_code === role;
  };

  const getUserPermissions = (): Permission[] => {
    if (!user?.role?.role_code) return [];
    
    // If user has explicit permissions, use those; otherwise use role-based permissions
    if (user.permissions && user.permissions.length > 0) {
      return user.permissions;
    }
    
    return ROLE_PERMISSIONS[user.role.role_code] || [];
  };

  const canAccess = (resource: string): boolean => {
    const userPermissions = getUserPermissions();
    const requiredPermissions = RESOURCE_PERMISSIONS[resource] || [];
    
    // Check if user has any of the required permissions
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  };

  /**
   * Check if user can manage events (create, edit, delete)
   * Includes: manage_entity_events, manage_own_events, create_events
   */
  const canManageEvents = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.some(p =>
      ['manage_entity_events', 'manage_own_events', 'create_events'].includes(p)
    );
  };

  /**
   * Check if user can approve/reject events
   * Only entity_admin has this permission
   */
  const canApproveEvents = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes('approve_events');
  };

  /**
   * Check if user can access admin panel
   * platform_admin and entity_admin can access
   */
  const canAccessAdmin = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.some(p =>
      ['manage_platform', 'manage_entity_events', 'approve_events'].includes(p)
    );
  };

  /**
   * Check if user can manage users
   * platform_admin: manage_users (all users)
   * entity_admin: manage_entity_users (users in their entity)
   */
  const canManageUsers = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.some(p =>
      ['manage_users', 'manage_entity_users'].includes(p)
    );
  };

  /**
   * Check if user can manage organizations
   * Only platform_admin has this permission
   */
  const canManageOrganization = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes('manage_organizations');
  };

  /**
   * Check if user can view analytics
   * entity_admin: view_analytics (entity-wide)
   * organizer_admin: view_own_analytics (own events only)
   */
  const canViewAnalytics = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.some(p =>
      ['view_analytics', 'view_own_analytics'].includes(p)
    );
  };

  return {
    // State
    user,
    token,
    isLoading,
    error,
    isAuthenticated: Boolean(user && token),

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
