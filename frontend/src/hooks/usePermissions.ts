/**
 * Permission Hook
 * Simplified hook for checking permissions in components
 */

import { useAuth } from '@/context/AuthContext';
import { Permission,UserRoleCode } from '@/types/auth.types';

export const usePermissions = () => {
  const {
    hasRole,
    canAccess,
    getUserPermissions,
    canManageEvents,
    canApproveEvents,
    canAccessAdmin,
    canManageUsers,
    canManageOrganization,
    canViewAnalytics,
    user
  } = useAuth();

  /**
   * Check if current user can perform a specific action
   * @param permission
   */
  const can = (permission: Permission): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes(permission);
  };

  /**
   * Check if current user has any of the specified roles
   * @param roles
   */
  const hasAnyRole = (roles: UserRoleCode[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  /**
   * Check if current user is admin (any type)
   */
  const isAdmin = (): boolean => {
    return hasAnyRole(['platform_admin', 'entity_admin']);
  };

  /**
   * Check if current user is platform admin
   */
  const isPlatformAdmin = (): boolean => {
    return hasRole('platform_admin');
  };

  /**
   * Check if current user is entity admin
   */
  const isEntityAdmin = (): boolean => {
    return hasRole('entity_admin');
  };

  /**
   * Check if current user is staff
   */
  const isStaff = (): boolean => {
    return hasRole('entity_staff');
  };

  /**
   * Check if current user is organizer
   */
  const isOrganizer = (): boolean => {
    return hasRole('organizer_admin');
  };

  /**
   * Get user's organization info
   */
  const getOrganization = () => {
    return user?.organization || null;
  };

  /**
   * Check if user belongs to a specific organization
   * @param organizationId
   */
  const belongsToOrganization = (organizationId: number): boolean => {
    return user?.organization?.id === organizationId;
  };

  return {
    // Basic permission checks
    can,
    hasRole,
    hasAnyRole,
    canAccess,
    getUserPermissions,

    // Role checks
    isAdmin,
    isPlatformAdmin,
    isEntityAdmin,
    isStaff,
    isOrganizer,

    // Specific feature permissions
    canManageEvents,
    canApproveEvents,
    canAccessAdmin,
    canManageUsers,
    canManageOrganization,
    canViewAnalytics,

    // Organization helpers
    getOrganization,
    belongsToOrganization,

    // Current user info
    currentUser: user,
    currentRole: user?.role || null,
  };
};

export default usePermissions;