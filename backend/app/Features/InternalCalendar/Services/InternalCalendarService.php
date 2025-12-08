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
 *
 * @package App\Features\InternalCalendar\Services
 */
class InternalCalendarService
{
    /**
     * Event statuses visible in internal calendar.
     * Includes events approved for internal use and public viewing.
     */
    public const INTERNAL_CALENDAR_STATUSES = [
        'approved_internal',
        'pending_public_approval',
        'published'
    ];

    /**
     * Get internal calendar events with optional filters.
     *
     * Applies tenant scoping based on user role:
     * - entity_admin/entity_staff: See all events (tenant scope disabled)
     * - organizer_admin: See only their organization's events (tenant scope active)
     *
     * @param array $filters Available filters: status, start_date, end_date, event_type_id
     * @return Collection<int, Event> Collection of events with eager-loaded relationships
     */
    public function getInternalCalendarEvents(array $filters = []): Collection
    {
        $user = Auth::user();

        $query = Event::internalCalendar()
            ->with(['status', 'eventType', 'eventSubtype', 'locations', 'organization'])
            ->orderBy('start_date', 'asc');

        // For entity_admin and entity_staff: show all events (disable tenant scope)
        // For organizers: TenantScope automatically filters to their organization
        $userRoleCode = $user?->role?->role_code;
        if ($userRoleCode && in_array($userRoleCode, ['platform_admin', 'entity_admin', 'entity_staff'])) {
            $query->withoutGlobalScope(\App\Models\Scopes\TenantScope::class);
        }

        // Apply filters
        $this->applyFilters($query, $filters);

        return $query->get();
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
     * @param \Illuminate\Database\Eloquent\Builder $query The query builder to modify
     * @param array $filters Associative array of filter key-value pairs
     * @return void
     */
    private function applyFilters($query, array $filters): void
    {
        // Filter by specific status code
        if (!empty($filters['status'])) {
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
        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('start_date', [
                $filters['start_date'],
                $filters['end_date']
            ]);
        }

        // Filter by event type
        if (!empty($filters['event_type_id'])) {
            $query->where('event_type_id', $filters['event_type_id']);
        }
    }
}
