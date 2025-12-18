<?php

namespace App\Features\Approval\Services;

use App\Features\Approval\Exceptions\InvalidStateTransitionException;
use App\Features\Shared\Traits\StatusResolvable;
use App\Models\Event;
use App\Models\EventApproval;
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
            // Update event status
            $event->update(['status_id' => $this->getStatusId('approved_internal')]);

            // Record approval in audit table
            EventApproval::create([
                'event_id' => $event->id,
                'performed_by' => $approver->id,
                'action' => EventApproval::ACTION_APPROVE_INTERNAL,
                'comments' => $comments,
                'performed_at' => now(),
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
            // Update event status
            $event->update(['status_id' => $this->getStatusId('pending_public_approval')]);

            // Record approval action in audit table
            EventApproval::create([
                'event_id' => $event->id,
                'performed_by' => $requester->id,
                'action' => EventApproval::ACTION_REQUEST_PUBLIC,
                'performed_at' => now(),
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
            // Update event status
            $event->update(['status_id' => $this->getStatusId('published')]);

            // Record publish action in audit table
            EventApproval::create([
                'event_id' => $event->id,
                'performed_by' => $publisher->id,
                'action' => EventApproval::ACTION_PUBLISH,
                'performed_at' => $scheduledAt ?? now(),
                'scheduled_publish_at' => $scheduledAt,
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
            // Update event status
            $event->update(['status_id' => $this->getStatusId('requires_changes')]);

            // Record request changes action in audit table
            EventApproval::create([
                'event_id' => $event->id,
                'performed_by' => $reviewer->id,
                'action' => EventApproval::ACTION_REQUEST_CHANGES,
                'comments' => $reason,
                'performed_at' => now(),
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
            // Update event status
            $event->update(['status_id' => $this->getStatusId('rejected')]);

            // Record reject action in audit table
            EventApproval::create([
                'event_id' => $event->id,
                'performed_by' => $rejector->id,
                'action' => EventApproval::ACTION_REJECT,
                'comments' => $reason,
                'performed_at' => now(),
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
        $stats = [
            'draft' => $counts['draft'] ?? 0,
            'pending_internal_approval' => $counts['pending_internal_approval'] ?? 0,
            'approved_internal' => $counts['approved_internal'] ?? 0,
            'pending_public_approval' => $counts['pending_public_approval'] ?? 0,
            'published' => $counts['published'] ?? 0,
            'rejected' => $counts['rejected'] ?? 0,
            'requires_changes' => $counts['requires_changes'] ?? 0,
            'cancelled' => $counts['cancelled'] ?? 0,
        ];

        // Add total count
        $stats['total'] = array_sum($stats);

        return $stats;
    }
}