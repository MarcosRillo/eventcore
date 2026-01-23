/**
 * Tests for usePermissions Hook
 *
 * Coverage areas:
 * 1. can() - single permission check
 * 2. hasRole() - role verification
 * 3. hasAnyRole() - multiple roles (OR logic)
 * 4. Role helpers (isAdmin, isPlatformAdmin, isEntityAdmin, etc.)
 * 5. Organization helpers (getOrganization, belongsToOrganization)
 * 6. Edge cases (no user, null permissions)
 */

import { renderHook } from '@testing-library/react';

import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { AuthContextType,Permission, User, UserRoleCode } from '@/types/auth.types';

// Mock AuthContext
jest.mock('@/context/AuthContext');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Helper to create complete AuthContext mock
const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn(),
  refreshUser: jest.fn(),
  getUserPermissions: jest.fn().mockReturnValue([]),
  hasRole: jest.fn(),
  canAccess: jest.fn(),
  canManageEvents: jest.fn(),
  canApproveEvents: jest.fn(),
  canAccessAdmin: jest.fn(),
  canManageUsers: jest.fn(),
  canManageOrganization: jest.fn(),
  canViewAnalytics: jest.fn(),
  ...overrides,
});

describe('usePermissions Hook', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // PERMISSION CHECKS
  // ============================================================

  describe('Permission Checks', () => {

    test('can() should check single permission correctly', () => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { id: 1, name: 'Entity Admin', role_code: 'entity_admin' as UserRoleCode, description: '', permissions: [], created_at: '', updated_at: '' },
        created_at: '',
        updated_at: '',
      };

      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: mockUser,
        getUserPermissions: jest.fn().mockReturnValue(['manage_entity_events', 'approve_events', 'view_analytics'] as Permission[]),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.can('manage_entity_events' as Permission)).toBe(true);
      expect(result.current.can('approve_events' as Permission)).toBe(true);
      expect(result.current.can('manage_users' as Permission)).toBe(false);
    });

    test('getUserPermissions should return user permissions', () => {
      const mockPermissions: Permission[] = ['manage_entity_events', 'approve_events'];

      mockUseAuth.mockReturnValue(createMockAuthContext({
        getUserPermissions: jest.fn().mockReturnValue(mockPermissions),
        hasRole: jest.fn(),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.getUserPermissions()).toEqual(mockPermissions);
    });
  });

  // ============================================================
  // ROLE CHECKS
  // ============================================================

  describe('Role Checks', () => {

    test('hasRole should verify specific role', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        hasRole: jest.fn((role: UserRoleCode) => role === 'entity_admin'),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasRole('entity_admin' as UserRoleCode)).toBe(true);
      expect(result.current.hasRole('platform_admin' as UserRoleCode)).toBe(false);
    });

    test('hasAnyRole should check multiple roles (OR logic)', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        hasRole: jest.fn((role: UserRoleCode) => role === 'entity_admin'),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      // Should return true if user has at least one role
      expect(result.current.hasAnyRole(['entity_admin', 'platform_admin'] as UserRoleCode[])).toBe(true);
      expect(result.current.hasAnyRole(['platform_admin', 'organizer_admin'] as UserRoleCode[])).toBe(false);
    });

    test('isAdmin should return true for admin roles', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        hasRole: jest.fn((role: UserRoleCode) => role === 'entity_admin'),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isAdmin()).toBe(true);
    });

    test('isPlatformAdmin should check platform admin role', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        hasRole: jest.fn((role: UserRoleCode) => role === 'platform_admin'),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isPlatformAdmin()).toBe(true);
      expect(result.current.isEntityAdmin()).toBe(false);
    });

    test('isEntityAdmin should check entity admin role', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        hasRole: jest.fn((role: UserRoleCode) => role === 'entity_admin'),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isEntityAdmin()).toBe(true);
      expect(result.current.isPlatformAdmin()).toBe(false);
    });

    test('isStaff should check staff role', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        hasRole: jest.fn((role: UserRoleCode) => role === 'entity_staff'),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isStaff()).toBe(true);
      expect(result.current.isAdmin()).toBe(false);
    });

    test('isOrganizer should check organizer role', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        hasRole: jest.fn((role: UserRoleCode) => role === 'organizer_admin'),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isOrganizer()).toBe(true);
      expect(result.current.isAdmin()).toBe(false);
    });
  });

  // ============================================================
  // FEATURE PERMISSIONS
  // ============================================================

  describe('Feature Permissions', () => {

    test('should expose feature-specific permission checks', () => {
      const mockCanManageEvents = jest.fn().mockReturnValue(true);
      const mockCanApproveEvents = jest.fn().mockReturnValue(true);
      const mockCanAccessAdmin = jest.fn().mockReturnValue(true);

      mockUseAuth.mockReturnValue(createMockAuthContext({
        hasRole: jest.fn(),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: mockCanManageEvents,
        canApproveEvents: mockCanApproveEvents,
        canAccessAdmin: mockCanAccessAdmin,
        canManageUsers: jest.fn().mockReturnValue(false),
        canManageOrganization: jest.fn().mockReturnValue(false),
        canViewAnalytics: jest.fn().mockReturnValue(true),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canManageEvents()).toBe(true);
      expect(result.current.canApproveEvents()).toBe(true);
      expect(result.current.canAccessAdmin()).toBe(true);
      expect(result.current.canManageUsers()).toBe(false);
      expect(result.current.canViewAnalytics()).toBe(true);
    });
  });

  // ============================================================
  // ORGANIZATION HELPERS
  // ============================================================

  describe('Organization Helpers', () => {

    test('getOrganization should return user organization', () => {
      const mockOrganization = { id: 1, name: 'Test Org' };
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { id: 1, name: "Role", role_code: 'entity_admin' as UserRoleCode, description: "", permissions: [], created_at: "", updated_at: "" },
        created_at: "",
        updated_at: "",
        organization: mockOrganization,
      };

      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: mockUser,
        hasRole: jest.fn(),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.getOrganization()).toEqual(mockOrganization);
    });

    test('getOrganization should return null when no organization', () => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { id: 1, name: "Role", role_code: 'platform_admin' as UserRoleCode, description: "", permissions: [], created_at: "", updated_at: "" },
      created_at: "",
      updated_at: "",
      };

      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: mockUser,
        hasRole: jest.fn(),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.getOrganization()).toBeNull();
    });

    test('belongsToOrganization should verify organization membership', () => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { id: 1, name: "Role", role_code: 'entity_admin' as UserRoleCode, description: "", permissions: [], created_at: "", updated_at: "" },
        created_at: "",
        updated_at: "",
        organization: { id: 5, name: 'Test Org' },
      };

      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: mockUser,
        hasRole: jest.fn(),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.belongsToOrganization(5)).toBe(true);
      expect(result.current.belongsToOrganization(10)).toBe(false);
    });

    test('belongsToOrganization should return false when no organization', () => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { id: 1, name: "Role", role_code: 'platform_admin' as UserRoleCode, description: "", permissions: [], created_at: "", updated_at: "" },
      created_at: "",
      updated_at: "",
      };

      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: mockUser,
        hasRole: jest.fn(),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.belongsToOrganization(5)).toBe(false);
    });
  });

  // ============================================================
  // CURRENT USER INFO
  // ============================================================

  describe('Current User Info', () => {

    test('should expose current user', () => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { id: 1, name: "Role", role_code: 'entity_admin' as UserRoleCode, description: "", permissions: [], created_at: "", updated_at: "" },
      created_at: "",
      updated_at: "",
      };

      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: mockUser,
        hasRole: jest.fn(),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.currentUser).toEqual(mockUser);
      expect(result.current.currentRole).toEqual(mockUser.role);
    });

    test('should handle null user', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: null,
        hasRole: jest.fn(),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.currentUser).toBeNull();
      expect(result.current.currentRole).toBeNull();
    });
  });

  // ============================================================
  // EDGE CASES
  // ============================================================

  describe('Edge Cases', () => {

    test('should handle no user gracefully', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: null,
        hasRole: jest.fn().mockReturnValue(false),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn().mockReturnValue(false),
        canManageEvents: jest.fn().mockReturnValue(false),
        canApproveEvents: jest.fn().mockReturnValue(false),
        canAccessAdmin: jest.fn().mockReturnValue(false),
        canManageUsers: jest.fn().mockReturnValue(false),
        canManageOrganization: jest.fn().mockReturnValue(false),
        canViewAnalytics: jest.fn().mockReturnValue(false),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.can('manage_events' as Permission)).toBe(false);
      expect(result.current.hasRole('entity_admin' as UserRoleCode)).toBe(false);
      expect(result.current.isAdmin()).toBe(false);
      expect(result.current.getOrganization()).toBeNull();
    });

    test('should handle empty permissions array', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: { id: 1, name: 'User', email: 'test@example.com', role: { id: 1, name: "Role", role_code: 'entity_staff' as UserRoleCode, description: "", permissions: [], created_at: "", updated_at: "" }, created_at: "", updated_at: "", organization: undefined },
        hasRole: jest.fn().mockReturnValue(true),
        getUserPermissions: jest.fn().mockReturnValue([]),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.can('manage_events' as Permission)).toBe(false);
      expect(result.current.getUserPermissions()).toEqual([]);
    });

    test('should handle undefined role', () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      } as User;

      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: mockUser,
        hasRole: jest.fn(),
        getUserPermissions: jest.fn().mockReturnValue([]),
        canAccess: jest.fn(),
        canManageEvents: jest.fn(),
        canApproveEvents: jest.fn(),
        canAccessAdmin: jest.fn(),
        canManageUsers: jest.fn(),
        canManageOrganization: jest.fn(),
        canViewAnalytics: jest.fn(),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.currentRole).toBeNull();
    });
  });
});
