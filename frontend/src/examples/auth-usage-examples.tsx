/**
 * AUTH SYSTEM USAGE EXAMPLES
 * Examples showing how to use the new role-based authentication system
 */

'use client';

import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from '@/components/auth';

// Example 1: Basic role checking in component
export const BasicRoleExample = () => {
  const { hasRole, user } = useAuth();

  return (
    <div>
      <h2>Current User: {user?.name}</h2>
      <p>Role: {user?.role?.role_name}</p>
      
      {hasRole('platform_admin') && (
        <div className="bg-red-100 p-4 rounded">
          <h3>Platform Admin Features</h3>
          <p>You have full platform access!</p>
        </div>
      )}
      
      {hasRole('entity_admin') && (
        <div className="bg-blue-100 p-4 rounded">
          <h3>Entity Admin Features</h3>
          <p>You can manage your organization!</p>
        </div>
      )}
    </div>
  );
};

// Example 2: Permission-based access control
export const PermissionExample = () => {
  const { canManageEvents, canApproveEvents, canAccessAdmin } = useAuth();

  return (
    <div className="space-y-4">
      <h2>Feature Access</h2>
      
      {canManageEvents() && (
        <button className="bg-green-500 text-white px-4 py-2 rounded">
          Create Event
        </button>
      )}
      
      {canApproveEvents() && (
        <button className="bg-yellow-500 text-white px-4 py-2 rounded">
          Approve Events
        </button>
      )}
      
      {canAccessAdmin() && (
        <button className="bg-purple-500 text-white px-4 py-2 rounded">
          Admin Panel
        </button>
      )}
    </div>
  );
};

// Example 3: Using the usePermissions hook
export const PermissionsHookExample = () => {
  const {
    isAdmin,
    isOrganizer,
    can,
    currentRole,
    getOrganization,
    getUserPermissions
  } = usePermissions();

  const permissions = getUserPermissions();
  const organization = getOrganization();

  return (
    <div className="space-y-4">
      <h2>Permissions Analysis</h2>
      
      <div className="bg-gray-100 p-4 rounded">
        <p><strong>Current Role:</strong> {currentRole?.role_name || 'None'}</p>
        <p><strong>Organization:</strong> {organization?.name || 'None'}</p>
        <p><strong>Is Admin:</strong> {isAdmin() ? 'Yes' : 'No'}</p>
        <p><strong>Is Organizer:</strong> {isOrganizer() ? 'Yes' : 'No'}</p>
      </div>
      
      <div>
        <h3>Available Permissions:</h3>
        <ul className="list-disc list-inside">
          {permissions.map(permission => (
            <li key={permission}>{permission}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3>Feature Access:</h3>
        <ul className="list-disc list-inside">
          <li>Manage Entity Events: {can('manage_entity_events') ? '✅' : '❌'}</li>
          <li>Manage Own Events: {can('manage_own_events') ? '✅' : '❌'}</li>
          <li>Approve Events: {can('approve_events') ? '✅' : '❌'}</li>
          <li>Manage Users: {can('manage_users') ? '✅' : '❌'}</li>
          <li>View Analytics: {can('view_analytics') ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  );
};

// Example 4: Using PermissionGate component
export const PermissionGateExample = () => {
  return (
    <div className="space-y-4">
      <h2>Permission Gates</h2>
      
      {/* Single permission check */}
      <PermissionGate
        permission="manage_entity_events"
        fallback={<p className="text-red-500">No access to event management</p>}
      >
        <div className="bg-green-100 p-4 rounded">
          <h3>Event Management</h3>
          <p>You can manage events!</p>
        </div>
      </PermissionGate>

      {/* Multiple permissions (require all) */}
      <PermissionGate
        permissions={['manage_entity_events', 'approve_events']}
        requireAll={true}
        fallback={<p className="text-orange-500">Need both manage and approve permissions</p>}
      >
        <div className="bg-yellow-100 p-4 rounded">
          <h3>Advanced Event Management</h3>
          <p>You can both manage and approve events!</p>
        </div>
      </PermissionGate>
      
      {/* Role-based access */}
      <PermissionGate 
        roles={['platform_admin', 'entity_admin']}
        fallback={<p className="text-gray-500">Admin access required</p>}
      >
        <div className="bg-purple-100 p-4 rounded">
          <h3>Admin Features</h3>
          <p>Welcome, administrator!</p>
        </div>
      </PermissionGate>
      
      {/* Resource-based access */}
      <PermissionGate 
        resource="admin"
        fallback={<p className="text-red-500">Admin panel access denied</p>}
      >
        <div className="bg-blue-100 p-4 rounded">
          <h3>Admin Panel</h3>
          <p>Access to admin resources granted!</p>
        </div>
      </PermissionGate>
    </div>
  );
};

// Example 5: Conditional navigation based on roles
export const RoleBasedNavigationExample = () => {
  const { canAccessAdmin, canManageEvents, hasRole } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      show: true, // Always show
    },
    {
      name: 'Events',
      href: '/events',
      show: canManageEvents(),
    },
    {
      name: 'Admin Panel',
      href: '/admin',
      show: canAccessAdmin(),
    },
    {
      name: 'Users',
      href: '/users',
      show: hasRole('platform_admin') || hasRole('entity_admin'),
    },
    {
      name: 'My Events',
      href: '/my-events',
      show: hasRole('organizer_admin'),
    },
  ];

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            {navigationItems
              .filter(item => item.show)
              .map(item => (
                <a
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  {item.name}
                </a>
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Example 6: Form field visibility based on permissions
export const ConditionalFormExample = () => {
  const { canApproveEvents, hasRole } = useAuth();

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Event Title
        </label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Enter event title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          rows={3}
          placeholder="Enter event description"
        />
      </div>
      
      {/* Only show approval status for users who can approve */}
      {canApproveEvents() && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Approval Status
          </label>
          <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}
      
      {/* Only show featured option for admins */}
      {hasRole('platform_admin') || hasRole('entity_admin') ? (
        <div>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-gray-700">Featured Event</span>
          </label>
        </div>
      ) : null}
    </form>
  );
};