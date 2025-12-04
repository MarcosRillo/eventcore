<?php

namespace App\Features\Events\Controllers;

use App\Http\Controllers\Controller;
use App\Features\Events\Services\EventService;
use App\Models\Event;
use App\Features\Events\Requests\StoreEventRequest;
use App\Features\Events\Requests\UpdateEventRequest;
use App\Features\Events\Requests\IndexEventsRequest;
use App\Http\Resources\EventResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class EventController extends Controller
{
    public function __construct(
        private EventService $eventService
    ) {}

    /**
     * Authorize user access to an event.
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    private function authorizeEventAccess(Event $event, User $user, string $action = 'view'): void
    {
        // Platform admins can do everything
        if ($user->isPlatformAdmin()) {
            return;
        }

        $userOrgId = $user->organization_id;

        // Entity admin/staff: can access events in their entity
        if ($user->isEntityAdmin() || $user->isEntityStaff()) {
            if ($event->entity_id !== $userOrgId) {
                abort(403, 'No tienes permiso para acceder a este evento');
            }
            // Entity staff can only view, not modify
            if ($user->isEntityStaff() && in_array($action, ['update', 'delete'])) {
                abort(403, 'No tienes permiso para modificar eventos');
            }
            return;
        }

        // Organizer admin: can only access their own organization's events
        if ($user->isOrganizerAdmin()) {
            if ($event->organization_id !== $userOrgId) {
                abort(403, 'No tienes permiso para acceder a este evento');
            }
            return;
        }

        // Default: deny access
        abort(403, 'No tienes permiso para acceder a este evento');
    }

    /**
     * Display a listing of the events.
     * Uses validated pagination and filter parameters.
     */
    public function index(IndexEventsRequest $request)
    {
        $query = Event::query()
            ->with(['eventType', 'eventSubtype', 'organization', 'status', 'format', 'locations'])
            ->when($request->validated('search'), function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->validated('event_type_id'), function ($query, $eventTypeId) {
                $query->where('event_type_id', $eventTypeId);
            })
            ->when($request->validated('status_id'), function ($query, $statusId) {
                $query->where('status_id', $statusId);
            })
            ->when($request->validated('status'), function ($query, $statusCode) {
                $query->whereHas('status', function ($subQuery) use ($statusCode) {
                    $subQuery->where('status_code', $statusCode);
                });
            })
            ->when($request->has('is_featured'), function ($query) use ($request) {
                $query->where('is_featured', $request->validated('is_featured'));
            });

        // Apply date filtering and ordering
        if ($request->validated('show_past') === '1') {
            // Show only past events, ordered by end_date DESC (most recent first)
            $query->past();
            $events = $query->orderBy('end_date', 'desc')->paginate($request->getPerPage());
        } else {
            // Show only upcoming events (default), ordered by start_date ASC (closest first)
            $query->upcoming();
            $events = $query->orderBy('start_date', 'asc')->paginate($request->getPerPage());
        }

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
    public function show(Request $request, string $id)
    {
        $event = Event::withoutGlobalScopes()
                      ->with(['eventType', 'eventSubtype', 'organization', 'status', 'format', 'locations'])
                      ->findOrFail($id);

        $this->authorizeEventAccess($event, $request->user(), 'view');

        return new EventResource($event);
    }

    /**
     * Update the specified event.
     */
    public function update(UpdateEventRequest $request, string $id)
    {
        $event = Event::withoutGlobalScopes()->findOrFail($id);

        $this->authorizeEventAccess($event, $request->user(), 'update');

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
    public function destroy(Request $request, string $id)
    {
        $event = Event::withoutGlobalScopes()->with('status')->findOrFail($id);

        $this->authorizeEventAccess($event, $request->user(), 'delete');

        // Check if event is published using relationship
        if ($event->status && $event->status->status_code === 'published') {
            return response()->json([
                'message' => 'No se puede eliminar un evento publicado'
            ], 422);
        }

        DB::transaction(function () use ($event) {
            $event->delete();
        });

        return response()->json([
            'message' => 'Evento eliminado exitosamente'
        ], 200);
    }

    /**
     * Toggle featured status of an event.
     * Only entity_admin and platform_admin can toggle featured status.
     */
    public function toggleFeatured(Request $request, string $id)
    {
        $event = Event::withoutGlobalScopes()->findOrFail($id);

        $this->authorizeEventAccess($event, $request->user(), 'update');

        // Only entity admins or platform admins can toggle featured
        if (!$request->user()->hasAdminPrivileges()) {
            return response()->json([
                'message' => 'Solo administradores pueden destacar eventos'
            ], 403);
        }

        DB::transaction(function () use ($event) {
            $event->update(['is_featured' => !$event->is_featured]);
        });

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
        $event = Event::withoutGlobalScopes()->findOrFail($id);

        $this->authorizeEventAccess($event, $request->user(), 'view');

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