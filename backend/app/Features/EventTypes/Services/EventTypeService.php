<?php

namespace App\Features\EventTypes\Services;

use App\Models\EventType;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EventTypeService
{
    private const DEFAULT_PER_PAGE = 15;

    private const MAX_PER_PAGE = 100;

    /**
     * Get all event types with optional filters and pagination.
     */
    public function getAllEventTypes(array $filters = []): LengthAwarePaginator
    {
        $query = EventType::query();

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
     * Get all active event types (useful for dropdowns).
     */
    public function getActiveEventTypes(): Collection
    {
        return EventType::where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Create a new event type.
     */
    public function createEventType(array $data, User $user): EventType
    {
        try {
            return DB::transaction(function () use ($data, $user) {
                $organization = $user->organizations()->first();

                if (! $organization) {
                    throw new \Exception('User is not associated with any organization');
                }

                $eventTypeData = [
                    'name' => $data['name'],
                    'entity_id' => $organization->id,
                    'is_active' => $data['is_active'] ?? true,
                ];

                $eventType = EventType::create($eventTypeData);

                Log::info('EventType created', [
                    'event_type_id' => $eventType->id,
                    'event_type_name' => $eventType->name,
                    'user_id' => $user->id,
                ]);

                return $eventType;
            });
        } catch (\Exception $e) {
            Log::error('Failed to create event type', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'data' => $data,
            ]);
            throw $e;
        }
    }

    /**
     * Update an existing event type.
     */
    public function updateEventType(EventType $eventType, array $data): EventType
    {
        try {
            return DB::transaction(function () use ($eventType, $data) {
                $originalData = $eventType->toArray();

                $eventType->update($data);

                Log::info('EventType updated', [
                    'event_type_id' => $eventType->id,
                    'event_type_name' => $eventType->name,
                    'changes' => array_diff_assoc($data, $originalData),
                ]);

                return $eventType->fresh();
            });
        } catch (\Exception $e) {
            Log::error('Failed to update event type', [
                'error' => $e->getMessage(),
                'event_type_id' => $eventType->id,
                'data' => $data,
            ]);
            throw $e;
        }
    }

    /**
     * Delete an event type.
     */
    public function deleteEventType(EventType $eventType): string
    {
        try {
            return DB::transaction(function () use ($eventType) {
                $eventTypeId = $eventType->id;
                $eventTypeName = $eventType->name;

                // Check if there are subtypes
                if ($eventType->subtypes()->count() > 0) {
                    throw new \Exception('Cannot delete event type with existing subtypes');
                }

                $eventType->delete();

                Log::info('EventType deleted', [
                    'event_type_id' => $eventTypeId,
                    'event_type_name' => $eventTypeName,
                ]);

                return "Event type '{$eventTypeName}' deleted successfully";
            });
        } catch (\Exception $e) {
            Log::error('Failed to delete event type', [
                'error' => $e->getMessage(),
                'event_type_id' => $eventType->id,
                'event_type_name' => $eventType->name,
            ]);
            throw $e;
        }
    }

    /**
     * Toggle event type active status.
     */
    public function toggleEventTypeStatus(EventType $eventType): EventType
    {
        return DB::transaction(function () use ($eventType) {
            $eventType->update([
                'is_active' => ! $eventType->is_active,
            ]);

            return $eventType->fresh();
        });
    }

    /**
     * Get event type statistics.
     */
    public function getEventTypeStats(): array
    {
        $total = EventType::count();
        $active = EventType::where('is_active', true)->count();

        return [
            'total' => $total,
            'active' => $active,
            'inactive' => $total - $active,
        ];
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
