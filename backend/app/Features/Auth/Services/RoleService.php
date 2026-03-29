<?php

namespace App\Features\Auth\Services;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Eloquent\Collection;

class RoleService
{
    /**
     * Get the roles that the given user is allowed to assign to invitations.
     * Platform admins can assign any role.
     * Entity admins can only assign entity_staff and organizer_admin.
     */
    public function getAssignableRoles(User $user): Collection
    {
        $query = UserRole::select('id', 'role_code', 'role_name');

        if ($user->isPlatformAdmin()) {
            return $query->orderBy('role_name')->get();
        }

        return $query->whereIn('role_code', ['entity_staff', 'organizer_admin'])
            ->orderBy('role_name')
            ->get();
    }
}
