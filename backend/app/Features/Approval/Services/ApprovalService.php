<?php

namespace App\Features\Approval\Services;

use App\Features\Shared\Traits\StatusResolvable;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ApprovalService
{
    use StatusResolvable;

    /**
     * Approve event internally.
     */
    public function approveInternal(Event $event, User $approver, ?string $comments = null): void
    {
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
     * Request public approval - SIMPLE.
     */
    public function requestPublicApproval(Event $event, User $requester): void
    {
        $event->update([
            'status_id' => $this->getStatusId('pending_public_approval'),
            'public_approval_requested_at' => now(),
            'public_approval_requested_by' => $requester->id
        ]);

        Log::info('Public approval requested', [
            'event_id' => $event->id,
            'requester_id' => $requester->id
        ]);
    }

    /**
     * Publish event.
     */
    public function publishEvent(Event $event, User $publisher, ?string $scheduledAt = null): void
    {
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
     */
    public function requestChanges(Event $event, string $reason, User $reviewer): void
    {
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
     */
    public function reject(Event $event, string $reason, User $rejector): void
    {
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
     */
    public function getApprovalStatistics(): array
    {
        return [
            'draft' => Event::whereHas('status', fn($q) => $q->where('status_code', 'draft'))->count(),
            'in_review' => Event::whereHas('status', fn($q) => $q->where('status_code', 'pending_internal_approval'))->count(),
            'approved_internal' => Event::whereHas('status', fn($q) => $q->where('status_code', 'approved_internal'))->count(),
            'pending_public_approval' => Event::whereHas('status', fn($q) => $q->where('status_code', 'pending_public_approval'))->count(),
            'published' => Event::whereHas('status', fn($q) => $q->where('status_code', 'published'))->count(),
            'rejected' => Event::whereHas('status', fn($q) => $q->where('status_code', 'rejected'))->count(),
            'requires_changes' => Event::whereHas('status', fn($q) => $q->where('status_code', 'requires_changes'))->count(),
            'cancelled' => Event::whereHas('status', fn($q) => $q->where('status_code', 'cancelled'))->count(),
        ];
    }
}