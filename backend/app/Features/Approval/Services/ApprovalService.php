<?php

namespace App\Features\Approval\Services;

use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ApprovalService
{
    /**
     * Approve event internally - SIMPLE, sin domain events.
     */
    public function approveInternal(Event $event, User $approver, ?string $comments = null): void
    {
        $event->update([
            'status_id' => 3, // approved_internal
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'approval_comments' => $comments
        ]);

        // Log simple, sin eventos de dominio
        Log::info('Event approved internally', [
            'event_id' => $event->id,
            'approver_id' => $approver->id
        ]);

        // Aquí podrías enviar notificación si es necesario
        // Mail::to($event->creator)->send(new EventApprovedMail($event));
    }

    /**
     * Request public approval - SIMPLE.
     */
    public function requestPublicApproval(Event $event, User $requester): void
    {
        $event->update([
            'status_id' => 4, // pending_public_approval
            'public_approval_requested_at' => now(),
            'public_approval_requested_by' => $requester->id
        ]);

        Log::info('Public approval requested', [
            'event_id' => $event->id,
            'requester_id' => $requester->id
        ]);
    }

    /**
     * Publish event - SIMPLE.
     */
    public function publishEvent(Event $event, User $publisher, ?string $scheduledAt = null): void
    {
        $event->update([
            'status_id' => 5, // published
            'published_by' => $publisher->id,
            'published_at' => $scheduledAt ?? now(),
            'scheduled_publish_at' => $scheduledAt
        ]);

        Log::info('Event published', [
            'event_id' => $event->id,
            'publisher_id' => $publisher->id
        ]);
    }

    /**
     * Request changes - SIMPLE.
     */
    public function requestChanges(Event $event, string $reason, User $reviewer): void
    {
        $event->update([
            'status_id' => 7, // requires_changes
            'changes_requested_by' => $reviewer->id,
            'changes_requested_at' => now(),
            'approval_comments' => $reason
        ]);

        Log::info('Changes requested', [
            'event_id' => $event->id,
            'reviewer_id' => $reviewer->id
        ]);
    }

    /**
     * Reject event - SIMPLE.
     */
    public function reject(Event $event, string $reason, User $rejector): void
    {
        $event->update([
            'status_id' => 6, // rejected
            'rejected_by' => $rejector->id,
            'rejected_at' => now(),
            'rejection_reason' => $reason
        ]);

        Log::info('Event rejected', [
            'event_id' => $event->id,
            'rejector_id' => $rejector->id
        ]);
    }

    /**
     * Get approval statistics.
     */
    public function getApprovalStatistics(): array
    {
        return [
            'draft' => Event::where('status_id', 1)->count(),
            'in_review' => Event::where('status_id', 2)->count(),
            'approved_internal' => Event::where('status_id', 3)->count(),
            'pending_public_approval' => Event::where('status_id', 4)->count(),
            'published' => Event::where('status_id', 5)->count(),
            'rejected' => Event::where('status_id', 6)->count(),
            'requires_changes' => Event::where('status_id', 7)->count(),
            'cancelled' => Event::where('status_id', 8)->count(),
        ];
    }
}