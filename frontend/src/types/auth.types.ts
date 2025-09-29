/**
 * Authentication & Authorization Types
 * Type definitions for user authentication, roles, and permissions
 */

import type { FormHook } from './generic-infrastructure.types';

// User role codes - matching backend constants
export type UserRoleCode = 'admin' | 'organizer' | 'viewer' | 'entity_admin' | 'entity_staff' | 'platform_admin' | 'organizer_admin';

// Permission type - matches backend permission system
export type Permission =
  | 'manage_events' | 'manage_users' | 'manage_categories' | 'manage_locations' | 'manage_organization'
  | 'view_analytics' | 'access_admin' | 'approve_events'
  | 'events.create' | 'events.update' | 'events.delete' | 'events.feature' | 'events.approve';

// Core entity interfaces (cannot be reduced further)
export interface Organization {
  id: number;
  name: string;
  type?: 'government' | 'business' | 'nonprofit' | 'other';
}

export interface Role {
  id: number;
  name: string;
  role_name?: string;
  role_code: UserRoleCode;
  description: string;
  permissions: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  permissions?: Permission[];
  organization?: Organization;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Inline types for simple data structures
export type LoginCredentials = { email: string; password: string };
export type LoginResponse = { token: string; user: User; message?: string };

/**
 * Universal Auth Context - consolidates all auth state and actions
 */
export interface AuthContextType extends Record<string, unknown> {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;

  // Permission methods
  hasRole: (role: UserRoleCode) => boolean;
  canAccess: (resource: string) => boolean;
  getUserPermissions: () => Permission[];
  canManageEvents: () => boolean;
  canApproveEvents: () => boolean;
  canAccessAdmin: () => boolean;
  canManageUsers: () => boolean;
  canManageOrganization: () => boolean;
  canViewAnalytics: () => boolean;
}

// Use generic form handler for login form with handleSubmit alias
export type UseLoginFormReturn = FormHook<LoginCredentials> & {
  handleSubmit?: (e?: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

// Permission mappings (consolidated)
export const RESOURCE_PERMISSIONS: Record<string, Permission[]> = {
  'admin': ['access_admin'],
  'users': ['manage_users'],
  'events': ['manage_events'],
  'categories': ['manage_categories'],
  'locations': ['manage_locations'],
  'organization': ['manage_organization'],
  'analytics': ['view_analytics'],
};

// Role permissions (essential for business logic)
export const ROLE_PERMISSIONS: Record<UserRoleCode, Permission[]> = {
  'admin': ['access_admin', 'manage_events', 'manage_users', 'manage_categories', 'manage_locations', 'manage_organization', 'view_analytics', 'events.create', 'events.update', 'events.delete', 'events.feature', 'events.approve'],
  'organizer': ['manage_events', 'events.create', 'events.update', 'events.delete'],
  'viewer': [],
  'entity_admin': ['manage_events', 'manage_users', 'manage_organization'],
  'entity_staff': ['manage_events'],
  'platform_admin': ['access_admin', 'manage_events', 'manage_users', 'manage_categories', 'manage_locations', 'manage_organization', 'view_analytics'],
  'organizer_admin': ['manage_events', 'events.approve']
};