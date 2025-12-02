<?php

namespace App\Features\Approval\Services;

use App\Models\Event;
use App\Features\Approval\Exceptions\InvalidStateTransitionException;

/**
 * State Machine for Event Approval Workflow
 *
 * Validates status transitions to prevent invalid workflow states.
 * Implements a strict state machine pattern.
 */
class ApprovalStateMachine
{
    /**
     * Valid state transitions map.
     * Key: current state, Value: array of valid target states
     *
     * @var array<string, array<string>>
     */
    private const TRANSITIONS = [
        'draft' => [
            'pending_internal_approval',
            'cancelled',
        ],
        'pending_internal_approval' => [
            'approved_internal',
            'requires_changes',
            'rejected',
            'cancelled',
        ],
        'approved_internal' => [
            'pending_public_approval',
            'requires_changes',
            'cancelled',
        ],
        'pending_public_approval' => [
            'published',
            'requires_changes',
            'rejected',
            'cancelled',
        ],
        'published' => [
            'cancelled',
        ],
        'requires_changes' => [
            'pending_internal_approval',
            'cancelled',
        ],
        'rejected' => [
            'draft', // Allow resubmission as new draft
            'cancelled',
        ],
        'cancelled' => [
            // Terminal state - no transitions allowed
        ],
    ];

    /**
     * Check if a transition is valid.
     *
     * @param string $currentStatus Current status code
     * @param string $targetStatus Target status code
     * @return bool
     */
    public function canTransition(string $currentStatus, string $targetStatus): bool
    {
        // Same state is always valid (no-op)
        if ($currentStatus === $targetStatus) {
            return true;
        }

        $allowedTransitions = self::TRANSITIONS[$currentStatus] ?? [];

        return in_array($targetStatus, $allowedTransitions, true);
    }

    /**
     * Validate a transition and throw exception if invalid.
     *
     * @param Event $event
     * @param string $targetStatus
     * @throws InvalidStateTransitionException
     */
    public function validateTransition(Event $event, string $targetStatus): void
    {
        $currentStatus = $event->status?->status_code ?? 'draft';

        if (!$this->canTransition($currentStatus, $targetStatus)) {
            throw new InvalidStateTransitionException(
                $currentStatus,
                $targetStatus,
                $this->getAllowedTransitions($currentStatus)
            );
        }
    }

    /**
     * Get all allowed transitions from a given state.
     *
     * @param string $currentStatus
     * @return array<string>
     */
    public function getAllowedTransitions(string $currentStatus): array
    {
        return self::TRANSITIONS[$currentStatus] ?? [];
    }

    /**
     * Get all valid status codes.
     *
     * @return array<string>
     */
    public function getAllStatuses(): array
    {
        return array_keys(self::TRANSITIONS);
    }

    /**
     * Check if a status is a terminal state (no outgoing transitions).
     *
     * @param string $status
     * @return bool
     */
    public function isTerminalState(string $status): bool
    {
        return empty(self::TRANSITIONS[$status] ?? []);
    }
}
