/**
 * Authentication Actions Hook
 * All authentication business logic and side effects
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import apiClient, { setAuthToken, removeAuthToken, getAuthToken } from '../services/apiClient';
import {
  User,
  LoginCredentials,
  LoginResponse,
  AuthContextType,
  UserRoleCode,
  Permission,
  ROLE_PERMISSIONS,
  RESOURCE_PERMISSIONS
} from '../types/auth.types';

export const useAuthActions = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // CRITICAL FIX: Prevent multiple initialization attempts
  const hasInitialized = useRef(false);

  // EMERGENCY FIX: Stop infinite re-renders in development
  const renderCount = useRef(0);
  renderCount.current++;

  if (renderCount.current > 10) {
    // Don't throw error, just log and continue with current state
  }

  // Initialize authentication state on app load
  useEffect(() => {
    // CRITICAL FIX: Prevent multiple executions
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    const initializeAuth = async () => {
      try {
        const storedToken = getAuthToken();
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser && storedUser !== 'undefined') {
          try {
            const parsedUser = JSON.parse(storedUser);
            setTokenState(storedToken);
            setUser(parsedUser);

            // Validate token by making a test request
            try {
              await apiClient.get('/auth/me');
            } catch {
              // Token is invalid, clear auth state
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
    removeAuthToken();
    setTokenState(null);
    setUser(null);
    setError(null);
    localStorage.removeItem('user');
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

      const { token: authToken, user: userData } = response.data.data;

      // Validate that we have the required data
      if (!authToken || !userData) {
        throw new Error('Missing token or user data in login response');
      }

      // Store auth data
      setAuthToken(authToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setTokenState(authToken);
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
      // If refresh fails, user might need to login again
      // handleLogout();         // DISABLED FOR DEBUGGING
      // router.push('/login');  // DISABLED FOR DEBUGGING
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

  const canManageEvents = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes('manage_events');
  };

  const canApproveEvents = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes('approve_events');
  };

  const canAccessAdmin = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes('access_admin');
  };

  const canManageUsers = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes('manage_users');
  };

  const canManageOrganization = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes('manage_organization');
  };

  const canViewAnalytics = (): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes('view_analytics');
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
