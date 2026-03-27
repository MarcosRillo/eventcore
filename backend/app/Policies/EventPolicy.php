<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

/**
 * Event Policy
 *
 * Centralizes authorization logic for Event model operations.
 * Handles role-based access control for different user types:
 * - Platform Admin: Full access to all events
 * - Entity Admin: Full access to events in their entity
 * - Entity Staff: Read-only access to events in their entity
 * - Organizer Admin: Full access to their organization's events only
 */
class EventPolicy
{
    /**
     * Perform pre-authorization checks.
     * Platform admins bypass all other checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isPlatformAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Determine if the user can view any events.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can view the event.
     */
    public function view(User $user, Event $event): bool
    {
        return $this->canAccessEvent($user, $event);
    }

    /**
     * Determine if the user can create events.
     */
    public function create(User $user): bool
    {
        return $user->isEntityAdmin() || $user->isOrganizerAdmin();
    }

    /**
     * Determine if the user can update the event.
     */
    public function update(User $user, Event $event): bool
    {
        if (! $this->canAccessEvent($user, $event)) {
            return false;
        }

        // Entity staff can only view, not modify
        if ($user->isEntityStaff()) {
            return false;
        }

        return true;
    }

    /**
     * Determine if the user can delete the event.
     */
    public function delete(User $user, Event $event): bool
    {
        if (! $this->canAccessEvent($user, $event)) {
            return false;
        }

        // Entity staff can only view, not modify
        if ($user->isEntityStaff()) {
            return false;
        }

        return true;
    }

    /**
     * Determine if the user can toggle featured status.
     * Only entity admins can toggle featured status.
     */
    public function toggleFeatured(User $user, Event $event): bool
    {
        if (! $this->canAccessEvent($user, $event)) {
            return false;
        }

        return $user->hasAdminPrivileges();
    }

    /**
     * Determine if the user can duplicate the event.
     * Same as view - if you can see it, you can duplicate it.
     */
    public function duplicate(User $user, Event $event): bool
    {
        return $this->canAccessEvent($user, $event);
    }

    /**
     * Determine if the user can approve the event.
     *
     * Approval can be done by entity admins when event is pending approval.
     * Event must be in pending_internal_approval or pending_public_approval status.
     */
    public function approve(User $user, Event $event): bool
    {
        if (! $this->canAccessEvent($user, $event)) {
            return false;
        }

        // Event must be in approval-eligible status
        // Includes approved_internal for requestPublicApproval action
        $statusCode = $event->status?->status_code;

        return in_array($statusCode, [
            'pending_internal_approval',
            'pending_public_approval',
            'approved_internal',
        ]);
    }

    /**
     * Determine if the user can reject the event.
     *
     * Rejection can be done by entity admins when event is in approval workflow.
     * Event must be in pending_internal_approval or pending_public_approval status.
     */
    public function reject(User $user, Event $event): bool
    {
        if (! $this->canAccessEvent($user, $event)) {
            return false;
        }

        // Event must be in approval workflow
        $statusCode = $event->status?->status_code;

        return in_array($statusCode, [
            'pending_internal_approval',
            'pending_public_approval',
        ]);
    }

    /**
     * Determine if the user can publish the event.
     *
     * Publishing can be done by entity admins when event is approved internally
     * or pending public approval.
     */
    public function publish(User $user, Event $event): bool
    {
        if (! $this->canAccessEvent($user, $event)) {
            return false;
        }

        // Event must be ready for publishing
        $statusCode = $event->status?->status_code;

        return in_array($statusCode, [
            'approved_internal',
            'pending_public_approval',
        ]);
    }

    /**
     * Determine if the user can submit the event for review.
     *
     * Only the event's organizer can submit, and only from draft or requires_changes status.
     */
    public function submit(User $user, Event $event): bool
    {
        if (! $this->canAccessEvent($user, $event)) {
            return false;
        }

        $statusCode = $event->status?->status_code;

        return in_array($statusCode, ['draft', 'requires_changes']);
    }

    /**
     * Determine if the user can request changes on the event.
     *
     * Requesting changes can be done by entity admins or staff when event
     * is in the approval workflow.
     */
    public function requestChanges(User $user, Event $event): bool
    {
        if (! $this->canAccessEvent($user, $event)) {
            return false;
        }

        // Event must be in approval workflow
        $statusCode = $event->status?->status_code;

        return in_array($statusCode, [
            'pending_internal_approval',
            'pending_public_approval',
        ]);
    }

    /**
     * Core access check - determines if user can access an event at all.
     *
     * Rules:
     * - Entity admin/staff: Can access events in their entity
     * - Organizer admin: Can only access their own organization's events
     */
    private function canAccessEvent(User $user, Event $event): bool
    {
        $userOrgId = $user->organization_id;

        // Entity admin/staff: can access events in their entity
        if ($user->isEntityAdmin() || $user->isEntityStaff()) {
            return $event->entity_id === $userOrgId;
        }

        // Organizer admin: can only access their own organization's events
        if ($user->isOrganizerAdmin()) {
            return $event->organization_id === $userOrgId;
        }

        // Default: deny access
        return false;
    }
}
