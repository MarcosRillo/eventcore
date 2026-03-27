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
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
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

        DB::transaction(function () use ($event) {
            $event->delete();
        });

        return response()->json([
            'message' => 'Evento eliminado exitosamente',
        ], 200);
    }

    /**
     * Toggle featured status of an event.
     * Only entity_admin and platform_admin can toggle featured status.
     */
    public function toggleFeatured(Request $request, string $id)
    {
        $event = Event::withoutGlobalScopes()->findOrFail($id);

        Gate::authorize('toggleFeatured', $event);

        DB::transaction(function () use ($event) {
            $event->update(['is_featured' => ! $event->is_featured]);
        });

        return response()->json([
            'message' => 'Estado destacado actualizado',
            'data' => new EventResource($event->fresh()->load('status')),
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
    public function statistics()
    {
        $bindings = [];
        $tenantClause = $this->buildTenantClause($bindings);

        // Cache key is tenant-aware so different users get their own stats
        $user = Auth::user();
        $cacheKey = 'events.statistics.' . ($user?->organization_id ?? 'global');

        $stats = Cache::remember($cacheKey, 60, function () use ($bindings, $tenantClause) {
            $row = DB::selectOne("
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE es.status_code = 'published') AS published,
                    COUNT(*) FILTER (WHERE es.status_code IN ('pending_internal_approval', 'pending_public_approval')) AS pending,
                    COUNT(*) FILTER (WHERE es.status_code = 'draft') AS draft
                FROM events e
                JOIN event_statuses es ON es.id = e.status_id
                WHERE e.deleted_at IS NULL
                {$tenantClause}
            ", $bindings);

            return [
                'total'     => (int) $row->total,
                'published' => (int) $row->published,
                'pending'   => (int) $row->pending,
                'draft'     => (int) $row->draft,
            ];
        });

        return response()->json(['data' => $stats]);
    }

    /**
     * Build the tenant WHERE clause fragment and register its bindings.
     *
     * Safety note: this method interpolates only static SQL keywords
     * (e.g. `AND e.entity_id = :tenant_id`). All user-supplied values
     * are passed as named PDO parameters via the $bindings array and
     * never concatenated into the query string, so there is no SQL
     * injection risk.
     */
    private function buildTenantClause(array &$bindings): string
    {
        if (! Auth::check()) {
            return '';
        }

        $user = Auth::user();

        if ($user->isPlatformAdmin()) {
            return '';
        }

        if ($user->isEntityAdmin() || $user->isEntityStaff()) {
            $organizationId = $user->organization_id;

            if ($organizationId) {
                $bindings['tenant_id'] = $organizationId;

                return 'AND e.entity_id = :tenant_id';
            }

            return '';
        }

        if ($user->isOrganizerAdmin()) {
            $organizationId = $user->organization_id;

            if ($organizationId) {
                $bindings['tenant_id'] = $organizationId;

                return 'AND e.organization_id = :tenant_id';
            }
        }

        return '';
    }
}
