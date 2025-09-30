<?php

namespace App\Services;

use App\Models\Event;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class EventService
{
    /**
     * Get all events with optional filters and pagination.
     * This method ALWAYS returns a LengthAwarePaginator object for consistent API responses.
     */
    public function getAllEvents(array $filters = []): LengthAwarePaginator
    {
        $query = Event::query();

        // Apply entity filter - scope to current user's organization
        $this->applyScopeFilter($query);

        // Apply search filter
        if (!empty($filters['search'])) {
            $this->applySearchFilter($query, $filters['search']);
        }

        // Apply status filter
        if (!empty($filters['status_id'])) {
            $query->where('status_id', $filters['status_id']);
        }

        // Apply type filter
        if (!empty($filters['type_id'])) {
            $query->where('type_id', $filters['type_id']);
        }

        // Apply category filter
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Apply date range filter
        if (!empty($filters['start_date'])) {
            $query->where('start_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->where('end_date', '<=', $filters['end_date']);
        }

        // Apply default ordering (newest first)
        $query->orderBy('created_at', 'desc');

        // Apply pagination - ALWAYS paginate to ensure consistent API response structure
        $perPage = $this->getPerPageValue($filters);

        // CRITICAL: This method MUST always return paginated results
        return $query->paginate($perPage);
    }

    /**
     * Create a new event.
     */
    public function createEvent(array $data, User $user): Event
    {
        return DB::transaction(function () use ($data, $user) {
            // Get the user's primary organization for entity_id if not provided
            if (!isset($data['entity_id'])) {
                $organization = $user->organizations()->first();
                if (!$organization) {
                    throw new \Exception('User must belong to an organization to create events.');
                }
                $data['entity_id'] = $organization->id;
            }

            // Auto-compute created_by from authenticated user
            $data['created_by'] = $user->id;

            // Generate slug from title
            if (isset($data['title'])) {
                $data['slug'] = Str::slug($data['title']);
            }

            // Ensure default status_id if not provided
            if (!isset($data['status_id'])) {
                $data['status_id'] = 1; // draft
            }

            // Extract location_ids for pivot table handling
            $locationIds = $data['location_ids'] ?? [];
            unset($data['location_ids']); // Remove from mass assignment data

            // Create the event
            $event = Event::create($data);

            // Handle location relationships if provided
            if (!empty($locationIds) && is_array($locationIds)) {
                $event->locations()->sync($locationIds);
            }

            // Load relationships for complete response
            $event->load(['category', 'locations', 'status', 'type', 'creator']);

            return $event;
        });
    }

    /**
     * Update an existing event.
     */
    public function updateEvent(Event $event, array $data, User $user): Event
    {
        return DB::transaction(function () use ($event, $data, $user) {
            // Update slug if title changed
            if (isset($data['title'])) {
                $data['slug'] = Str::slug($data['title']);
            }

            // Track who updated the event
            $data['updated_by'] = $user->id;

            // Extract location_ids for pivot table handling
            $locationIds = $data['location_ids'] ?? null;
            unset($data['location_ids']); // Remove from mass assignment data

            // Update the event
            $event->update($data);

            // Handle location relationships if provided
            if ($locationIds !== null && is_array($locationIds)) {
                $event->locations()->sync($locationIds);
            }

            // Load relationships for complete response
            $event->load(['category', 'locations', 'status', 'type', 'creator']);

            return $event->fresh();
        });
    }

    /**
     * Delete an event.
     */
    public function deleteEvent(Event $event): bool
    {
        // Detach location relationships first
        $event->locations()->detach();

        // Delete the event
        return $event->delete();
    }

    /**
     * Apply entity scope filter - scope to current user's organization.
     */
    protected function applyScopeFilter(Builder $query): void
    {
        // This is handled by TenantScope in the Event model
        // No additional filtering needed here as it's automatically applied
    }

    /**
     * Apply search filter to the query.
     */
    protected function applySearchFilter(Builder $query, string $search): void
    {
        $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    /**
     * Get the per_page value from filters or use default.
     */
    protected function getPerPageValue(array $filters): int
    {
        $perPage = $filters['per_page'] ?? 15;

        // Ensure per_page is within reasonable bounds
        return min(max((int) $perPage, 1), 100);
    }

    /**
     * Get events by status.
     */
    public function getEventsByStatus(string $statusCode, array $filters = []): LengthAwarePaginator
    {
        $query = Event::query()
            ->whereHas('status', function ($q) use ($statusCode) {
                $q->where('status_code', $statusCode);
            });

        // Apply additional filters
        if (!empty($filters['search'])) {
            $this->applySearchFilter($query, $filters['search']);
        }

        // Apply default ordering
        $query->orderBy('created_at', 'desc');

        $perPage = $this->getPerPageValue($filters);
        return $query->paginate($perPage);
    }

    /**
     * Get upcoming events.
     */
    public function getUpcomingEvents(array $filters = []): LengthAwarePaginator
    {
        $query = Event::query()
            ->where('start_date', '>', now())
            ->whereHas('status', function ($q) {
                $q->where('status_code', 'published');
            });

        // Apply additional filters
        if (!empty($filters['search'])) {
            $this->applySearchFilter($query, $filters['search']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Order by start date
        $query->orderBy('start_date', 'asc');

        $perPage = $this->getPerPageValue($filters);
        return $query->paginate($perPage);
    }

    /**
     * Get featured events.
     */
    public function getFeaturedEvents(array $filters = []): LengthAwarePaginator
    {
        $query = Event::query()
            ->where('is_featured', true)
            ->whereHas('status', function ($q) {
                $q->where('status_code', 'published');
            });

        // Apply additional filters
        if (!empty($filters['search'])) {
            $this->applySearchFilter($query, $filters['search']);
        }

        // Order by created date (newest first)
        $query->orderBy('created_at', 'desc');

        $perPage = $this->getPerPageValue($filters);
        return $query->paginate($perPage);
    }
}