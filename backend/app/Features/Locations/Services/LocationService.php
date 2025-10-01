<?php

namespace App\Features\Locations\Services;

use App\Models\Location;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class LocationService
{
    /**
     * Get all locations with optional filters and pagination.
     * This method ALWAYS returns a LengthAwarePaginator object for consistent API responses.
     */
    public function getAllLocations(array $filters = []): LengthAwarePaginator
    {
        $query = Location::query();

        // Apply entity filter - scope to current user's organization
        $this->applyScopeFilter($query);

        // Apply search filter
        if (!empty($filters['search'])) {
            $this->applySearchFilter($query, $filters['search']);
        }

        // Apply active status filter
        if (isset($filters['active'])) {
            $this->applyActiveFilter($query, $filters['active']);
        }

        // Apply default ordering
        $this->applyDefaultOrdering($query);

        // Apply pagination - ALWAYS paginate to ensure consistent API response structure
        $perPage = $this->getPerPageValue($filters);

        // CRITICAL: This method MUST always return paginated results
        return $query->paginate($perPage);
    }

    /**
     * Get all active locations (useful for dropdowns and selects).
     * Returns a collection, not paginated results.
     */
    public function getActiveLocations(): \Illuminate\Database\Eloquent\Collection
    {
        $query = Location::query();

        // Apply scope filter if needed
        $this->applyScopeFilter($query);

        return $query->where('is_active', true)
                    ->orderBy('name', 'asc')
                    ->get();
    }

    /**
     * Create a new location.
     */
    public function createLocation(array $data, User $user): Location
    {
        // Get the user's primary organization
        $organization = $user->organizations()->first();

        if (!$organization) {
            throw new \Exception('User is not associated with any organization');
        }

        // Prepare location data with safe defaults
        $locationData = [
            'name' => $data['name'],
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'country' => $data['country'] ?? null,
            'postal_code' => $data['postal_code'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'description' => $data['description'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'additional_info' => $data['additional_info'] ?? null,
            'entity_id' => $organization->id,
            'is_active' => $data['is_active'] ?? true,
        ];

        return Location::create($locationData);
    }

    /**
     * Update an existing location.
     */
    public function updateLocation(Location $location, array $data): Location
    {
        $location->update($data);

        return $location->fresh();
    }

    /**
     * Delete a location.
     */
    public function deleteLocation(Location $location): string
    {
        $locationName = $location->name;
        $location->delete();

        return "Location '{$locationName}' deleted successfully";
    }

    /**
     * Get location statistics.
     */
    public function getLocationStats(): array
    {
        $query = Location::query();
        $this->applyScopeFilter($query);

        $total = $query->count();
        $active = $query->where('is_active', true)->count();
        $inactive = $total - $active;

        return [
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
        ];
    }

    /**
     * Toggle location active status.
     */
    public function toggleLocationStatus(Location $location): Location
    {
        $location->update([
            'is_active' => !$location->is_active
        ]);

        return $location->fresh();
    }

    /**
     * Apply scope filter to query (tenant filtering).
     */
    private function applyScopeFilter(Builder $query): void
    {
        // The TenantScope is automatically applied via the Location model
        // No additional filtering needed here
    }

    /**
     * Apply search filter to query.
     */
    private function applySearchFilter(Builder $query, string $search): void
    {
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('address', 'like', "%{$search}%")
              ->orWhere('city', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    /**
     * Apply active status filter to query.
     */
    private function applyActiveFilter(Builder $query, bool $active): void
    {
        $query->where('is_active', $active);
    }

    /**
     * Apply default ordering to query.
     */
    private function applyDefaultOrdering(Builder $query): void
    {
        $query->orderBy('name', 'asc');
    }

    /**
     * Get per page value from filters or default.
     */
    private function getPerPageValue(array $filters): int
    {
        $perPage = $filters['per_page'] ?? 15;

        // Ensure per_page is within reasonable bounds
        if ($perPage < 1 || $perPage > 100) {
            $perPage = 15;
        }

        return $perPage;
    }
}
