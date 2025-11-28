/**
 * Authentication & Authorization Types
 * Type definitions for user authentication, roles, and permissions
 *
 * IMPORTANT: Roles and permissions are synchronized with backend (source of truth)
 * Backend: database/seeders/UserRolesSeeder.php
 */

import type { FormHook } from './generic-infrastructure.types';

/**
 * User role codes - MUST match backend user_roles.role_code
 *
 * | Code            | Name                   | Description                    |
 * |-----------------|------------------------|--------------------------------|
 * | platform_admin  | Platform Administrator | SuperAdmin - full platform access |
 * | entity_admin    | Entity Administrator   | Ente de Turismo - approves events |
 * | entity_staff    | Entity Staff           | Staff with limited permissions |
 * | organizer_admin | Event Organizer        | External organizers (La Rural, etc.) |
 */
export type UserRoleCode =
  | 'platform_admin'
  | 'entity_admin'
  | 'entity_staff'
  | 'organizer_admin';

/**
 * Permission type - matches backend user_roles.permissions
 *
 * Backend permissions (from UserRolesSeeder):
 * - manage_platform: Full platform configuration
 * - manage_organizations: CRUD organizations
 * - manage_users: CRUD users
 * - view_all_events: See all events across organizations
 * - manage_entity_events: Manage events within entity
 * - approve_events: Approve/reject event submissions
 * - manage_entity_users: Manage users within entity
 * - view_analytics: Access analytics dashboard
 * - create_events: Create new events
 * - edit_own_events: Edit own events only
 * - view_entity_events: View events within entity
 * - manage_own_events: Full control of own events
 * - view_own_analytics: View own analytics only
 */
export type Permission =
  // Platform-level permissions
  | 'manage_platform'
  | 'manage_organizations'
  | 'manage_users'
  | 'view_all_events'
  // Entity-level permissions
  | 'manage_entity_events'
  | 'approve_events'
  | 'manage_entity_users'
  | 'view_analytics'
  // Staff/Organizer permissions
  | 'create_events'
  | 'edit_own_events'
  | 'view_entity_events'
  | 'manage_own_events'
  | 'view_own_analytics';

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

/**
 * Login response with token rotation support
 * access_token: Short-lived token (15min) for API requests
 * refresh_token: Long-lived token (7 days) for obtaining new access tokens
 * expires_at: ISO timestamp when access token expires
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  user: User;
  message?: string;
}

/**
 * Refresh token response
 * Returns new access and refresh tokens (token rotation)
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

/**
 * Token storage keys
 */
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_EXPIRES_AT: 'tokenExpiresAt',
  USER: 'user',
} as const;

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
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

/**
 * Resource to permission mapping
 * Used by canAccess() to check if user can access a resource
 */
export const RESOURCE_PERMISSIONS: Record<string, Permission[]> = {
  'platform': ['manage_platform'],
  'organizations': ['manage_organizations'],
  'users': ['manage_users', 'manage_entity_users'],
  'events': ['manage_entity_events', 'create_events', 'manage_own_events'],
  'analytics': ['view_analytics', 'view_own_analytics'],
  'approval': ['approve_events'],
};

/**
 * Role permissions - MUST match backend user_roles.permissions
 * Source: database/seeders/UserRolesSeeder.php
 *
 * This is used as fallback when permissions are not included in user response
 */
export const ROLE_PERMISSIONS: Record<UserRoleCode, Permission[]> = {
  'platform_admin': [
    'manage_platform',
    'manage_organizations',
    'manage_users',
    'view_all_events',
  ],
  'entity_admin': [
    'manage_entity_events',
    'approve_events',
    'manage_entity_users',
    'view_analytics',
  ],
  'entity_staff': [
    'create_events',
    'edit_own_events',
    'view_entity_events',
  ],
  'organizer_admin': [
    'create_events',
    'manage_own_events',
    'view_own_analytics',
  ],
};