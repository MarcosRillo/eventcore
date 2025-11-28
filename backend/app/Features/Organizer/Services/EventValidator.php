<?php

namespace App\Features\Organizer\Services;

use App\Models\Event;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/**
 * Event Validator
 *
 * Handles validation logic for organizer event operations.
 * Validates editability, deletability, and ownership of events.
 */
class EventValidator
{
    /**
     * Editable status codes for events.
     */
    private const EDITABLE_STATUSES = ['draft', 'requires_changes'];

    /**
     * Validate that an event can be edited.
     *
     * @param Event $event
     * @throws ValidationException
     */
    public function validateEditable(Event $event): void
    {
        $event->loadMissing('status');

        if (!in_array($event->status->status_code, self::EDITABLE_STATUSES)) {
            throw ValidationException::withMessages([
                'status' => ['Cannot edit event in current status: ' . $event->status->status_code],
            ]);
        }
    }

    /**
     * Validate that an event can be deleted.
     *
     * @param Event $event
     * @throws ValidationException
     */
    public function validateDeletable(Event $event): void
    {
        $event->loadMissing('status');

        if ($event->status->status_code !== 'draft') {
            throw ValidationException::withMessages([
                'status' => ['Can only delete draft events. Current status: ' . $event->status->status_code],
            ]);
        }
    }

    /**
     * Validate event ownership by user's organization.
     *
     * @param Event $event
     * @param User $user
     * @throws ValidationException
     */
    public function validateOwnership(Event $event, User $user): void
    {
        if ($event->organization_id !== $user->organization_id) {
            throw ValidationException::withMessages([
                'event' => ['You do not have permission to modify this event.'],
            ]);
        }
    }

    /**
     * Validate user has an associated organization.
     *
     * @param User $user
     * @throws \RuntimeException
     */
    public function validateUserHasOrganization(User $user): void
    {
        if (!$user->organization_id) {
            throw new \RuntimeException('User not associated with organization');
        }
    }

    /**
     * Validate all preconditions for event update.
     *
     * @param Event $event
     * @param User $user
     * @throws ValidationException|\RuntimeException
     */
    public function validateForUpdate(Event $event, User $user): void
    {
        $this->validateUserHasOrganization($user);
        $this->validateEditable($event);
        $this->validateOwnership($event, $user);
    }

    /**
     * Validate all preconditions for event deletion.
     *
     * @param Event $event
     * @param User $user
     * @throws ValidationException|\RuntimeException
     */
    public function validateForDelete(Event $event, User $user): void
    {
        $this->validateUserHasOrganization($user);
        $this->validateDeletable($event);
        $this->validateOwnership($event, $user);
    }
}
