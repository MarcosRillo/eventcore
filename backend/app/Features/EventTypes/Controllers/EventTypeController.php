<?php

namespace App\Features\EventTypes\Controllers;

use App\Features\EventTypes\Requests\StoreEventTypeRequest;
use App\Features\EventTypes\Requests\UpdateEventTypeRequest;
use App\Features\EventTypes\Services\EventTypeService;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventTypeResource;
use App\Models\EventType;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * EventType Controller
 *
 * Handles event type CRUD operations.
 */
class EventTypeController extends Controller
{
    public function __construct(
        private EventTypeService $eventTypeService,
    ) {}

    /**
     * Display a listing of event types.
     */
    public function index(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $filters = [
            'search' => $request->input('search'),
            'is_active' => $request->has('is_active') ? filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN) : null,
            'per_page' => $request->input('per_page', 15),
            'page' => $request->input('page', 1),
        ];

        $eventTypes = $this->eventTypeService->getAllEventTypes(array_filter($filters, fn ($v) => $v !== null));

        return EventTypeResource::collection($eventTypes);
    }

    /**
     * Store a newly created event type.
     */
    public function store(StoreEventTypeRequest $request): JsonResponse
    {
        try {
            $eventType = $this->eventTypeService->createEventType(
                $request->validated(),
                $request->user(),
            );

            return response()->json([
                'success' => true,
                'message' => 'Event type created successfully',
                'data' => new EventTypeResource($eventType),
            ], 201);
        } catch (QueryException $e) {
            Log::error('Database error creating event type', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create event type due to database error',
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified event type.
     */
    public function show(EventType $eventType): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Event type retrieved successfully',
            'data' => new EventTypeResource($eventType),
        ]);
    }

    /**
     * Update the specified event type.
     */
    public function update(UpdateEventTypeRequest $request, EventType $eventType): JsonResponse
    {
        try {
            $updatedEventType = $this->eventTypeService->updateEventType(
                $eventType,
                $request->validated(),
            );

            return response()->json([
                'success' => true,
                'message' => 'Event type updated successfully',
                'data' => new EventTypeResource($updatedEventType),
            ]);
        } catch (QueryException $e) {
            Log::error('Database error updating event type', ['id' => $eventType->id, 'error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update event type due to database error',
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove the specified event type.
     */
    public function destroy(EventType $eventType): JsonResponse|\Illuminate\Http\Response
    {
        try {
            $this->eventTypeService->deleteEventType($eventType);

            return response()->noContent();
        } catch (QueryException $e) {
            Log::error('Database error deleting event type', ['id' => $eventType->id, 'error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event type. It may have associated subtypes.',
            ], 409);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Toggle event type active status.
     */
    public function toggleStatus(EventType $eventType): JsonResponse
    {
        $updatedEventType = $this->eventTypeService->toggleEventTypeStatus($eventType);

        return response()->json([
            'success' => true,
            'message' => 'Event type status updated successfully',
            'data' => new EventTypeResource($updatedEventType),
        ]);
    }

    /**
     * Get only active event types (useful for dropdowns).
     */
    public function active(): JsonResponse
    {
        $activeEventTypes = $this->eventTypeService->getActiveEventTypes();

        return response()->json([
            'success' => true,
            'message' => 'Active event types retrieved successfully',
            'data' => EventTypeResource::collection($activeEventTypes),
        ]);
    }

    /**
     * Get event type statistics.
     */
    public function stats(): JsonResponse
    {
        $stats = $this->eventTypeService->getEventTypeStats();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
