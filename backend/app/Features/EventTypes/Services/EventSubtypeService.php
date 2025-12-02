<?php

namespace App\Features\EventTypes\Services;

use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EventSubtypeService
{
    private const DEFAULT_PER_PAGE = 15;
    private const MAX_PER_PAGE = 100;

    /**
     * Get all subtypes for an event type with optional filters and pagination.
     */
    public function getSubtypesForEventType(EventType $eventType, array $filters = []): LengthAwarePaginator
    {
        $query = EventSubtype::where('event_type_id', $eventType->id);

        if (!empty($filters['search'])) {
            $this->applySearchFilter($query, $filters['search']);
        }

        if (isset($filters['is_active'])) {
            $this->applyActiveFilter($query, $filters['is_active']);
        }

        $this->applyDefaultOrdering($query);

        return $query->paginate($this->getPerPageValue($filters));
    }

    /**
     * Get all active subtypes for an event type (useful for dropdowns).
     */
    public function getActiveSubtypesForEventType(EventType $eventType): Collection
    {
        return EventSubtype::where('event_type_id', $eventType->id)
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Create a new event subtype.
     */
    public function createEventSubtype(EventType $eventType, array $data, User $user): EventSubtype
    {
        try {
            return DB::transaction(function () use ($eventType, $data, $user) {
                $subtypeData = [
                    'name' => $data['name'],
                    'event_type_id' => $eventType->id,
                    'entity_id' => $eventType->entity_id,
                    'is_active' => $data['is_active'] ?? true,
                ];

                $subtype = EventSubtype::create($subtypeData);

                Log::info('EventSubtype created', [
                    'event_subtype_id' => $subtype->id,
                    'event_subtype_name' => $subtype->name,
                    'event_type_id' => $eventType->id,
                    'user_id' => $user->id
                ]);

                return $subtype;
            });
        } catch (\Exception $e) {
            Log::error('Failed to create event subtype', [
                'error' => $e->getMessage(),
                'event_type_id' => $eventType->id,
                'user_id' => $user->id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update an existing event subtype.
     */
    public function updateEventSubtype(EventSubtype $subtype, array $data): EventSubtype
    {
        try {
            return DB::transaction(function () use ($subtype, $data) {
                $originalData = $subtype->toArray();

                $subtype->update($data);

                Log::info('EventSubtype updated', [
                    'event_subtype_id' => $subtype->id,
                    'event_subtype_name' => $subtype->name,
                    'changes' => array_diff_assoc($data, $originalData)
                ]);

                return $subtype->fresh();
            });
        } catch (\Exception $e) {
            Log::error('Failed to update event subtype', [
                'error' => $e->getMessage(),
                'event_subtype_id' => $subtype->id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete an event subtype.
     */
    public function deleteEventSubtype(EventSubtype $subtype): string
    {
        try {
            return DB::transaction(function () use ($subtype) {
                $subtypeId = $subtype->id;
                $subtypeName = $subtype->name;

                // Check if there are events using this subtype
                if ($subtype->events()->count() > 0) {
                    throw new \Exception('Cannot delete subtype with existing events');
                }

                $subtype->delete();

                Log::info('EventSubtype deleted', [
                    'event_subtype_id' => $subtypeId,
                    'event_subtype_name' => $subtypeName
                ]);

                return "Event subtype '{$subtypeName}' deleted successfully";
            });
        } catch (\Exception $e) {
            Log::error('Failed to delete event subtype', [
                'error' => $e->getMessage(),
                'event_subtype_id' => $subtype->id,
                'event_subtype_name' => $subtype->name
            ]);
            throw $e;
        }
    }

    /**
     * Toggle event subtype active status.
     */
    public function toggleEventSubtypeStatus(EventSubtype $subtype): EventSubtype
    {
        return DB::transaction(function () use ($subtype) {
            $subtype->update([
                'is_active' => !$subtype->is_active
            ]);

            return $subtype->fresh();
        });
    }

    /**
     * Apply search filter to the query.
     */
    private function applySearchFilter(Builder $query, string $search): void
    {
        $searchLower = strtolower(trim($search));
        if (!empty($searchLower)) {
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
