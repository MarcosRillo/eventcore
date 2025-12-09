<?php

namespace App\Features\InternalCalendar\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventType;
use Illuminate\Http\JsonResponse;

class InternalCalendarStatsController extends Controller
{
    /**
     * Get internal calendar statistics
     *
     * Returns statistics for events with approved_internal or published status:
     * - Total events count
     * - Total active event types count
     * - Events count for current month
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $stats = [
            'total_events' => Event::whereHas('status', function ($query) {
                $query->whereIn('status_code', ['approved_internal', 'published']);
            })->count(),

            'total_event_types' => EventType::whereHas('events', function ($query) {
                $query->whereHas('status', function ($statusQuery) {
                    $statusQuery->whereIn('status_code', ['approved_internal', 'published']);
                });
            })->count(),

            'events_this_month' => Event::whereHas('status', function ($query) {
                $query->whereIn('status_code', ['approved_internal', 'published']);
            })
            ->whereBetween('start_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->count(),
        ];

        return response()->json(['data' => $stats]);
    }
}
