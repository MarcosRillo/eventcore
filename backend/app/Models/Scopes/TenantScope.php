<?php

namespace App\Models\Scopes;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * This scope automatically filters data based on the authenticated user's organization,
     * ensuring data isolation between different entities (tenancy).
     */
    public function apply(Builder $builder, Model $model): void
    {
        // Check if there's an authenticated user
        if (! Auth::check()) {
            return;
        }

        /** @var User $user */
        $user = Auth::user();

        // Don't apply scope for platform admins - they can see everything
        if ($user->isPlatformAdmin()) {
            return;
        }

        // Apply tenant filtering for entity_admin and entity_staff
        if ($user->isEntityAdmin() || $user->isEntityStaff()) {
            // Get the user's primary organization ID
            $organizationId = $this->getUserOrganizationId($user);

            if ($organizationId) {
                $builder->where('entity_id', $organizationId);
            }
        }

        // Apply filtering for organizer_admin
        if ($user->isOrganizerAdmin()) {
            $organizationId = $this->getUserOrganizationId($user);
            $modelClass = get_class($model);

            // Models que pertenecen al ENTE (event types, subtypes, ubicaciones, etc)
            $entityOwnedModels = [
                \App\Models\Location::class,
                \App\Models\EventStatus::class,
                \App\Models\EventType::class,
                \App\Models\EventSubtype::class,
            ];

            if (in_array($modelClass, $entityOwnedModels)) {
                // Organizadores ven TODOS los recursos del ente (entity_id = 1)
                $builder->where('entity_id', 1);

                return;
            }

            // Modelos que pertenecen a ORGANIZACIONES (eventos)
            if ($modelClass === \App\Models\Event::class && $organizationId) {
                $builder->where('organization_id', $organizationId);

                return;
            }
        }
    }

    /**
     * Get the user's primary organization ID.
     *
     * Delegates to User::getOrganizationIdAttribute() which uses loadMissing()
     * to cache the organizations collection — avoids repeated queries when
     * TenantScope is applied to multiple models in the same request.
     */
    private function getUserOrganizationId(User $user): ?int
    {
        return $user->organization_id;
    }

    /**
     * Extend the query builder with methods to bypass tenant filtering.
     */
    public function extend(Builder $builder): void
    {
        $builder->macro('withoutTenantScope', function (Builder $builder) {
            return $builder->withoutGlobalScope($this);
        });

        $builder->macro('withAllTenants', function (Builder $builder) {
            return $builder->withoutGlobalScope($this);
        });
    }
}
