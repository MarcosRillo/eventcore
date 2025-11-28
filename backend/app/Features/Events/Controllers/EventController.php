<?php

namespace App\Features\Events\Controllers;

use App\Http\Controllers\Controller;
use App\Features\Events\Services\EventService;
use App\Models\Event;
use App\Features\Events\Requests\StoreEventRequest;
use App\Features\Events\Requests\UpdateEventRequest;
use App\Http\Resources\EventResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    public function __construct(
        private EventService $eventService
    ) {}

    /**
     * Display a listing of the events.
     * SIMPLE: Usando Eloquent directo, sin repository pattern
     */
    public function index(Request $request)
    {
        $events = Event::query()
            ->with(['category', 'organization', 'status', 'type', 'locations'])
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->status_id, function ($query, $statusId) {
                $query->where('status_id', $statusId);
            })
            ->when($request->is_featured !== null, function ($query) use ($request) {
                $query->where('is_featured', $request->is_featured);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return EventResource::collection($events);
    }

    /**
     * Store a newly created event.
     */
    public function store(StoreEventRequest $request)
    {
        $event = $this->eventService->createEvent(
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'message' => 'Evento creado exitosamente',
            'data' => new EventResource($event)
        ], 201);
    }

    /**
     * Display the specified event.
     */
    public function show(string $id)
    {
        $event = Event::with(['category', 'organization', 'status', 'type', 'locations'])
                      ->findOrFail($id);

        return new EventResource($event);
    }

    /**
     * Update the specified event.
     */
    public function update(UpdateEventRequest $request, string $id)
    {
        $event = Event::findOrFail($id);

        $updated = $this->eventService->updateEvent(
            $event,
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'message' => 'Evento actualizado exitosamente',
            'data' => new EventResource($updated)
        ]);
    }

    /**
     * Remove the specified event.
     */
    public function destroy(string $id)
    {
        $event = Event::with('status')->findOrFail($id);

        // Check if event is published using relationship
        if ($event->status && $event->status->status_code === 'published') {
            return response()->json([
                'message' => 'No se puede eliminar un evento publicado'
            ], 422);
        }

        $event->delete();

        return response()->json([
            'message' => 'Evento eliminado exitosamente'
        ], 200);
    }

    /**
     * Toggle featured status of an event.
     */
    public function toggleFeatured(string $id)
    {
        $event = Event::findOrFail($id);

        // Lógica simple y directa
        $event->update(['is_featured' => !$event->is_featured]);

        return response()->json([
            'message' => 'Estado destacado actualizado',
            'data' => new EventResource($event->fresh())
        ]);
    }

    /**
     * Duplicate an event.
     */
    public function duplicate(Request $request, string $id)
    {
        $event = Event::findOrFail($id);

        $duplicate = $this->eventService->duplicate($event);

        return response()->json([
            'message' => 'Evento duplicado exitosamente',
            'data' => new EventResource($duplicate)
        ], 201);
    }

    /**
     * Get event statistics.
     */
    public function statistics()
    {
        $stats = [
            'total' => Event::count(),
            'published' => Event::whereHas('status', fn($q) => $q->where('status_code', 'published'))->count(),
            'pending' => Event::whereHas('status', fn($q) => $q->whereIn('status_code', ['pending_internal_approval', 'pending_public_approval']))->count(),
            'draft' => Event::whereHas('status', fn($q) => $q->where('status_code', 'draft'))->count(),
        ];

        return response()->json(['data' => $stats]);
    }
}