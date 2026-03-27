<?php

namespace App\Features\Organizer\Controllers;

use App\Features\Approval\Services\ApprovalStateMachine;
use App\Features\Events\Services\EventValidationService;
use App\Features\Organizer\Requests\IndexOrganizerEventRequest;
use App\Features\Organizer\Requests\StoreOrganizerEventRequest;
use App\Features\Organizer\Requests\UpdateOrganizerEventRequest;
use App\Features\Organizer\Services\OrganizerService;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class OrganizerController extends Controller
{
    public function __construct(
        private OrganizerService $organizerService,
        private EventValidationService $validationService,
        private ApprovalStateMachine $stateMachine,
    ) {}

    /**
     * Get paginated list of organization's events with filters.
     */
    public function index(IndexOrganizerEventRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $filters = [
            'search' => $validated['search'] ?? null,
            'status' => $validated['status'] ?? null,
            'show_past' => $validated['show_past'] ?? null,
        ];

        $events = $this->organizerService->getPaginatedEvents(
            $request->user(),
            $filters,
            $validated['per_page'] ?? 10,
        );

        return response()->json($events);
    }

    /**
     * Get single event by ID.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $event = $this->organizerService->getEventById($id, $request->user());
        Gate::authorize('view', $event);

        return response()->json($event);
    }

    /**
     * Create new event.
     */
    public function store(StoreOrganizerEventRequest $request): JsonResponse
    {
        $event = $this->organizerService->createEvent($request->validated(), $request->user());

        return response()->json([
            'message' => 'Event created successfully',
            'event' => $event,
        ], 201);
    }

    /**
     * Update existing event.
     */
    public function update(UpdateOrganizerEventRequest $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        Gate::authorize('update', $event);

        $updatedEvent = $this->organizerService->updateEvent($event, $request->validated(), $request->user());

        return response()->json([
            'message' => 'Event updated successfully',
            'event' => $updatedEvent,
        ]);
    }

    /**
     * Delete event (draft status only).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        Gate::authorize('delete', $event);

        if ($event->status->status_code !== 'draft') {
            return response()->json([
                'error' => 'Can only delete draft events',
                'current_status' => $event->status->status_code,
            ], 403);
        }

        $this->organizerService->deleteEvent($event, $request->user());

        return response()->json(['message' => 'Event deleted successfully']);
    }

    /**
     * Get dashboard statistics.
     */
    public function dashboardStats(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->organization_id) {
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        $stats = $this->organizerService->getDashboardStats($user->organization_id);

        return response()->json($stats);
    }

    /**
     * Submit event for internal review.
     */
    public function submit(Request $request, int $id): JsonResponse
    {
        $event = Event::with(['status', 'locations'])->findOrFail($id);
        Gate::authorize('submit', $event);

        $validationResult = $this->validationService->validateForInternalApproval($event);
        if (! $validationResult->isValid()) {
            return response()->json([
                'error' => 'Event is missing required fields',
                'errors' => $validationResult->getErrors(),
            ], 422);
        }

        $this->stateMachine->validateTransition($event, 'pending_internal_approval');

        $pendingStatus = EventStatus::where('status_code', 'pending_internal_approval')->first();

        return DB::transaction(function () use ($event, $pendingStatus) {
            $event->update(['status_id' => $pendingStatus->id]);
            $event->load('status');

            return response()->json([
                'message' => 'Event submitted for review',
                'status' => 'pending_internal_approval',
                'event' => $event,
            ]);
        });
    }
}
