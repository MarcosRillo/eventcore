<?php

namespace App\Features\InternalCalendar\Controllers;

use App\Features\InternalCalendar\Services\InternalCalendarStatsService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class InternalCalendarStatsController extends Controller
{
    /**
     * Inject Internal Calendar Stats Service
     *
     * @param InternalCalendarStatsService $statsService Service for calculating stats
     */
    public function __construct(
        private InternalCalendarStatsService $statsService
    ) {}

    /**
     * Get internal calendar statistics
     *
     * Returns statistics for events with approved_internal or published status:
     * - Total events count
     * - Total active event types count
     * - Events count for current month
     *
     * Delegates all business logic to InternalCalendarStatsService.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $stats = $this->statsService->getStats();

        return response()->json(['data' => $stats]);
    }
}
