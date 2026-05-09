<?php

namespace App\Features\Users\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserService
{
    private const PER_PAGE = 10;

    /**
     * List entity_staff users for the current user's context.
     * entity_admin sees only their entity's staff.
     * platform_admin sees all entity_staff users.
     */
    public function getUsers(User $currentUser, array $filters = []): LengthAwarePaginator
    {
        $query = User::with('role')
            ->whereHas('role', fn ($q) => $q->where('role_code', 'entity_staff'));

        // entity_admin only sees their entity's users
        if ($currentUser->isEntityAdmin()) {
            $organizationIds = $currentUser->organizations->pluck('id');
            $query->whereHas('organizations', fn ($q) => $q->whereIn('organizations.id', $organizationIds),
            );
        }

        // Apply search filter
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(fn ($q) => $q->where('name', 'ilike', "%{$search}%")
                ->orWhere('email', 'ilike', "%{$search}%"),
            );
        }

        // Apply status filter
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('name')->paginate($filters['per_page'] ?? self::PER_PAGE);
    }

    /**
     * Get a single user with relationships.
     * entity_admin can only fetch users from their own organization.
     */
    public function getUser(int $userId, User $currentUser): User
    {
        $user = User::with(['role', 'organizations'])->findOrFail($userId);

        if ($currentUser->isEntityAdmin()) {
            $currentOrgIds = $currentUser->organizations->pluck('id')->toArray();
            $targetOrgIds = $user->organizations->pluck('id')->toArray();

            if (empty(array_intersect($currentOrgIds, $targetOrgIds))) {
                throw new ModelNotFoundException;
            }
        }

        return $user;
    }

    /**
     * Update user profile (name, email only).
     */
    public function updateUser(User $user, array $data, User $currentUser): User
    {
        $this->authorizeAction($user, $currentUser);

        return DB::transaction(function () use ($user, $data) {
            $user->update([
                'name' => $data['name'],
                'email' => $data['email'],
            ]);

            Log::info('User updated', [
                'user_id' => $user->id,
                'updated_by' => auth()->id(),
            ]);

            return $user->fresh();
        });
    }

    /**
     * Suspend a user (block access).
     */
    public function suspendUser(User $user, User $currentUser): User
    {
        $this->authorizeAction($user, $currentUser);

        return DB::transaction(function () use ($user) {
            $user->update(['status' => 'suspended']);

            Log::info('User suspended', [
                'user_id' => $user->id,
                'suspended_by' => auth()->id(),
            ]);

            return $user->fresh();
        });
    }

    /**
     * Unsuspend a user (restore access).
     */
    public function unsuspendUser(User $user, User $currentUser): User
    {
        $this->authorizeAction($user, $currentUser);

        return DB::transaction(function () use ($user) {
            $user->update(['status' => 'active']);

            Log::info('User unsuspended', [
                'user_id' => $user->id,
                'unsuspended_by' => auth()->id(),
            ]);

            return $user->fresh();
        });
    }

    /**
     * Soft delete a user.
     */
    public function deleteUser(User $user, User $currentUser): bool
    {
        $this->authorizeAction($user, $currentUser);

        return DB::transaction(function () use ($user) {
            // Revoke all access tokens
            $user->tokens()->delete();

            $result = $user->delete();

            Log::info('User deleted', [
                'user_id' => $user->id,
                'deleted_by' => auth()->id(),
            ]);

            return $result;
        });
    }

    /**
     * Verify current user can manage target user.
     *
     * @throws \InvalidArgumentException
     */
    private function authorizeAction(User $targetUser, User $currentUser): void
    {
        // Cannot edit yourself
        if ($targetUser->id === $currentUser->id) {
            throw new \InvalidArgumentException('No puedes modificar tu propio usuario desde este panel.');
        }

        // entity_admin can only manage entity_staff
        if ($currentUser->isEntityAdmin() && ! $targetUser->isEntityStaff()) {
            throw new \InvalidArgumentException('Solo puedes gestionar usuarios entity_staff.');
        }

        // entity_admin can only manage users from same entity
        if ($currentUser->isEntityAdmin()) {
            $currentUserOrgs = $currentUser->organizations->pluck('id')->toArray();
            $targetUserOrgs = $targetUser->organizations->pluck('id')->toArray();

            if (empty(array_intersect($currentUserOrgs, $targetUserOrgs))) {
                throw new \InvalidArgumentException('No tienes permisos sobre este usuario.');
            }
        }
    }
}
