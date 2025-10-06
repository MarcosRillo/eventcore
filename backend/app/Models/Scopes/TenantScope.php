<?php

namespace App\Models\Scopes;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
        // Debug logging
        Log::info('TenantScope applying', [
            'model' => get_class($model),
            'authenticated' => Auth::check(),
            'user_id' => Auth::check() ? Auth::user()->id : null,
            'user_role' => Auth::check() ? Auth::user()->role : null,
        ]);

        // Check if there's an authenticated user
        if (!Auth::check()) {
            Log::info('TenantScope: No authenticated user, returning');
            return;
        }

        /** @var User $user */
        $user = Auth::user();

        // Don't apply scope for platform admins - they can see everything
        if ($user->isPlatformAdmin()) {
            Log::info('TenantScope: Platform admin detected, bypassing scope');
            return;
        }

        Log::info('TenantScope: Applying tenant filtering for user', [
            'user_id' => $user->id,
            'role' => $user->role,
        ]);

        // Apply tenant filtering for entity_admin and entity_staff
        if ($user->isEntityAdmin() || $user->isEntityStaff()) {
            // Get the user's primary organization ID
            $organizationId = $this->getUserOrganizationId($user);
            
            if ($organizationId) {
                Log::info('TenantScope: Adding entity_id filter', ['entity_id' => $organizationId]);
                $builder->where('entity_id', $organizationId);
            }
        }

        // Apply filtering for organizer_admin
        if ($user->isOrganizerAdmin()) {
            $organizationId = $this->getUserOrganizationId($user);
            $modelClass = get_class($model);

            // Models que pertenecen al ENTE (categorías, ubicaciones, etc)
            $entityOwnedModels = [
                \App\Models\Category::class,
                \App\Models\Location::class,
                \App\Models\EventStatus::class,
                \App\Models\EventType::class,
            ];

            if (in_array($modelClass, $entityOwnedModels)) {
                // Organizadores ven TODOS los recursos del ente (entity_id = 1)
                Log::info('TenantScope: Filtering entity-owned model for organizer', [
                    'model' => $modelClass,
                    'entity_id' => 1
                ]);
                $builder->where('entity_id', 1);
                return;
            }

            // Modelos que pertenecen a ORGANIZACIONES (eventos)
            if ($modelClass === \App\Models\Event::class && $organizationId) {
                Log::info('TenantScope: Filtering organization-owned model', [
                    'model' => $modelClass,
                    'organization_id' => $organizationId
                ]);
                $builder->where('organization_id', $organizationId);
                return;
            }
        }
    }

    /**
     * Get the user's primary organization ID.
     * 
     * For now, we'll get the first organization the user belongs to.
     * In the future, this could be enhanced to support multiple organizations
     * or a "current selected organization" concept.
     * 
     * @param User $user
     * @return int|null
     */
    private function getUserOrganizationId($user): ?int
    {
        // Get the first organization the user belongs to
        $organization = $user->organizations()->first();
        
        return $organization ? $organization->id : null;
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
