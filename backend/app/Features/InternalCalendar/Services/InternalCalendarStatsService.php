<?php

namespace App\Features\InternalCalendar\Services;

use App\Models\Event;
use App\Models\EventType;
use App\Models\Scopes\TenantScope;
use Illuminate\Support\Facades\Auth;

/**
 * Internal Calendar Stats Service
 *
 * Handles statistics calculations for internal calendar events.
 * Provides aggregated metrics for events with approved_internal or published status.
 *
 * Created: December 10, 2025 (Refactored from InternalCalendarStatsController)
 */
class InternalCalendarStatsService
{
    /**
     * Status codes to include in statistics.
     * Only events with these statuses are counted in stats.
     */
    private const STATS_STATUS_CODES = ['approved_internal', 'published'];

    /**
     * Get total count of internal calendar events.
     *
     * Counts all events with approved_internal or published status.
     * For privileged roles, counts across all organizations.
     *
     * @return int Total number of events
     */
    public function getTotalEvents(): int
    {
        $query = Event::query();

        if ($this->shouldBypassTenantScope()) {
            $query->withoutGlobalScope(TenantScope::class);
        }

        return $query->whereHas('status', function ($q) {
            $q->whereIn('status_code', self::STATS_STATUS_CODES);
        })->count();
    }

    /**
     * Get total count of active event types that have events.
     *
     * Counts event types that have at least one event with
     * approved_internal or published status.
     * For privileged roles, counts across all organizations.
     *
     * @return int Total number of event types with events
     */
    public function getTotalEventTypes(): int
    {
        $query = EventType::query();
        $bypass = $this->shouldBypassTenantScope();

        if ($bypass) {
            $query->withoutGlobalScope(TenantScope::class);
        }

        return $query->whereHas('events', function ($q) use ($bypass) {
            if ($bypass) {
                $q->withoutGlobalScope(TenantScope::class);
            }
            $q->whereHas('status', function ($statusQuery) {
                $statusQuery->whereIn('status_code', self::STATS_STATUS_CODES);
            });
        })->count();
    }

    /**
     * Get count of internal calendar events in current month.
     *
     * Counts events with approved_internal or published status
     * that start within the current calendar month.
     * For privileged roles, counts across all organizations.
     *
     * @return int Number of events this month
     */
    public function getEventsThisMonth(): int
    {
        $query = Event::query();

        if ($this->shouldBypassTenantScope()) {
            $query->withoutGlobalScope(TenantScope::class);
        }

        return $query->whereHas('status', function ($q) {
            $q->whereIn('status_code', self::STATS_STATUS_CODES);
        })
            ->whereBetween('start_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();
    }

    /**
     * Get all internal calendar statistics.
     *
     * Returns comprehensive statistics including:
     * - Total events count
     * - Total active event types count
     * - Events count for current month
     *
     * @return array<string, int> Associative array of statistics
     *
     * @example
     * ```php
     * $stats = $service->getStats();
     * // Returns: [
     * //   'total_events' => 42,
     * //   'total_event_types' => 8,
     * //   'events_this_month' => 15
     * // ]
     * ```
     */
    public function getStats(): array
    {
        return [
            'total_events' => $this->getTotalEvents(),
            'total_event_types' => $this->getTotalEventTypes(),
            'events_this_month' => $this->getEventsThisMonth(),
        ];
    }

    /**
     * Check if the current user's role should bypass TenantScope.
     *
     * Privileged roles see stats across all organizations,
     * matching the behavior of InternalCalendarService.
     */
    private function shouldBypassTenantScope(): bool
    {
        $user = Auth::user();
        $roleCode = $user?->role?->role_code;

        return $roleCode && in_array($roleCode, InternalCalendarService::PRIVILEGED_ROLES);
    }
}
