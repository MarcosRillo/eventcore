<?php

namespace App\Features\InternalCalendar\Controllers;

use App\Features\InternalCalendar\Requests\IndexInternalCalendarRequest;
use App\Features\InternalCalendar\Services\InternalCalendarService;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use Illuminate\Http\JsonResponse;

/**
 * Internal Calendar Controller
 *
 * Handles internal calendar API endpoints for authenticated users.
 * Shows approved_internal, pending_public_approval, and published events.
 *
 * Access Control:
 * - entity_admin: Can view all events (tenant scope disabled)
 * - entity_staff: Can view all events (tenant scope disabled)
 * - organizer_admin: Can view only their organization's events (tenant scope active)
 *
 * Created: December 4, 2025 (Internal Calendar feature)
 */
class InternalCalendarController extends Controller
{
    public function __construct(
        private InternalCalendarService $internalCalendarService,
    ) {}

    /**
     * Get internal calendar events with optional filters.
     *
     * Query Parameters:
     * - status (optional): Filter by status code (approved_internal, pending_public_approval, published)
     * - start_date (optional): Filter by start date (requires end_date)
     * - end_date (optional): Filter by end date (requires start_date)
     * - event_type_id (optional): Filter by event type ID
     *
     * @return JsonResponse Returns EventResource collection
     */
    public function index(IndexInternalCalendarRequest $request): JsonResponse
    {
        // Validation is handled by IndexInternalCalendarRequest
        $filters = $request->validated();

        $events = $this->internalCalendarService->getInternalCalendarEvents($filters);

        return response()->json([
            'data' => EventResource::collection($events),
        ]);
    }

    /**
     * Get a single internal calendar event by ID.
     *
     * Returns event details if the event exists and user has access.
     * Applies same role-based scoping as index method.
     *
     * @param  int  $id  Event ID
     * @return JsonResponse Returns EventResource or 404
     */
    public function show(int $id): JsonResponse
    {
        $event = $this->internalCalendarService->getEventById($id);

        if (! $event) {
            return response()->json([
                'message' => 'Event not found',
            ], 404);
        }

        return response()->json([
            'data' => new EventResource($event),
        ]);
    }

    /**
     * Get available event statuses for filtering.
     *
     * Returns the list of status codes visible in the internal calendar.
     * Used by frontend to populate filter dropdowns with valid options.
     *
     * @return JsonResponse Returns array of status codes
     */
    public function eventStatuses(): JsonResponse
    {
        $statuses = $this->internalCalendarService->getAvailableStatuses();

        return response()->json([
            'data' => $statuses,
        ]);
    }
}
