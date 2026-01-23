/**
 * Permission Gate Component
 * Conditional rendering based on user permissions
 */

'use client';

import { ReactNode } from 'react';

import { usePermissions } from '@/hooks/usePermissions';
import { Permission,UserRoleCode } from '@/types/auth.types';

interface PermissionGateProps {
  children: ReactNode;
  
  // Permission-based access
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // For permissions array, require all or just one
  
  // Role-based access
  role?: UserRoleCode;
  roles?: UserRoleCode[];
  
  // Resource-based access
  resource?: string;
  
  // Organization-based access
  organizationId?: number;
  
  // Fallback content when access is denied
  fallback?: ReactNode;
  
  // Show loading state
  showLoading?: boolean;
}

export const PermissionGate = ({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  resource,
  organizationId,
  fallback = null,
  showLoading = false,
}: PermissionGateProps) => {
  const {
    can,
    hasRole,
    hasAnyRole,
    canAccess,
    belongsToOrganization,
    currentUser,
  } = usePermissions();

  // Show loading state if user data is not yet loaded
  if (showLoading && !currentUser) {
    return <div className="animate-pulse bg-gray-200 rounded h-4 w-full"></div>;
  }

  // If no user is logged in, deny access
  if (!currentUser) {
    return <>{fallback}</>;
  }

  let hasAccess = true;

  // Check single permission
  if (permission && !can(permission)) {
    hasAccess = false;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    if (requireAll) {
      // User must have ALL permissions
      hasAccess = permissions.every(perm => can(perm));
    } else {
      // User must have at least ONE permission
      hasAccess = permissions.some(perm => can(perm));
    }
  }

  // Check single role
  if (role && !hasRole(role)) {
    hasAccess = false;
  }

  // Check multiple roles (user must have at least one)
  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    hasAccess = false;
  }

  // Check resource access
  if (resource && !canAccess(resource)) {
    hasAccess = false;
  }

  // Check organization access
  if (organizationId && !belongsToOrganization(organizationId)) {
    hasAccess = false;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;