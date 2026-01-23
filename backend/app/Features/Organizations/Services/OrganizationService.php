<?php

namespace App\Features\Organizations\Services;

use App\Models\Organization;
use App\Models\OrganizationStatus;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrganizationService
{
    private const DEFAULT_PER_PAGE = 15;

    private const MAX_PER_PAGE = 100;

    /**
     * Get all organizations linked to the user's entity with metrics.
     */
    public function getLinkedOrganizations(User $user, array $filters = []): LengthAwarePaginator
    {
        // Get the user's primary organization (the entity)
        $entity = $user->organizations()->first();

        if (! $entity) {
            throw new \RuntimeException('User is not associated with any organization');
        }

        $query = Organization::query()
            ->where('parent_id', $entity->id)
            ->with(['status', 'type', 'users']);

        // Add event metrics via subqueries
        $query->withCount([
            'events as events_total',
            'events as events_published' => function (Builder $q) {
                $q->whereHas('status', fn ($sq) => $sq->where('status_code', 'published'));
            },
            'events as events_pending' => function (Builder $q) {
                $q->whereHas('status', fn ($sq) => $sq->whereIn('status_code', [
                    'pending_internal_approval',
                    'pending_public_approval',
                ]));
            },
            'events as events_rejected' => function (Builder $q) {
                $q->whereHas('status', fn ($sq) => $sq->where('status_code', 'rejected'));
            },
        ]);

        if (! empty($filters['search'])) {
            $this->applySearchFilter($query, $filters['search']);
        }

        if (! empty($filters['status'])) {
            $this->applyStatusFilter($query, $filters['status']);
        }

        $this->applyDefaultOrdering($query);

        return $query->paginate($this->getPerPageValue($filters));
    }

    /**
     * Get organization detail with users and event metrics.
     */
    public function getOrganizationDetail(int $organizationId, User $user): Organization
    {
        // Verify the organization belongs to the user's entity
        $entity = $user->organizations()->first();

        if (! $entity) {
            throw new \RuntimeException('User is not associated with any organization');
        }

        $organization = Organization::where('id', $organizationId)
            ->where('parent_id', $entity->id)
            ->with(['status', 'type', 'users.role'])
            ->withCount([
                'events as events_total',
                'events as events_published' => function (Builder $q) {
                    $q->whereHas('status', fn ($sq) => $sq->where('status_code', 'published'));
                },
                'events as events_pending' => function (Builder $q) {
                    $q->whereHas('status', fn ($sq) => $sq->whereIn('status_code', [
                        'pending_internal_approval',
                        'pending_public_approval',
                    ]));
                },
                'events as events_rejected' => function (Builder $q) {
                    $q->whereHas('status', fn ($sq) => $sq->where('status_code', 'rejected'));
                },
            ])
            ->first();

        if (! $organization) {
            throw new \RuntimeException('Organization not found or access denied');
        }

        return $organization;
    }

    /**
     * Toggle organization status between active and suspended.
     */
    public function toggleOrganizationStatus(int $organizationId, User $user): Organization
    {
        return DB::transaction(function () use ($organizationId, $user) {
            // Verify the organization belongs to the user's entity
            $entity = $user->organizations()->first();

            if (! $entity) {
                throw new \RuntimeException('User is not associated with any organization');
            }

            $organization = Organization::where('id', $organizationId)
                ->where('parent_id', $entity->id)
                ->with('status')
                ->first();

            if (! $organization) {
                throw new \RuntimeException('Organization not found or access denied');
            }

            // Get target status
            $currentStatusCode = $organization->status?->status_code;
            $newStatusCode = $currentStatusCode === 'active' ? 'suspended' : 'active';

            $newStatus = OrganizationStatus::where('status_code', $newStatusCode)->first();

            if (! $newStatus) {
                throw new \RuntimeException("Status '{$newStatusCode}' not found");
            }

            $organization->update(['status_id' => $newStatus->id]);

            Log::info('Organization status toggled', [
                'organization_id' => $organization->id,
                'organization_name' => $organization->name,
                'old_status' => $currentStatusCode,
                'new_status' => $newStatusCode,
                'user_id' => $user->id,
            ]);

            return $organization->fresh(['status', 'type']);
        });
    }

    /**
     * Apply search filter to the query.
     */
    private function applySearchFilter(Builder $query, string $search): void
    {
        $search = trim($search);

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('cuit', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }
    }

    /**
     * Apply status filter to the query.
     */
    private function applyStatusFilter(Builder $query, string $status): void
    {
        if ($status !== 'all') {
            $query->whereHas('status', fn ($q) => $q->where('status_code', $status));
        }
    }

    /**
     * Apply default ordering to the query.
     */
    private function applyDefaultOrdering(Builder $query): void
    {
        $query->orderBy('name', 'asc')
            ->orderBy('created_at', 'desc');
    }

    /**
     * Get the per_page value with validation and defaults.
     */
    private function getPerPageValue(array $filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE);

        return max(1, min($perPage, self::MAX_PER_PAGE));
    }
}
