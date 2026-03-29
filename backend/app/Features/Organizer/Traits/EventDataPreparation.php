<?php

namespace App\Features\Organizer\Traits;

use App\Models\Event;
use App\Models\EventAsyncDate;
use App\Models\Organization;
use App\Models\User;

/**
 * Event Data Preparation Trait
 *
 * Handles data preparation logic for organizer event operations.
 * Updated for 3NF normalized schema (Nov 30, 2025).
 */
trait EventDataPreparation
{
    /**
     * Prepare event data for creation.
     *
     * @param  array  $data  Input data from request
     * @param  User  $user  The user creating the event
     * @param  int  $statusId  Status ID (draft)
     * @param  int  $formatId  Event format ID
     * @return array Prepared data for Event::create()
     */
    protected function prepareEventData(array $data, User $user, int $statusId, int $formatId): array
    {
        return array_merge(
            $this->getSystemFields($data, $user, $statusId, $formatId),
            $this->getEventFields($data),
        );
    }

    /**
     * Prepare event data for update.
     *
     * @param  array  $data  Input data from request
     * @param  Event  $event  The event being updated
     * @return array Prepared data for Event::update()
     */
    protected function prepareUpdateData(array $data, Event $event): array
    {
        $fields = $this->getEventFields($data);

        // Preserve format_id if not provided in update
        $fields['format_id'] = $data['format_id'] ?? $event->format_id;

        // Preserve or update producer_id (auto-filled on create, Dec 2, 2025)
        $fields['producer_id'] = $data['producer_id'] ?? $event->producer_id;

        return $fields;
    }

    /**
     * Get system fields for event creation.
     * producer_id defaults to organization_id if not explicitly provided (Dec 2, 2025).
     * entity_id uses parent_id when organizer, own ID when entity (Dec 4, 2025).
     */
    private function getSystemFields(array $data, User $user, int $statusId, int $formatId): array
    {
        // Get user's organization
        $organization = Organization::find($user->organization_id);

        // If organization has parent (is an organizer), use parent_id as entity_id
        // Otherwise (is an entity), use its own ID
        $entityId = $organization->parent_id ?? $user->organization_id;

        return [
            'organization_id' => $user->organization_id,
            'entity_id' => $entityId,
            'status_id' => $statusId,
            'created_by' => $user->id,
            'format_id' => $formatId,
            // producer_id defaults to organization_id if not explicitly provided
            'producer_id' => $data['producer_id'] ?? $user->organization_id,
        ];
    }

    /**
     * Get common event fields from input data.
     * Updated for 3NF normalized schema.
     */
    private function getEventFields(array $data): array
    {
        return [
            // Required fields
            'title' => $data['title'],
            'description' => $data['description'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'] ?? $data['start_date'],
            'event_type_id' => $data['event_type_id'],
            'event_subtype_id' => $data['event_subtype_id'],

            // Basic information
            'edition_number' => $data['edition_number'] ?? null,

            // Normalized FKs (Nov 30, 2025)
            // Note: producer_id is handled in getSystemFields (auto-fills with organization_id)
            'origin_id' => $data['origin_id'] ?? null,
            'frequency_id' => $data['frequency_id'] ?? null,
            'rotation_type_id' => $data['rotation_type_id'] ?? null,

            // Location info
            'maps_url' => $data['maps_url'] ?? null,
            'previous_venue' => $data['previous_venue'] ?? null,
            'next_venue' => $data['next_venue'] ?? null,

            // Attendance
            'local_attendance' => $data['local_attendance'] ?? null,
            'national_attendance' => $data['national_attendance'] ?? null,
            'international_attendance' => $data['international_attendance'] ?? null,

            // Additional information
            'event_website' => $data['event_website'] ?? null,

            // Images
            'logo_url' => $data['logo_url'] ?? null,
            'featured_image' => $data['featured_image'] ?? null,
            'responsive_image_url' => $data['responsive_image_url'] ?? null,
        ];
    }

    /**
     * Sync event services (pivot table).
     *
     * @param  Event  $event  The event
     * @param  array  $serviceIds  Array of service IDs
     */
    protected function syncEventServices(Event $event, array $serviceIds): void
    {
        // Sync services with is_included = true
        $services = collect($serviceIds)->mapWithKeys(fn ($id) => [
            $id => ['is_included' => true],
        ])->toArray();

        $event->services()->sync($services);
    }

    /**
     * Sync event rooms (pivot table).
     *
     * @param  Event  $event  The event
     * @param  array  $roomIds  Array of room IDs
     */
    protected function syncEventRooms(Event $event, array $roomIds): void
    {
        $event->rooms()->sync($roomIds);
    }

    /**
     * Sync async dates (separate table).
     *
     * @param  Event  $event  The event
     * @param  array  $asyncDates  Array of async date data
     */
    protected function syncAsyncDates(Event $event, array $asyncDates): void
    {
        // Delete existing async dates
        $event->asyncDates()->delete();

        // Create new async dates
        foreach ($asyncDates as $dateData) {
            EventAsyncDate::create([
                'event_id' => $event->id,
                'date_value' => $dateData['date'],
                'notes' => $dateData['notes'] ?? null,
            ]);
        }
    }

    /**
     * Handle all event relations after create/update.
     *
     * @param  Event  $event  The event
     * @param  array  $data  Request data
     */
    protected function syncEventRelations(Event $event, array $data): void
    {
        // Sync locations
        if (isset($data['location_ids'])) {
            $event->locations()->sync($data['location_ids']);
        }

        // Sync services
        if (isset($data['service_ids'])) {
            $this->syncEventServices($event, $data['service_ids']);
        }

        // Sync rooms
        if (isset($data['room_ids'])) {
            $this->syncEventRooms($event, $data['room_ids']);
        }

        // Sync async dates
        if (isset($data['async_dates'])) {
            $this->syncAsyncDates($event, $data['async_dates']);
        }
    }
}
