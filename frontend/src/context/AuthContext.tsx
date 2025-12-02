/**
 * Authentication Context
 * Provides authentication state and actions to child components
 * Logic is handled by useAuthActions hook
 */

'use client';

import { createContext, useContext, ReactNode, useMemo, useRef } from 'react';
import { useAuthActions } from './useAuthActions';
import { AuthContextType } from '@/types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const authState = useAuthActions();

  // Ref to track previous state and prevent unnecessary context updates
  // when only function references change (functions aren't memoized in useAuthActions)
  const prevContextValue = useRef<AuthContextType | null>(null);

  const contextValue: AuthContextType = useMemo(() => {
    const newContextValue: AuthContextType = {
      // State
      user: authState.user,
      token: authState.token,
      isAuthenticated: Boolean(authState.user && authState.token),
      isLoading: authState.isLoading,
      error: authState.error,

      // Actions (always current)
      login: authState.login,
      logout: authState.logout,
      clearError: authState.clearError,
      refreshUser: authState.refreshUser,

      // Role & Permission Methods (always current)
      hasRole: authState.hasRole,
      canAccess: authState.canAccess,
      getUserPermissions: authState.getUserPermissions,
      canManageEvents: authState.canManageEvents,
      canApproveEvents: authState.canApproveEvents,
      canAccessAdmin: authState.canAccessAdmin,
      canManageUsers: authState.canManageUsers,
      canManageOrganization: authState.canManageOrganization,
      canViewAnalytics: authState.canViewAnalytics,
    };

    // Check if the STATE actually changed
    const prevValue = prevContextValue.current;
    if (prevValue &&
        prevValue.user === newContextValue.user &&
        prevValue.token === newContextValue.token &&
        prevValue.isLoading === newContextValue.isLoading &&
        prevValue.error === newContextValue.error) {

      // Update functions but keep same object reference for state
      return {
        ...prevValue,
        // Update functions to current ones
        login: newContextValue.login,
        logout: newContextValue.logout,
        clearError: newContextValue.clearError,
        refreshUser: newContextValue.refreshUser,
        hasRole: newContextValue.hasRole,
        canAccess: newContextValue.canAccess,
        getUserPermissions: newContextValue.getUserPermissions,
        canManageEvents: newContextValue.canManageEvents,
        canApproveEvents: newContextValue.canApproveEvents,
        canAccessAdmin: newContextValue.canAccessAdmin,
        canManageUsers: newContextValue.canManageUsers,
        canManageOrganization: newContextValue.canManageOrganization,
        canViewAnalytics: newContextValue.canViewAnalytics,
      };
    }

    prevContextValue.current = newContextValue;
    return newContextValue;
  }, [
    authState.user,
    authState.token,
    authState.isLoading,
    authState.error,
    authState.login,
    authState.logout,
    authState.clearError,
    authState.refreshUser,
    authState.hasRole,
    authState.canAccess,
    authState.getUserPermissions,
    authState.canManageEvents,
    authState.canApproveEvents,
    authState.canAccessAdmin,
    authState.canManageUsers,
    authState.canManageOrganization,
    authState.canViewAnalytics,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
