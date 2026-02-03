<?php

namespace App\Features\InternalCalendar\Services;

use App\Models\Event;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

/**
 * Internal Calendar Service
 *
 * Handles internal calendar queries for authenticated users.
 * Shows approved_internal, pending_public_approval, and published events.
 *
 * Created: December 4, 2025 (Internal Calendar feature)
 */
class InternalCalendarService
{
    /**
     * Roles that can view events across all organizations in the planning view.
     */
    public const PRIVILEGED_ROLES = [
        'platform_admin',
        'entity_admin',
        'entity_staff',
        'organizer_admin',
    ];

    /**
     * Event statuses visible in internal calendar.
     * Includes events approved for internal use and public viewing.
     */
    public const INTERNAL_CALENDAR_STATUSES = [
        'approved_internal',
        'pending_public_approval',
        'published',
    ];

    /**
     * Get internal calendar events with optional filters.
     *
     * For the planning view, all privileged roles can see all events across organizations.
     * This enables date coordination and conflict detection.
     *
     * @param  array  $filters  Available filters: status, start_date, end_date, event_type_id
     * @return Collection<int, Event> Collection of events with eager-loaded relationships
     */
    public function getInternalCalendarEvents(array $filters = []): Collection
    {
        $user = Auth::user();

        $query = Event::internalCalendar()
            ->with(['status', 'eventType', 'eventSubtype', 'locations', 'organization'])
            ->orderBy('start_date', 'asc');

        // For planning view: all authenticated users with these roles can see all events
        // This enables organizer_admin to view all organizations' events for date coordination
        $userRoleCode = $user?->role?->role_code;
        if ($userRoleCode && in_array($userRoleCode, self::PRIVILEGED_ROLES)) {
            $query->withoutGlobalScope(\App\Models\Scopes\TenantScope::class);
        }

        // Apply filters
        $this->applyFilters($query, $filters);

        return $query->get();
    }

    /**
     * Get a single event by ID with role-based access control.
     *
     * For the planning view, all privileged roles can view any event's details
     * across organizations for coordination purposes.
     *
     * @param  int  $id  Event ID
     * @return Event|null Event if found and accessible, null otherwise
     */
    public function getEventById(int $id): ?Event
    {
        $user = Auth::user();

        $query = Event::internalCalendar()
            ->with(['status', 'eventType', 'eventSubtype', 'locations', 'organization'])
            ->where('id', $id);

        // For planning view: all authenticated users with these roles can see all events
        // This enables organizer_admin to view any organization's event details
        $userRoleCode = $user?->role?->role_code;
        if ($userRoleCode && in_array($userRoleCode, self::PRIVILEGED_ROLES)) {
            $query->withoutGlobalScope(\App\Models\Scopes\TenantScope::class);
        }

        return $query->first();
    }

    /**
     * Get event statuses available for internal calendar filtering.
     *
     * Returns the list of status codes that are visible in the internal calendar.
     * This can be used by frontend to populate filter dropdowns.
     *
     * @return array<int, string> Status codes that can be filtered
     */
    public function getAvailableStatuses(): array
    {
        return self::INTERNAL_CALENDAR_STATUSES;
    }

    /**
     * Apply filters to the event query.
     *
     * Supported filters:
     * - status: Filter by specific status code (approved_internal, pending_public_approval, published)
     * - start_date + end_date: Filter by date range (both required)
     * - event_type_id: Filter by event type
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query  The query builder to modify
     * @param  array  $filters  Associative array of filter key-value pairs
     */
    private function applyFilters($query, array $filters): void
    {
        // Filter by specific status code
        if (! empty($filters['status'])) {
            // Explicit status filter (backwards compatible with admin views)
            $query->whereHas('status', function ($q) use ($filters) {
                $q->where('status_code', $filters['status']);
            });
        } else {
            // Default: only show approved_internal + published events (public calendar view)
            $query->whereHas('status', function ($q) {
                $q->whereIn('status_code', ['approved_internal', 'published']);
            });
        }

        // Filter by date range
        if (! empty($filters['start_date']) && ! empty($filters['end_date'])) {
            $query->whereBetween('start_date', [
                $filters['start_date'],
                $filters['end_date'],
            ]);
        }

        // Filter by event type
        if (! empty($filters['event_type_id'])) {
            $query->where('event_type_id', $filters['event_type_id']);
        }
    }
}
