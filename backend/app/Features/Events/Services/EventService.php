<?php

namespace App\Features\Events\Services;

use App\Features\Shared\Traits\StatusResolvable;
use App\Models\Event;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use App\Services\HtmlSanitizer;

class EventService
{
    use StatusResolvable;

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
        if (! empty($filters['search'])) {
            $this->applySearchFilter($query, $filters['search']);
        }

        // Apply status filter
        if (! empty($filters['status_id'])) {
            $query->where('status_id', $filters['status_id']);
        }

        // Apply format filter
        if (! empty($filters['format_id'])) {
            $query->where('format_id', $filters['format_id']);
        }

        // Apply event type filter
        if (! empty($filters['event_type_id'])) {
            $query->where('event_type_id', $filters['event_type_id']);
        }

        // Apply date range filter
        if (! empty($filters['start_date'])) {
            $query->where('start_date', '>=', $filters['start_date']);
        }

        if (! empty($filters['end_date'])) {
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
            // CAPA 2: Sanitize description in Service layer (defense in depth layer 2)
            // This provides protection even if FormRequest layer is bypassed
            if (isset($data['description'])) {
                $data['description'] = $this->sanitizeDescription($data['description']);
            }

            // Force entity_id from authenticated user — users cannot set entity directly
            $organizationId = $user->organization_id;
            if (! $organizationId) {
                throw new \Exception('User must belong to an organization to create events.');
            }
            $data['entity_id'] = $organizationId;

            // Extract location_ids for pivot table handling
            $locationIds = $data['location_ids'] ?? [];
            unset($data['location_ids']); // Remove from mass assignment data

            // Force draft status - users cannot set status directly
            // This ensures the approval workflow is always followed
            $data['status_id'] = $this->getStatusId('draft');

            // Create the event, then set created_by via forceFill
            // (created_by is excluded from $fillable for security)
            $event = Event::create($data);
            $event->forceFill(['created_by' => $user->id])->save();

            // Handle location relationships if provided
            if (! empty($locationIds) && is_array($locationIds)) {
                $event->locations()->sync($locationIds);
            }

            // Load relationships for complete response
            $event->load(['locations', 'status', 'format', 'creator', 'eventType', 'eventSubtype']);

            return $event;
        });
    }

    /**
     * Update an existing event.
     */
    public function updateEvent(Event $event, array $data, User $user): Event
    {
        return DB::transaction(function () use ($event, $data, $user) {
            // CAPA 2: Sanitize description in Service layer (defense in depth layer 2)
            // This provides protection even if FormRequest layer is bypassed
            if (isset($data['description'])) {
                $data['description'] = $this->sanitizeDescription($data['description']);
            }

            // Track who updated the event
            $data['updated_by'] = $user->id;

            // Extract location_ids for pivot table handling
            $locationIds = $data['location_ids'] ?? null;
            unset($data['location_ids']); // Remove from mass assignment data

            // Force draft status for organizer_admin - status changes go through the approval workflow
            if ($user->isOrganizerAdmin()) {
                $data['status_id'] = $this->getStatusId('draft');
            }

            // Update the event
            $event->update($data);

            // Handle location relationships if provided
            if ($locationIds !== null && is_array($locationIds)) {
                $event->locations()->sync($locationIds);
            }

            // Load relationships for complete response
            $event->load(['locations', 'status', 'format', 'creator', 'eventType', 'eventSubtype']);

            return $event->fresh();
        });
    }

    /**
     * Delete an event.
     */
    public function deleteEvent(Event $event): bool
    {
        return DB::transaction(function () use ($event) {
            return $event->delete();
        });
    }

    /**
     * Get events by specific status.
     */
    public function getEventsByStatus(string $statusCode, array $filters = []): LengthAwarePaginator
    {
        $query = Event::query()->with('status');

        // Apply entity filter
        $this->applyScopeFilter($query);

        // Filter by status code
        $query->whereHas('status', function ($q) use ($statusCode) {
            $q->where('status_code', $statusCode);
        });

        // Apply search filter if provided
        if (! empty($filters['search'])) {
            $this->applySearchFilter($query, $filters['search']);
        }

        // Apply default ordering
        $query->orderBy('created_at', 'desc');

        // Apply pagination
        $perPage = $this->getPerPageValue($filters);

        return $query->paginate($perPage);
    }

    /**
     * Get upcoming events (start_date >= today).
     */
    public function getUpcomingEvents(array $filters = []): LengthAwarePaginator
    {
        $query = Event::query()->with('status');

        // Apply entity filter
        $this->applyScopeFilter($query);

        // Filter for upcoming events
        $query->where('start_date', '>=', now()->startOfDay())
            ->orderBy('start_date', 'asc');

        // Apply search filter if provided
        if (! empty($filters['search'])) {
            $this->applySearchFilter($query, $filters['search']);
        }

        // Apply pagination
        $perPage = $this->getPerPageValue($filters);

        return $query->paginate($perPage);
    }

    /**
     * Get featured events.
     */
    public function getFeaturedEvents(array $filters = []): LengthAwarePaginator
    {
        $query = Event::query()->with('status');

        // Apply entity filter
        $this->applyScopeFilter($query);

        // Filter for featured events
        $query->where('is_featured', true)
            ->orderBy('created_at', 'desc');

        // Apply pagination
        $perPage = $this->getPerPageValue($filters);

        return $query->paginate($perPage);
    }

    /**
     * Duplicate event.
     * Creates a copy of the event with draft status and copies location relationships.
     *
     * @param  Event  $event  The event to duplicate
     * @return Event The duplicated event
     */
    public function duplicate(Event $event): Event
    {
        return DB::transaction(function () use ($event) {
            $replica = $event->replicate();
            $replica->title = $event->title.' (Copia)';
            $replica->status_id = $this->getStatusId('draft');
            $replica->is_featured = false;
            $replica->approved_at = null;
            $replica->approved_by = null;
            $replica->published_at = null;
            $replica->save();

            // Copy location relationships
            if ($event->locations && $event->locations->isNotEmpty()) {
                $replica->locations()->sync($event->locations->pluck('id'));
            }

            // Load relationships for complete response
            $replica->load(['locations', 'status', 'format', 'eventType', 'eventSubtype']);

            return $replica;
        });
    }

    /**
     * Apply scope filter to query (tenant filtering).
     */
    private function applyScopeFilter(Builder $query): void
    {
        // The TenantScope is automatically applied via the Event model
        // No additional filtering needed here
    }

    /**
     * Apply search filter to query.
     */
    private function applySearchFilter(Builder $query, string $search): void
    {
        $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
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

    /**
     * CAPA 2: Sanitize HTML description (allows safe tags, removes scripts/onclick/etc).
     *
     * This method is the second layer of defense in our triple-layer XSS protection.
     * It runs in the Service layer, providing protection even if the FormRequest
     * layer is bypassed.
     *
     * @param  string  $description  Raw HTML description
     * @return string Sanitized HTML description
     */
    private function sanitizeDescription(string $description): string
    {
        return HtmlSanitizer::clean($description);
    }
}
