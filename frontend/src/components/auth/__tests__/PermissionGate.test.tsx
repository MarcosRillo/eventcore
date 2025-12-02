/**
 * PermissionGate Component Tests
 * Tests for permission-based, role-based, and resource-based access control
 */
import { render, screen } from '@testing-library/react';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';

// Mock usePermissions hook
jest.mock('@/hooks/usePermissions');

const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;

// Helper to create mock user with proper structure
const createMockUser = () => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: {
    id: 4,
    name: 'Organizer Admin',
    role_code: 'organizer_admin' as const,
    description: 'Event organizer administrator',
    permissions: ['create_events', 'edit_own_events', 'manage_own_events'] as ('create_events' | 'edit_own_events' | 'manage_own_events')[],
  },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
});

// Helper to create mock permissions
const createMockPermissions = (overrides: Partial<ReturnType<typeof usePermissions>> = {}) => ({
  can: jest.fn().mockReturnValue(false),
  hasRole: jest.fn().mockReturnValue(false),
  hasAnyRole: jest.fn().mockReturnValue(false),
  canAccess: jest.fn().mockReturnValue(false),
  belongsToOrganization: jest.fn().mockReturnValue(false),
  currentUser: createMockUser(),
  getUserPermissions: jest.fn().mockReturnValue([]),
  isAdmin: jest.fn().mockReturnValue(false),
  isPlatformAdmin: jest.fn().mockReturnValue(false),
  isEntityAdmin: jest.fn().mockReturnValue(false),
  isStaff: jest.fn().mockReturnValue(false),
  isOrganizer: jest.fn().mockReturnValue(false),
  getOrganization: jest.fn().mockReturnValue(null),
  canManageEvents: jest.fn().mockReturnValue(false),
  canApproveEvents: jest.fn().mockReturnValue(false),
  canAccessAdmin: jest.fn().mockReturnValue(false),
  canManageUsers: jest.fn().mockReturnValue(false),
  canManageOrganization: jest.fn().mockReturnValue(false),
  canViewAnalytics: jest.fn().mockReturnValue(false),
  currentRole: createMockUser().role,
  ...overrides,
});

