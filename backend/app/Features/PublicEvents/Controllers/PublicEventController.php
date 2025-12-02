<?php

namespace App\Features\PublicEvents\Controllers;

use App\Features\PublicEvents\Services\PublicEventService;
use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\EventResource;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public Event Controller
 *
 * Handles public API endpoints for events that don't require authentication.
 * Used by the public calendar for tourists visiting Tucumán.
 */
class PublicEventController extends Controller
{
    public function __construct(
        private PublicEventService $publicEventService
    ) {}

    /**
     * Get paginated list of published events for public consumption.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'search' => 'sometimes|string|max:255',
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:50',
        ]);

        $filters = $request->only(['category_id', 'date_from', 'date_to', 'search']);
        $perPage = $request->get('per_page', 15);

        $events = $this->publicEventService->getPublishedEvents($filters, $perPage);

        return response()->json($events);
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
     * Get published categories with event counts.
     */
    public function categories(): JsonResponse
    {
        $categories = $this->publicEventService->getPublicCategories();

        return response()->json([
            'data' => $categories,
        ]);
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
    public function dateRange(Request $request): JsonResponse
    {
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
        ]);

        $events = $this->publicEventService->getEventsByDateRange(
            $request->start,
            $request->end
        );

        return response()->json([
            'data' => EventResource::collection($events),
        ]);
    }

    /**
     * Get upcoming published events.
     */
    public function upcoming(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);

        $events = $this->publicEventService->getUpcomingEvents($limit);

        return response()->json([
            'data' => EventResource::collection($events),
        ]);
    }

    /**
     * Get featured published events.
     */
    public function featured(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 6);

        $events = $this->publicEventService->getFeaturedEvents($limit);

        return response()->json([
            'data' => EventResource::collection($events),
        ]);
    }

    /**
     * Search published events.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'limit' => 'sometimes|integer|min:1|max:50',
        ]);

        $result = $this->publicEventService->searchEvents(
            $request->q,
            $request->category_id,
            $request->get('limit', 15)
        );

        return response()->json([
            'data' => EventResource::collection($result['events']),
            'search_query' => $result['search_query'],
            'total_results' => $result['total_results'],
        ]);
    }

    /**
     * Get events by category.
     */
    public function byCategory(int $categoryId, Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $result = $this->publicEventService->getEventsByCategory($categoryId, $perPage);

            return response()->json([
                'category' => new CategoryResource($result['category']),
                'events' => $result['events'],
            ]);
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Category not found or inactive',
            ], 404);
        }
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
}
