<?php

namespace App\Features\Dashboard\Controllers;

use App\Features\Dashboard\Requests\EventDetailRequest;
use App\Features\Dashboard\Requests\EventsSummaryRequest;
use App\Features\Dashboard\Requests\IndexDashboardEventsRequest;
use App\Features\Dashboard\Services\DashboardService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Dashboard Controller
 *
 * Provides endpoints for entity admin/staff dashboard functionality
 * Handles events summary, filtered lists, and detailed views
 */
class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService,
    ) {}

    /**
     * Get dashboard summary with event counters for each tab
     */
    public function eventsSummary(EventsSummaryRequest $request): JsonResponse
    {
        try {
            $summary = $this->dashboardService->getEventsSummary();

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Events summary retrieved successfully',
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve events summary',
                'error' => 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get filtered and paginated events for dashboard tabs
     */
    public function events(IndexDashboardEventsRequest $request): JsonResponse
    {
        try {
            $tab = $request->getTab();
            $page = $request->validated('page', 1) ?? 1;
            $search = $request->getSearch();
            $perPage = $request->getPerPage();

            $result = $this->dashboardService->getFilteredEvents($tab, $page, $search, $perPage);

            return response()->json([
                'success' => true,
                'data' => $result['data'],
                'pagination' => $result['pagination'],
                'message' => 'Events retrieved successfully',
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve events',
                'error' => 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get detailed event information for modal view
     */
    public function eventDetail(EventDetailRequest $request, int $eventId): JsonResponse
    {
        try {
            $eventDetail = $this->dashboardService->getEventDetail($eventId);

            if (! $eventDetail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $eventDetail,
                'message' => 'Event detail retrieved successfully',
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve event detail',
                'error' => 'Internal server error',
            ], 500);
        }
    }
}
