<?php

namespace App\Features\Dashboard\Controllers;

use App\Http\Controllers\Controller;
use App\Features\Dashboard\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Dashboard Controller
 * 
 * Provides endpoints for entity admin/staff dashboard functionality
 * Handles events summary, filtered lists, and detailed views
 */
class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    /**
     * Get dashboard summary with event counters for each tab
     * 
     * @return JsonResponse
     */
    public function eventsSummary(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Verify user has required role
            if (!$this->canAccessDashboard($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Dashboard is only available for entity admin and entity staff users.',
                ], 403);
            }

            $summary = $this->dashboardService->getEventsSummary();

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Events summary retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve events summary',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get filtered and paginated events for dashboard tabs
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function events(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Verify user has required role
            if (!$this->canAccessDashboard($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Dashboard is only available for entity admin and entity staff users.',
                ], 403);
            }

            $tab = $request->get('tab', 'requires-action');
            $page = $request->get('page', 1);
            $search = $request->get('search', '');
            $perPage = 20;

            $result = $this->dashboardService->getFilteredEvents($tab, $page, $search, $perPage);

            return response()->json([
                'success' => true,
                'data' => $result['data'],
                'pagination' => $result['pagination'],
                'message' => 'Events retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve events',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get detailed event information for modal view
     * 
     * @param Request $request
     * @param int $eventId
     * @return JsonResponse
     */
    public function eventDetail(Request $request, int $eventId): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Verify user has required role
            if (!$this->canAccessDashboard($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Dashboard is only available for entity admin and entity staff users.',
                ], 403);
            }

            $eventDetail = $this->dashboardService->getEventDetail($eventId);

            if (!$eventDetail) {
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve event detail',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check if user can access dashboard functionality
     * 
     * @param mixed $user
     * @return bool
     */
    private function canAccessDashboard($user): bool
    {
        return $user && (
            $user->isEntityAdmin() || 
            $user->isEntityStaff()
        );
    }
}