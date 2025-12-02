<?php

namespace App\Features\Approval\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

/**
 * Exception thrown when an invalid state transition is attempted.
 */
class InvalidStateTransitionException extends Exception
{
    /**
     * @param string $currentStatus
     * @param string $targetStatus
     * @param array<string> $allowedTransitions
     */
    public function __construct(
        public readonly string $currentStatus,
        public readonly string $targetStatus,
        public readonly array $allowedTransitions
    ) {
        $allowed = empty($allowedTransitions)
            ? 'none (terminal state)'
            : implode(', ', $allowedTransitions);

        parent::__construct(
            "Invalid state transition from '{$currentStatus}' to '{$targetStatus}'. " .
            "Allowed transitions: {$allowed}"
        );
    }

    /**
     * Render the exception as an HTTP response.
     */
    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => 'invalid_state_transition',
            'message' => $this->getMessage(),
            'details' => [
                'current_status' => $this->currentStatus,
                'target_status' => $this->targetStatus,
                'allowed_transitions' => $this->allowedTransitions,
            ],
        ], 409);
    }
}
