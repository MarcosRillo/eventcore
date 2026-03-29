<?php

namespace App\Features\Sectors\Services;

use App\Models\Sector;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SectorService
{
    private const DEFAULT_PER_PAGE = 15;

    private const MAX_PER_PAGE = 100;

    /**
     * Get all sectors with optional filters and pagination.
     */
    public function getAllSectors(array $filters = []): LengthAwarePaginator
    {
        $query = Sector::query();

        if (! empty($filters['search'])) {
            $this->applySearchFilter($query, $filters['search']);
        }

        if (isset($filters['is_active'])) {
            $this->applyActiveFilter($query, $filters['is_active']);
        }

        $this->applyDefaultOrdering($query);

        return $query->paginate($this->getPerPageValue($filters));
    }

    /**
     * Get all active sectors (useful for dropdowns).
     */
    public function getActiveSectors(): Collection
    {
        return Sector::where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Get all active sectors without tenant scope (for public endpoints).
     */
    public function getPublicActiveSectors(): Collection
    {
        return Sector::withoutGlobalScopes()
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Create a new sector.
     */
    public function createSector(array $data, User $user): Sector
    {
        try {
            return DB::transaction(function () use ($data, $user) {
                $organizationId = $user->organization_id;

                if (! $organizationId) {
                    throw new \Exception('User is not associated with any organization');
                }

                $sectorData = [
                    'name' => $data['name'],
                    'entity_id' => $organizationId,
                    'is_active' => $data['is_active'] ?? true,
                ];

                $sector = Sector::create($sectorData);

                Log::info('Sector created', [
                    'sector_id' => $sector->id,
                    'sector_name' => $sector->name,
                    'user_id' => $user->id,
                ]);

                return $sector;
            });
        } catch (\Exception $e) {
            Log::error('Failed to create sector', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'data' => $data,
            ]);
            throw $e;
        }
    }

    /**
     * Update an existing sector.
     */
    public function updateSector(Sector $sector, array $data): Sector
    {
        try {
            return DB::transaction(function () use ($sector, $data) {
                $originalData = $sector->toArray();

                $sector->update($data);

                Log::info('Sector updated', [
                    'sector_id' => $sector->id,
                    'sector_name' => $sector->name,
                    'changes' => array_diff_assoc($data, $originalData),
                ]);

                return $sector->fresh();
            });
        } catch (\Exception $e) {
            Log::error('Failed to update sector', [
                'error' => $e->getMessage(),
                'sector_id' => $sector->id,
                'data' => $data,
            ]);
            throw $e;
        }
    }

    /**
     * Delete a sector.
     */
    public function deleteSector(Sector $sector): string
    {
        try {
            return DB::transaction(function () use ($sector) {
                $sectorId = $sector->id;
                $sectorName = $sector->name;

                $sector->delete();

                Log::info('Sector deleted', [
                    'sector_id' => $sectorId,
                    'sector_name' => $sectorName,
                ]);

                return "Sector '{$sectorName}' deleted successfully";
            });
        } catch (\Exception $e) {
            Log::error('Failed to delete sector', [
                'error' => $e->getMessage(),
                'sector_id' => $sector->id,
                'sector_name' => $sector->name,
            ]);
            throw $e;
        }
    }

    /**
     * Toggle sector active status.
     */
    public function toggleSectorStatus(Sector $sector): Sector
    {
        return DB::transaction(function () use ($sector) {
            $sector->update([
                'is_active' => ! $sector->is_active,
            ]);

            return $sector->fresh();
        });
    }

    /**
     * Apply search filter to the query.
     */
    private function applySearchFilter(Builder $query, string $search): void
    {
        $searchLower = strtolower(trim($search));
        if (! empty($searchLower)) {
            $query->whereRaw('LOWER(name) LIKE ?', ["%{$searchLower}%"]);
        }
    }

    /**
     * Apply active status filter to the query.
     */
    private function applyActiveFilter(Builder $query, mixed $active): void
    {
        $query->where('is_active', (bool) $active);
    }

    /**
     * Apply default ordering to the query.
     */
    private function applyDefaultOrdering(Builder $query): void
    {
        $query->orderBy('name', 'asc');
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
