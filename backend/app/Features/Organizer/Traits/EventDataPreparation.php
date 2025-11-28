<?php

namespace App\Features\Organizer\Traits;

use App\Models\Event;
use App\Models\User;

/**
 * Event Data Preparation Trait
 *
 * Handles data preparation logic for organizer event operations.
 * Consolidates field mapping for create and update operations.
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
     * Consolidates field mapping used by both create and update operations.
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
            'event_type' => $data['event_type'] ?? null,
            'event_subtype' => $data['event_subtype'] ?? null,
            'origin' => $data['origin'] ?? null,
            'theme' => $data['theme'] ?? null,
            'frequency' => $data['frequency'] ?? null,
            'rotation_type' => $data['rotation_type'] ?? null,

            // Catering services
            'coffee_break' => $data['coffee_break'] ?? false,
            'lunch_catering' => $data['lunch_catering'] ?? false,
            'dinner_catering' => $data['dinner_catering'] ?? false,
            'pre_event_package' => $data['pre_event_package'] ?? false,
            'post_event_package' => $data['post_event_package'] ?? false,

            // Location
            'venue' => $data['venue'] ?? null,
            'city' => $data['city'] ?? null,
            'rooms_used' => $data['rooms_used'] ?? null,
            'maps_url' => $data['maps_url'] ?? null,
            'previous_venue' => $data['previous_venue'] ?? null,
            'next_venue' => $data['next_venue'] ?? null,

            // Asynchronous dates
            'asynchronous_dates' => $data['asynchronous_dates'] ?? null,

            // Attendance
            'local_attendance' => $data['local_attendance'] ?? null,
            'national_attendance' => $data['national_attendance'] ?? null,
            'international_attendance' => $data['international_attendance'] ?? null,
            'virtual_transmission' => $data['virtual_transmission'] ?? false,

            // Additional information
            'producer' => $data['producer'] ?? null,
            'event_website' => $data['event_website'] ?? null,

            // Images
            'logo_url' => $data['logo_url'] ?? null,
            'featured_image' => $data['featured_image'] ?? null,
            'responsive_image_url' => $data['responsive_image_url'] ?? null,

            // Legacy fields
            'max_attendees' => $data['max_attendees'] ?? null,
            'virtual_link' => $data['virtual_link'] ?? null,
            'cta_link' => $data['cta_link'] ?? null,
            'cta_text' => $data['cta_text'] ?? null,
        ];
    }
}
