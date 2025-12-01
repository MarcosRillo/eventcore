<?php

namespace App\Features\Organizer\Traits;

use App\Models\Event;
use App\Models\EventAsyncDate;
use App\Models\User;
use Illuminate\Support\Facades\DB;

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
     * @param array $data Input data from request
     * @param User $user The user creating the event
     * @param int $statusId Status ID (draft)
     * @param int $typeId Event type ID
     * @return array Prepared data for Event::create()
     */
    protected function prepareEventData(array $data, User $user, int $statusId, int $typeId): array
    {
        return array_merge(
            $this->getSystemFields($user, $statusId, $typeId),
            $this->getEventFields($data)
        );
    }

    /**
     * Prepare event data for update.
     *
     * @param array $data Input data from request
     * @param Event $event The event being updated
     * @return array Prepared data for Event::update()
     */
    protected function prepareUpdateData(array $data, Event $event): array
    {
        $fields = $this->getEventFields($data);

        // Preserve type_id if not provided in update
        $fields['type_id'] = $data['type_id'] ?? $event->type_id;

        return $fields;
    }

    /**
     * Get system fields for event creation.
     */
    private function getSystemFields(User $user, int $statusId, int $typeId): array
    {
        return [
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'status_id' => $statusId,
            'created_by' => $user->id,
            'type_id' => $typeId,
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
            'category_id' => $data['category_id'],

            // Basic information
            'edition_number' => $data['edition_number'] ?? null,

            // Normalized FKs (Nov 30, 2025)
            'subtype_id' => $data['subtype_id'] ?? null,
            'origin_id' => $data['origin_id'] ?? null,
            'theme_id' => $data['theme_id'] ?? null,
            'frequency_id' => $data['frequency_id'] ?? null,
            'rotation_type_id' => $data['rotation_type_id'] ?? null,
            'producer_id' => $data['producer_id'] ?? null,

            // Location info
            'maps_url' => $data['maps_url'] ?? null,
            'previous_venue' => $data['previous_venue'] ?? null,
            'next_venue' => $data['next_venue'] ?? null,

            // Attendance
            'local_attendance' => $data['local_attendance'] ?? null,
            'national_attendance' => $data['national_attendance'] ?? null,
            'international_attendance' => $data['international_attendance'] ?? null,
            'virtual_transmission' => $data['virtual_transmission'] ?? false,

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
     * @param Event $event The event
     * @param array $serviceIds Array of service IDs
     */
    protected function syncEventServices(Event $event, array $serviceIds): void
    {
        // Sync services with is_included = true
        $services = collect($serviceIds)->mapWithKeys(fn ($id) => [
            $id => ['is_included' => true]
        ])->toArray();

        $event->services()->sync($services);
    }

    /**
     * Sync event rooms (pivot table).
     *
     * @param Event $event The event
     * @param array $roomIds Array of room IDs
     */
    protected function syncEventRooms(Event $event, array $roomIds): void
    {
        $event->rooms()->sync($roomIds);
    }

    /**
     * Sync async dates (separate table).
     *
     * @param Event $event The event
     * @param array $asyncDates Array of async date data
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
     * @param Event $event The event
     * @param array $data Request data
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
