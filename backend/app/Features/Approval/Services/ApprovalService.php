<?php

namespace App\Features\Approval\Services;

use App\Features\Approval\Exceptions\InvalidStateTransitionException;
use App\Features\Shared\Traits\StatusResolvable;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ApprovalService
{
    use StatusResolvable;

    public function __construct(
        private ApprovalStateMachine $stateMachine
    ) {}

    /**
     * Approve event internally.
     *
     * @throws InvalidStateTransitionException
     */
    public function approveInternal(Event $event, User $approver, ?string $comments = null): void
    {
        $this->stateMachine->validateTransition($event, 'approved_internal');

        DB::transaction(function () use ($event, $approver, $comments) {
            $event->update([
                'status_id' => $this->getStatusId('approved_internal'),
                'approved_by' => $approver->id,
                'approved_at' => now(),
                'approval_comments' => $comments
            ]);

            Log::info('Event approved internally', [
                'event_id' => $event->id,
                'approver_id' => $approver->id
            ]);
        });
    }

    /**
     * Request public approval.
     *
     * @throws InvalidStateTransitionException
     */
    public function requestPublicApproval(Event $event, User $requester): void
    {
        $this->stateMachine->validateTransition($event, 'pending_public_approval');

        DB::transaction(function () use ($event, $requester) {
            $event->update([
                'status_id' => $this->getStatusId('pending_public_approval'),
                'public_approval_requested_at' => now(),
                'public_approval_requested_by' => $requester->id
            ]);

            Log::info('Public approval requested', [
                'event_id' => $event->id,
                'requester_id' => $requester->id
            ]);
        });
    }

    /**
     * Publish event.
     *
     * @throws InvalidStateTransitionException
     */
    public function publishEvent(Event $event, User $publisher, ?string $scheduledAt = null): void
    {
        $this->stateMachine->validateTransition($event, 'published');

        DB::transaction(function () use ($event, $publisher, $scheduledAt) {
            $event->update([
                'status_id' => $this->getStatusId('published'),
                'published_by' => $publisher->id,
                'published_at' => $scheduledAt ?? now(),
                'scheduled_publish_at' => $scheduledAt
            ]);

            Log::info('Event published', [
                'event_id' => $event->id,
                'publisher_id' => $publisher->id
            ]);
        });
    }

    /**
     * Request changes on an event.
     *
     * @throws InvalidStateTransitionException
     */
    public function requestChanges(Event $event, string $reason, User $reviewer): void
    {
        $this->stateMachine->validateTransition($event, 'requires_changes');

        DB::transaction(function () use ($event, $reason, $reviewer) {
            $event->update([
                'status_id' => $this->getStatusId('requires_changes'),
                'changes_requested_by' => $reviewer->id,
                'changes_requested_at' => now(),
                'approval_comments' => $reason
            ]);

            Log::info('Changes requested', [
                'event_id' => $event->id,
                'reviewer_id' => $reviewer->id
            ]);
        });
    }

    /**
     * Reject an event.
     *
     * @throws InvalidStateTransitionException
     */
    public function reject(Event $event, string $reason, User $rejector): void
    {
        $this->stateMachine->validateTransition($event, 'rejected');

        DB::transaction(function () use ($event, $reason, $rejector) {
            $event->update([
                'status_id' => $this->getStatusId('rejected'),
                'rejected_by' => $rejector->id,
                'rejected_at' => now(),
                'rejection_reason' => $reason
            ]);

            Log::info('Event rejected', [
                'event_id' => $event->id,
                'rejector_id' => $rejector->id
            ]);
        });
    }

    /**
     * Get approval statistics.
     * Uses single query with JOIN and groupBy for O(1) performance.
     */
    public function getApprovalStatistics(): array
    {
        // Single query with JOIN instead of 8 separate whereHas queries
        $counts = Event::query()
            ->join('event_statuses', 'events.status_id', '=', 'event_statuses.id')
            ->selectRaw('event_statuses.status_code, count(*) as count')
            ->groupBy('event_statuses.status_code')
            ->pluck('count', 'status_code')
            ->toArray();

        // Map status codes to expected keys with defaults
        return [
            'draft' => $counts['draft'] ?? 0,
            'in_review' => $counts['pending_internal_approval'] ?? 0,
            'approved_internal' => $counts['approved_internal'] ?? 0,
            'pending_public_approval' => $counts['pending_public_approval'] ?? 0,
            'published' => $counts['published'] ?? 0,
            'rejected' => $counts['rejected'] ?? 0,
            'requires_changes' => $counts['requires_changes'] ?? 0,
            'cancelled' => $counts['cancelled'] ?? 0,
        ];
    }
}