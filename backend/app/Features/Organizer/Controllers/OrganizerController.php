<?php

namespace App\Features\Organizer\Controllers;

use App\Features\Organizer\Requests\StoreOrganizerEventRequest;
use App\Features\Organizer\Requests\UpdateOrganizerEventRequest;
use App\Features\Organizer\Services\OrganizerService;
use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OrganizerController extends Controller
{
    public function __construct(
        private OrganizerService $organizerService
    ) {}

    /**
     * Get paginated list of organization's events with filters
     */
    public function events(Request $request): JsonResponse
    {
        try {
            $filters = [
                'search' => $request->input('search'),
                'status' => $request->input('status'),
            ];

            $perPage = $request->input('per_page', 10);
            $events = $this->organizerService->getPaginatedEvents(
                $request->user(),
                $filters,
                $perPage
            );

            return response()->json($events);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }

    /**
     * Alias for events()
     */
    public function index(Request $request): JsonResponse
    {
        return $this->events($request);
    }

    /**
     * Get single event by ID
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $event = $this->organizerService->getEventById($id, $request->user());
            return response()->json($event);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }

    /**
     * Create new event
     */
    public function store(StoreOrganizerEventRequest $request): JsonResponse
    {
        try {
            $event = $this->organizerService->createEvent($request->validated(), $request->user());

            return response()->json([
                'message' => 'Event created successfully',
                'event' => $event
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        } catch (\Exception $e) {
            Log::error('Failed to create event', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Error creating event: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update existing event
     */
    public function update(UpdateOrganizerEventRequest $request, int $id): JsonResponse
    {
        $user = $request->user();

        // Query by organization to enforce ownership (returns 404 if not found)
        $event = Event::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->with('status')
            ->firstOrFail();

        // Validate editable status with proper 403 response
        $editableStatuses = ['draft', 'requires_changes'];
        if (!in_array($event->status->status_code, $editableStatuses)) {
            return response()->json([
                'error' => 'Cannot edit event in current status',
                'current_status' => $event->status->status_code,
                'editable_statuses' => $editableStatuses
            ], 403);
        }

        try {
            $updatedEvent = $this->organizerService->updateEvent($event, $request->validated(), $user);

            return response()->json([
                'message' => 'Event updated successfully',
                'event' => $updatedEvent
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        } catch (\Exception $e) {
            Log::error('Failed to update event', [
                'user_id' => $user->id,
                'event_id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Delete event (draft status only)
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        // Query by organization to enforce ownership (returns 404 if not found)
        $event = Event::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->with('status')
            ->firstOrFail();

        // Validate deletable status (only drafts) with proper 403 response
        if ($event->status->status_code !== 'draft') {
            return response()->json([
                'error' => 'Can only delete draft events',
                'current_status' => $event->status->status_code
            ], 403);
        }

        try {
            $this->organizerService->deleteEvent($event, $user);
            return response()->json(['message' => 'Event deleted successfully']);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        } catch (\Exception $e) {
            Log::error('Failed to delete event', [
                'user_id' => $user->id,
                'event_id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get dashboard statistics
     */
    public function dashboardStats(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->organization_id) {
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        $stats = $this->organizerService->getDashboardStats($user->organization_id);

        return response()->json($stats);
    }
}
