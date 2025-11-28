<?php

namespace App\Features\Organizer\Services;

use App\Features\Organizer\Traits\EventDataPreparation;
use App\Models\Event;
use App\Models\EventStatus;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Organizer Service
 *
 * Handles business logic for organizer event operations.
 * Uses EventValidator for validation and EventDataPreparation trait for data mapping.
 */
class OrganizerService
{
    use EventDataPreparation;

    public function __construct(
        private EventValidator $validator
    ) {}

    /**
     * Create a new event for the organizer.
     */
    public function createEvent(array $data, User $user): Event
    {
        $this->validator->validateUserHasOrganization($user);

        $draftStatus = EventStatus::where('status_code', 'draft')->first();
        if (!$draftStatus) {
            throw new \RuntimeException('Draft status not found in database');
        }

        $typeId = $data['type_id'] ?? DB::table('event_types')->first()?->id;
        if (!$typeId) {
            throw new \RuntimeException('No event types found in database');
        }

        return DB::transaction(function () use ($data, $user, $draftStatus, $typeId) {
            $eventData = $this->prepareEventData($data, $user, $draftStatus->id, $typeId);
            $event = Event::create($eventData);

            if (!empty($data['location_ids']) && is_array($data['location_ids'])) {
                $event->locations()->sync($data['location_ids']);
            }

            Log::info('Organizer event created', [
                'event_id' => $event->id,
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
            ]);

            return $event->load(['category', 'locations', 'status', 'type']);
        });
    }

    /**
     * Update an existing event.
     */
    public function updateEvent(Event $event, array $data, User $user): Event
    {
        $this->validator->validateForUpdate($event, $user);

        return DB::transaction(function () use ($event, $data, $user) {
            $updateData = $this->prepareUpdateData($data, $event);
            $event->update($updateData);

            if (!empty($data['location_ids']) && is_array($data['location_ids'])) {
                $event->locations()->sync($data['location_ids']);
            }

            Log::info('Organizer event updated', [
                'event_id' => $event->id,
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
            ]);

            return $event->fresh(['category', 'locations', 'status', 'type']);
        });
    }

    /**
     * Delete an event (only draft status allowed).
     */
    public function deleteEvent(Event $event, User $user): void
    {
        $this->validator->validateForDelete($event, $user);

        $eventId = $event->id;

        DB::transaction(function () use ($event) {
            $event->delete();
        });

        Log::info('Organizer event deleted', [
            'event_id' => $eventId,
            'user_id' => $user->id,
            'organization_id' => $user->organization_id,
        ]);
    }

    /**
     * Get paginated events for the organizer's organization.
     */
    public function getPaginatedEvents(User $user, array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $this->validator->validateUserHasOrganization($user);

        $query = Event::withoutGlobalScopes()
            ->with(['status', 'category', 'locations'])
            ->where('organization_id', $user->organization_id);

        if (!empty($filters['search'])) {
            $query->where('title', 'ILIKE', "%{$filters['search']}%");
        }

        if (!empty($filters['status'])) {
            $query->whereHas('status', function ($q) use ($filters) {
                $q->where('status_code', $filters['status']);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get a single event by ID for the organizer's organization.
     */
    public function getEventById(int $id, User $user): Event
    {
        $this->validator->validateUserHasOrganization($user);

        return Event::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->with(['category', 'locations', 'status', 'type', 'creator'])
            ->firstOrFail();
    }

    /**
     * Get dashboard statistics for an organization.
     *
     * @param int $organizationId The organization ID
     * @return array<string, int> Statistics array with counts per status
     */
    public function getDashboardStats(int $organizationId): array
    {
        $baseQuery = Event::where('organization_id', $organizationId);

        return [
            'total_events' => (clone $baseQuery)->count(),
            'draft' => (clone $baseQuery)
                ->whereHas('status', fn($q) => $q->where('status_code', 'draft'))
                ->count(),
            'pending_approval' => (clone $baseQuery)
                ->whereHas('status', fn($q) => $q->where('status_code', 'pending_internal_approval'))
                ->count(),
            'approved_internal' => (clone $baseQuery)
                ->whereHas('status', fn($q) => $q->where('status_code', 'approved_internal'))
                ->count(),
            'published' => (clone $baseQuery)
                ->whereHas('status', fn($q) => $q->where('status_code', 'published'))
                ->count(),
            'requires_changes' => (clone $baseQuery)
                ->whereHas('status', fn($q) => $q->where('status_code', 'requires_changes'))
                ->count(),
            'rejected' => (clone $baseQuery)
                ->whereHas('status', fn($q) => $q->where('status_code', 'rejected'))
                ->count(),
            'archived' => (clone $baseQuery)
                ->whereHas('status', fn($q) => $q->where('status_code', 'cancelled'))
                ->count(),
        ];
    }
}
