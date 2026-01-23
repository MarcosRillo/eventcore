<?php

namespace App\Features\Events\Services;

use App\Models\Event;

/**
 * EventValidationService - Validates events for approval workflows
 *
 * Updated for 3NF normalized schema (Nov 30, 2025).
 * Updated Dec 2, 2025: producer_id auto-filled, no longer required in validation.
 *
 * Internal approval requires 7 fields.
 * Public approval requires 18 fields total.
 */
class EventValidationService
{
    /**
     * Fields required for internal calendar approval
     * Note: location is validated separately (relation-based)
     * Note: producer_id is auto-filled on creation (Dec 2, 2025)
     * Note: event_type_id and event_subtype_id replace category_id (Dec 2, 2025)
     */
    private const INTERNAL_REQUIRED_FIELDS = [
        'title',
        'start_date',
        'end_date',
        'format_id',
        'event_type_id',
        'event_subtype_id',
        'edition_number',
    ];

    /**
     * Additional fields required for public calendar approval
     * Note: city/venue are now obtained from locations relation
     * Note: origin is now origin_id (FK)
     */
    private const PUBLIC_ADDITIONAL_FIELDS = [
        'description',
        'featured_image',
        'origin_id',  // FK to event_origins (normalized)
    ];

    /**
     * Validate event for internal calendar approval
     *
     * Requires 7 fields: title, start_date, end_date, format_id,
     * event_type_id, event_subtype_id, edition_number, and location (relation)
     */
    public function validateForInternalApproval(Event $event): ValidationResult
    {
        $result = new ValidationResult;

        // Validate basic required fields
        foreach (self::INTERNAL_REQUIRED_FIELDS as $field) {
            if ($this->isEmpty($event->$field)) {
                $result->addError($field, "El campo {$field} es requerido");
            }
        }

        // Location validation: requires at least one location relation
        if (! $this->hasLocation($event)) {
            $result->addError('location', 'Se requiere al menos una ubicación del evento');
        }

        return $result;
    }

    /**
     * Validate event for public calendar approval
     *
     * Requires all internal fields (8) plus additional public fields (11)
     * Total: 19 required fields
     */
    public function validateForPublicApproval(Event $event): ValidationResult
    {
        // Start with internal validation
        $result = $this->validateForInternalApproval($event);

        // Add public-specific validations
        foreach (self::PUBLIC_ADDITIONAL_FIELDS as $field) {
            if ($this->isEmpty($event->$field)) {
                $result->addError($field, "El campo {$field} es requerido para publicación");
            }
        }

        // Location must have city for public events
        if (! $this->locationHasCity($event)) {
            $result->addError('location_city', 'La ubicación debe tener ciudad para publicación');
        }

        // Attendance validation: at least one attendance field must be filled
        if (! $this->hasAttendance($event)) {
            $result->addError('attendance', 'Se requiere al menos un tipo de asistencia');
        }

        return $result;
    }

    /**
     * Get missing fields for a target status
     *
     * @param  Event  $event  The event to validate
     * @param  string  $targetStatus  The target status code
     * @return array<string, string> Missing fields with error messages
     */
    public function getMissingFields(Event $event, string $targetStatus): array
    {
        $result = match ($targetStatus) {
            'approved_internal', 'pending_internal_approval' => $this->validateForInternalApproval($event),
            'published', 'pending_public_approval' => $this->validateForPublicApproval($event),
            default => new ValidationResult,
        };

        return $result->getErrors();
    }

    /**
     * Check if a value is empty (null or empty string)
     */
    private function isEmpty(mixed $value): bool
    {
        return $value === null || $value === '';
    }

    /**
     * Check if event has at least one location relation
     */
    private function hasLocation(Event $event): bool
    {
        // Check for location relation (use loaded if available)
        if ($event->relationLoaded('locations')) {
            return $event->locations->count() > 0;
        }

        return $event->locations()->exists();
    }

    /**
     * Check if event location has city (for public visibility)
     */
    private function locationHasCity(Event $event): bool
    {
        if (! $this->hasLocation($event)) {
            return false;
        }

        // Load locations if not loaded
        if (! $event->relationLoaded('locations')) {
            $event->load('locations');
        }

        // Check if at least one location has a city
        return $event->locations->contains(fn ($location) => ! $this->isEmpty($location->city));
    }

    /**
     * Check if event has at least one attendance value
     */
    private function hasAttendance(Event $event): bool
    {
        return ! $this->isEmpty($event->local_attendance)
            || ! $this->isEmpty($event->national_attendance)
            || ! $this->isEmpty($event->international_attendance);
    }
}
