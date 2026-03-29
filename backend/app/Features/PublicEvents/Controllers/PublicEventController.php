<?php

namespace App\Features\PublicEvents\Controllers;

use App\Features\PublicEvents\Requests\DateRangeRequest;
use App\Features\PublicEvents\Requests\FeaturedEventsRequest;
use App\Features\PublicEvents\Requests\IndexPublicEventsRequest;
use App\Features\PublicEvents\Requests\SearchPublicEventsRequest;
use App\Features\PublicEvents\Requests\UpcomingEventsRequest;
use App\Features\PublicEvents\Services\PublicEventService;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\EventType;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

/**
 * Public Event Controller
 *
 * Handles public API endpoints for events that don't require authentication.
 * Used by the public calendar for tourists visiting Tucumán.
 */
class PublicEventController extends Controller
{
    public function __construct(
        private PublicEventService $publicEventService,
    ) {}

    /**
     * Get paginated list of published events for public consumption.
     */
    public function index(IndexPublicEventsRequest $request): JsonResponse
    {
        $filters = $request->getFilters();
        $perPage = $request->getPerPage();
        $page = $request->getPage();

        $events = $this->publicEventService->getPublishedEvents($filters, $perPage, $page);

        return EventResource::collection($events)->response();
    }

    /**
     * Get a single published event by ID.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $event = $this->publicEventService->getPublishedEventById($id);

            return response()->json([
                'data' => new EventResource($event),
            ]);
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Event not found or not published',
            ], 404);
        }
    }

    /**
     * Get calendar view data for a specific month.
     */
    public function calendarMonth(int $year, int $month): JsonResponse
    {
        try {
            $data = $this->publicEventService->getCalendarMonth($year, $month);

            return response()->json([
                'events' => EventResource::collection($data['events']),
                'calendar' => $data['calendar'],
                'month_info' => $data['month_info'],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get events by date range.
     */
    public function dateRange(DateRangeRequest $request): JsonResponse
    {
        $events = $this->publicEventService->getEventsByDateRange(
            $request->validated('start'),
            $request->validated('end'),
        );

        return response()->json([
            'data' => EventResource::collection($events),
        ]);
    }

    /**
     * Get upcoming published events.
     */
    public function upcoming(UpcomingEventsRequest $request): JsonResponse
    {
        $events = $this->publicEventService->getUpcomingEvents($request->getLimit());

        return response()->json([
            'data' => EventResource::collection($events),
        ]);
    }

    /**
     * Get featured published events.
     */
    public function featured(FeaturedEventsRequest $request): JsonResponse
    {
        $events = $this->publicEventService->getFeaturedEvents($request->getLimit());

        return response()->json([
            'data' => EventResource::collection($events),
        ]);
    }

    /**
     * Search published events.
     */
    public function search(SearchPublicEventsRequest $request): JsonResponse
    {
        $result = $this->publicEventService->searchEvents(
            $request->validated('q'),
            $request->validated('event_type_id'),
            $request->getLimit(),
        );

        return response()->json([
            'data' => EventResource::collection($result['events']),
            'search_query' => $result['search_query'],
            'total_results' => $result['total_results'],
        ]);
    }

    /**
     * Get public statistics for the calendar.
     */
    public function stats(): JsonResponse
    {
        $stats = $this->publicEventService->getStats();

        return response()->json([
            'data' => $stats,
        ]);
    }

    /**
     * Get all active event types
     * GET /api/v1/public/event-types
     */
    public function eventTypes(): JsonResponse
    {
        return response()->json([
            'data' => $this->publicEventService->getActiveEventTypes(),
        ]);
    }

    /**
     * Get all active subtypes for a specific event type
     * GET /api/v1/public/event-types/{eventType}/subtypes
     */
    public function eventSubtypes(EventType $eventType): JsonResponse
    {
        return response()->json([
            'data' => $this->publicEventService->getActiveSubtypes($eventType),
        ]);
    }
}
