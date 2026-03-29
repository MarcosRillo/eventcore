<?php

namespace App\Features\Events\Controllers;

use App\Features\Events\Requests\IndexEventsRequest;
use App\Features\Events\Requests\StoreEventRequest;
use App\Features\Events\Requests\UpdateEventRequest;
use App\Features\Events\Services\EventService;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class EventController extends Controller
{
    public function __construct(
        private EventService $eventService,
    ) {}

    /**
     * Display a listing of the events.
     * Uses validated pagination and filter parameters.
     */
    public function index(IndexEventsRequest $request)
    {
        $events = $this->eventService->getAllEvents(
            $request->user(),
            $request->validated(),
            $request->getPerPage(),
        );

        return EventResource::collection($events);
    }

    /**
     * Store a newly created event.
     */
    public function store(StoreEventRequest $request)
    {
        $event = $this->eventService->createEvent(
            $request->validated(),
            $request->user(),
        );

        return response()->json([
            'message' => 'Evento creado exitosamente',
            'data' => new EventResource($event),
        ], 201);
    }

    /**
     * Display the specified event.
     */
    public function show(Request $request, string $id)
    {
        $event = Event::withoutGlobalScopes()
            ->with(['eventType', 'eventSubtype', 'organization', 'status', 'format', 'locations', 'approvals'])
            ->findOrFail($id);

        Gate::authorize('view', $event);

        return new EventResource($event);
    }

    /**
     * Update the specified event.
     */
    public function update(UpdateEventRequest $request, string $id)
    {
        $event = Event::withoutGlobalScopes()->findOrFail($id);

        Gate::authorize('update', $event);

        $updated = $this->eventService->updateEvent(
            $event,
            $request->validated(),
            $request->user(),
        );

        return response()->json([
            'message' => 'Evento actualizado exitosamente',
            'data' => new EventResource($updated),
        ]);
    }

    /**
     * Remove the specified event.
     */
    public function destroy(Request $request, string $id)
    {
        $event = Event::withoutGlobalScopes()->with('status')->findOrFail($id);

        Gate::authorize('delete', $event);

        // Check if event is published using relationship
        if ($event->status && $event->status->status_code === 'published') {
            return response()->json([
                'message' => 'No se puede eliminar un evento publicado',
            ], 422);
        }

        $this->eventService->deleteEvent($event);

        return response()->noContent();
    }

    /**
     * Toggle featured status of an event.
     * Only entity_admin and platform_admin can toggle featured status.
     */
    public function toggleFeatured(Request $request, string $id)
    {
        $event = Event::withoutGlobalScopes()->findOrFail($id);

        Gate::authorize('toggleFeatured', $event);

        $updated = $this->eventService->toggleFeatured($event);

        return response()->json([
            'message' => 'Estado destacado actualizado',
            'data' => new EventResource($updated),
        ]);
    }

    /**
     * Duplicate an event.
     */
    public function duplicate(Request $request, string $id)
    {
        $event = Event::withoutGlobalScopes()->findOrFail($id);

        Gate::authorize('duplicate', $event);

        $duplicate = $this->eventService->duplicate($event);

        return response()->json([
            'message' => 'Evento duplicado exitosamente',
            'data' => new EventResource($duplicate),
        ], 201);
    }

    /**
     * Get event statistics.
     * Single query with conditional aggregation; cached per tenant for 60 seconds.
     */
    public function statistics(Request $request)
    {
        return response()->json(['data' => $this->eventService->getStatistics($request->user())]);
    }
}
