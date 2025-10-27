<?php

namespace App\Features\Dashboard\Controllers;

use App\Http\Controllers\Controller;
use App\Features\Dashboard\Services\OrganizerStatsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * OrganizerStatsController
 *
 * Handles organizer dashboard statistics requests.
 * Simple delegation to service layer.
 */
class OrganizerStatsController extends Controller
{
    public function __construct(
        private OrganizerStatsService $statsService
    ) {}

    /**
     * Get statistics for authenticated organizer.
     *
     * Returns event counts grouped by status:
     * - total_events: Total number of events
     * - pending_internal: Events pending internal approval (status_id 2)
     * - approved_internal: Events approved internally (status_id 3)
     * - pending_public: Events pending public approval (status_id 4)
     * - published: Events published to public calendar (status_id 5)
     * - requires_changes: Events requiring changes (status_id 6)
     * - rejected: Events rejected (status_id 7)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()->id;
            $stats = $this->statsService->getStats($userId);

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
