<?php

namespace App\Features\EventTypes\Controllers;

use App\Features\EventTypes\Requests\StoreEventSubtypeRequest;
use App\Features\EventTypes\Requests\UpdateEventSubtypeRequest;
use App\Features\EventTypes\Services\EventSubtypeService;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventSubtypeResource;
use App\Models\EventSubtype;
use App\Models\EventType;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;

/**
 * EventSubtype Controller
 *
 * Handles event subtype CRUD operations within an event type context.
 */
class EventSubtypeController extends Controller
{
    public function __construct(
        private EventSubtypeService $eventSubtypeService,
    ) {}

    /**
     * Display a listing of subtypes for an event type.
     */
    public function index(Request $request, EventType $eventType): AnonymousResourceCollection
    {
        $filters = [
            'search' => $request->input('search'),
            'is_active' => $request->has('is_active') ? filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN) : null,
            'per_page' => $request->input('per_page', 15),
            'page' => $request->input('page', 1),
        ];

        $subtypes = $this->eventSubtypeService->getSubtypesForEventType(
            $eventType,
            array_filter($filters, fn ($v) => $v !== null),
        );

        return EventSubtypeResource::collection($subtypes);
    }

    /**
     * Store a newly created subtype for an event type.
     */
    public function store(StoreEventSubtypeRequest $request, EventType $eventType): JsonResponse
    {
        try {
            $subtype = $this->eventSubtypeService->createEventSubtype(
                $eventType,
                $request->validated(),
                $request->user(),
            );

            return response()->json([
                'success' => true,
                'message' => 'Event subtype created successfully',
                'data' => new EventSubtypeResource($subtype),
            ], 201);
        } catch (QueryException $e) {
            Log::error('Database error creating event subtype', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create event subtype due to database error',
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified subtype.
     */
    public function show(EventType $eventType, EventSubtype $subtype): JsonResponse
    {
        $this->verifySubtypeOwnership($eventType, $subtype);

        return response()->json([
            'success' => true,
            'message' => 'Event subtype retrieved successfully',
            'data' => new EventSubtypeResource($subtype),
        ]);
    }

    /**
     * Update the specified subtype.
     */
    public function update(UpdateEventSubtypeRequest $request, EventType $eventType, EventSubtype $subtype): JsonResponse
    {
        $this->verifySubtypeOwnership($eventType, $subtype);

        try {
            $updatedSubtype = $this->eventSubtypeService->updateEventSubtype(
                $subtype,
                $request->validated(),
            );

            return response()->json([
                'success' => true,
                'message' => 'Event subtype updated successfully',
                'data' => new EventSubtypeResource($updatedSubtype),
            ]);
        } catch (QueryException $e) {
            Log::error('Database error updating event subtype', ['id' => $subtype->id, 'error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update event subtype due to database error',
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove the specified subtype.
     */
    public function destroy(EventType $eventType, EventSubtype $subtype): JsonResponse
    {
        $this->verifySubtypeOwnership($eventType, $subtype);

        try {
            $message = $this->eventSubtypeService->deleteEventSubtype($subtype);

            return response()->json([
                'success' => true,
                'message' => $message,
            ]);
        } catch (QueryException $e) {
            Log::error('Database error deleting event subtype', ['id' => $subtype->id, 'error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event subtype. It may have associated events.',
            ], 409);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Toggle subtype active status.
     */
    public function toggleStatus(EventType $eventType, EventSubtype $subtype): JsonResponse
    {
        $this->verifySubtypeOwnership($eventType, $subtype);

        $updatedSubtype = $this->eventSubtypeService->toggleEventSubtypeStatus($subtype);

        return response()->json([
            'success' => true,
            'message' => 'Event subtype status updated successfully',
            'data' => new EventSubtypeResource($updatedSubtype),
        ]);
    }

    /**
     * Get only active subtypes for an event type (useful for dropdowns).
     */
    public function active(EventType $eventType): JsonResponse
    {
        $activeSubtypes = $this->eventSubtypeService->getActiveSubtypesForEventType($eventType);

        return response()->json([
            'success' => true,
            'message' => 'Active event subtypes retrieved successfully',
            'data' => EventSubtypeResource::collection($activeSubtypes),
        ]);
    }

    /**
     * Abort with 404 JSON if the subtype does not belong to the given event type.
     */
    private function verifySubtypeOwnership(EventType $eventType, EventSubtype $subtype): void
    {
        if ($subtype->event_type_id !== $eventType->id) {
            abort(response()->json([
                'success' => false,
                'message' => 'Subtype does not belong to this event type',
            ], 404));
        }
    }
}