describe('PermissionGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('permission checks', () => {
    it('should render children when user has required permission', () => {
      const mockCan = jest.fn().mockReturnValue(true);
      mockUsePermissions.mockReturnValue(createMockPermissions({ can: mockCan }));

      render(
        <PermissionGate permission="create_events">
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockCan).toHaveBeenCalledWith('create_events');
    });

    it('should render fallback when user lacks required permission', () => {
      const mockCan = jest.fn().mockReturnValue(false);
      mockUsePermissions.mockReturnValue(createMockPermissions({ can: mockCan }));

      render(
        <PermissionGate
          permission="create_events"
          fallback={<div data-testid="fallback">Access Denied</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('should check multiple permissions with requireAll=true', () => {
      const mockCan = jest.fn()
        .mockReturnValueOnce(true)  // create_events
        .mockReturnValueOnce(true); // edit_own_events
      mockUsePermissions.mockReturnValue(createMockPermissions({ can: mockCan }));

      render(
        <PermissionGate permissions={['create_events', 'edit_own_events']} requireAll>
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockCan).toHaveBeenCalledWith('create_events');
      expect(mockCan).toHaveBeenCalledWith('edit_own_events');
    });

    it('should deny access when requireAll=true and user lacks one permission', () => {
      const mockCan = jest.fn()
        .mockReturnValueOnce(true)  // create_events
        .mockReturnValueOnce(false); // edit_own_events
      mockUsePermissions.mockReturnValue(createMockPermissions({ can: mockCan }));

      render(
        <PermissionGate
          permissions={['create_events', 'edit_own_events']}
          requireAll
          fallback={<div data-testid="fallback">Access Denied</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('should grant access with requireAll=false when user has one permission', () => {
      const mockCan = jest.fn()
        .mockReturnValueOnce(false) // create_events
        .mockReturnValueOnce(true); // edit_own_events
      mockUsePermissions.mockReturnValue(createMockPermissions({ can: mockCan }));

      render(
        <PermissionGate permissions={['create_events', 'edit_own_events']} requireAll={false}>
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('role checks', () => {
    it('should render children when user has required role', () => {
      const mockHasRole = jest.fn().mockReturnValue(true);
      mockUsePermissions.mockReturnValue(createMockPermissions({ hasRole: mockHasRole }));

      render(
        <PermissionGate role="entity_admin">
          <div data-testid="protected-content">Admin Content</div>
        </PermissionGate>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockHasRole).toHaveBeenCalledWith('entity_admin');
    });

    it('should render fallback when user lacks required role', () => {
      const mockHasRole = jest.fn().mockReturnValue(false);
      mockUsePermissions.mockReturnValue(createMockPermissions({ hasRole: mockHasRole }));

      render(
        <PermissionGate
          role="platform_admin"
          fallback={<div data-testid="fallback">Not Admin</div>}
        >
          <div data-testid="protected-content">Admin Content</div>
        </PermissionGate>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('should grant access when user has any of multiple roles', () => {
      const mockHasAnyRole = jest.fn().mockReturnValue(true);
      mockUsePermissions.mockReturnValue(createMockPermissions({ hasAnyRole: mockHasAnyRole }));

      render(
        <PermissionGate roles={['entity_admin', 'platform_admin']}>
          <div data-testid="protected-content">Admin Content</div>
        </PermissionGate>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockHasAnyRole).toHaveBeenCalledWith(['entity_admin', 'platform_admin']);
    });

    it('should deny access when user has none of the multiple roles', () => {
      const mockHasAnyRole = jest.fn().mockReturnValue(false);
      mockUsePermissions.mockReturnValue(createMockPermissions({ hasAnyRole: mockHasAnyRole }));

      render(
        <PermissionGate
          roles={['entity_admin', 'platform_admin']}
          fallback={<div data-testid="fallback">Not Admin</div>}
        >
          <div data-testid="protected-content">Admin Content</div>
        </PermissionGate>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });
  });

  describe('resource checks', () => {
    it('should render children when user can access resource', () => {
      const mockCanAccess = jest.fn().mockReturnValue(true);
      mockUsePermissions.mockReturnValue(createMockPermissions({ canAccess: mockCanAccess }));

      render(
        <PermissionGate resource="admin_dashboard">
          <div data-testid="protected-content">Dashboard</div>
        </PermissionGate>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockCanAccess).toHaveBeenCalledWith('admin_dashboard');
    });

    it('should render fallback when user cannot access resource', () => {
      const mockCanAccess = jest.fn().mockReturnValue(false);
      mockUsePermissions.mockReturnValue(createMockPermissions({ canAccess: mockCanAccess }));

      render(
        <PermissionGate
          resource="admin_dashboard"
          fallback={<div data-testid="fallback">No Access</div>}
        >
          <div data-testid="protected-content">Dashboard</div>
        </PermissionGate>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });
  });

  describe('organization checks', () => {
    it('should render children when user belongs to organization', () => {
      const mockBelongsToOrganization = jest.fn().mockReturnValue(true);
      mockUsePermissions.mockReturnValue(createMockPermissions({
        belongsToOrganization: mockBelongsToOrganization
      }));

      render(
        <PermissionGate organizationId={5}>
          <div data-testid="protected-content">Org Content</div>
        </PermissionGate>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockBelongsToOrganization).toHaveBeenCalledWith(5);
    });

    it('should render fallback when user does not belong to organization', () => {
      const mockBelongsToOrganization = jest.fn().mockReturnValue(false);
      mockUsePermissions.mockReturnValue(createMockPermissions({
        belongsToOrganization: mockBelongsToOrganization
      }));

      render(
        <PermissionGate
          organizationId={5}
          fallback={<div data-testid="fallback">Wrong Org</div>}
        >
          <div data-testid="protected-content">Org Content</div>
        </PermissionGate>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should show loading indicator when showLoading=true and no user', () => {
      mockUsePermissions.mockReturnValue(createMockPermissions({ currentUser: null }));

      render(
        <PermissionGate showLoading permission="create_events">
          <div data-testid="protected-content">Content</div>
        </PermissionGate>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should render fallback when no user and showLoading=false', () => {
      mockUsePermissions.mockReturnValue(createMockPermissions({ currentUser: null }));

      render(
        <PermissionGate
          permission="create_events"
          fallback={<div data-testid="fallback">Login Required</div>}
        >
          <div data-testid="protected-content">Content</div>
        </PermissionGate>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('should render nothing when access denied and no fallback', () => {
      const mockCan = jest.fn().mockReturnValue(false);
      mockUsePermissions.mockReturnValue(createMockPermissions({ can: mockCan }));

      const { container } = render(
        <PermissionGate permission="create_events">
          <div data-testid="protected-content">Content</div>
        </PermissionGate>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it('should handle combination of permission and role requirements', () => {
      const mockCan = jest.fn().mockReturnValue(true);
      const mockHasRole = jest.fn().mockReturnValue(false);
      mockUsePermissions.mockReturnValue(createMockPermissions({
        can: mockCan,
        hasRole: mockHasRole
      }));

      render(
        <PermissionGate
          permission="create_events"
          role="entity_admin"
          fallback={<div data-testid="fallback">Access Denied</div>}
        >
          <div data-testid="protected-content">Content</div>
        </PermissionGate>
      );

      // Has permission but not role - should be denied
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('should render children when all requirements are met', () => {
      const mockCan = jest.fn().mockReturnValue(true);
      const mockHasRole = jest.fn().mockReturnValue(true);
      const mockCanAccess = jest.fn().mockReturnValue(true);
      mockUsePermissions.mockReturnValue(createMockPermissions({
        can: mockCan,
        hasRole: mockHasRole,
        canAccess: mockCanAccess,
      }));

      render(
        <PermissionGate
          permission="create_events"
          role="entity_admin"
          resource="admin_dashboard"
        >
          <div data-testid="protected-content">Admin Dashboard</div>
        </PermissionGate>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });
});
