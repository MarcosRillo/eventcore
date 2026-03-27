/**
 * Authentication Context
 * Provides authentication state and actions to child components
 * Logic is handled by useAuthActions hook
 */

'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAuthActions } from '@/context/useAuthActions';
import { AuthContextType } from '@/types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const authState = useAuthActions();

  const contextValue: AuthContextType = useMemo(() => ({
    // State
    user: authState.user,
    token: authState.token,
    isAuthenticated: Boolean(authState.user),
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
  }), [
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
