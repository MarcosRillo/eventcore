<?php

namespace Tests\Feature\Approval;

use App\Models\Event;
use App\Models\EventApproval;
use App\Models\EventStatus;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ApprovalAuditTest extends TestCase
{
    use RefreshDatabase;

    private User $entityAdmin;

    private User $entityStaff;

    private User $organizer;

    private Organization $organization;

    private EventStatus $draftStatus;

    private EventStatus $pendingInternalStatus;

    private EventStatus $approvedInternalStatus;

    private EventStatus $pendingPublicStatus;

    private EventStatus $publishedStatus;

    private EventStatus $rejectedStatus;

    private EventStatus $requiresChangesStatus;

    private Event $event;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed lookup tables
        $this->seed(UserRolesSeeder::class);
        $this->seed(EventStatusesSeeder::class);
        $this->seed(EventTypesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);

        // Create organization for multi-tenant context
        $this->organization = Organization::factory()->create();

        // Get role IDs from database (seeded)
        $entityAdminRole = UserRole::where('role_code', 'entity_admin')->first();
        $entityStaffRole = UserRole::where('role_code', 'entity_staff')->first();
        $organizerRole = UserRole::where('role_code', 'organizer_admin')->first();

        // Create users with different roles
        $this->entityAdmin = User::factory()->create([
            'role_id' => $entityAdminRole->id,
        ]);
        $this->entityAdmin->organizations()->attach($this->organization->id);

        $this->entityStaff = User::factory()->create([
            'role_id' => $entityStaffRole->id,
        ]);
        $this->entityStaff->organizations()->attach($this->organization->id);

        $this->organizer = User::factory()->create([
            'role_id' => $organizerRole->id,
        ]);
        $this->organizer->organizations()->attach($this->organization->id);

        // Get event statuses from database (seeded)
        $this->draftStatus = EventStatus::where('status_code', 'draft')->first();
        $this->pendingInternalStatus = EventStatus::where('status_code', 'pending_internal_approval')->first();
        $this->approvedInternalStatus = EventStatus::where('status_code', 'approved_internal')->first();
        $this->pendingPublicStatus = EventStatus::where('status_code', 'pending_public_approval')->first();
        $this->publishedStatus = EventStatus::where('status_code', 'published')->first();
        $this->rejectedStatus = EventStatus::where('status_code', 'rejected')->first();
        $this->requiresChangesStatus = EventStatus::where('status_code', 'requires_changes')->first();

        // Create a base event in pending_internal_approval state
        $this->event = Event::factory()->create([
            'entity_id' => $this->organization->id, // Entity that owns this event (for entity_admin/staff scope)
            'organization_id' => $this->organization->id, // Organization that created this event
            'status_id' => $this->pendingInternalStatus->id,
            'created_by' => $this->organizer->id,
        ]);
    }

    // ===== Casos Principales (Happy Path) - 6 tests =====

    #[Test]
    public function approve_internal_creates_approval_record_with_approver(): void
    {
        $response = $this->actingAs($this->entityAdmin, 'sanctum')
            ->patchJson("/api/v1/events/{$this->event->id}/approve", [
                'comments' => 'Evento aprobado internamente.',
            ]);

        $response->assertStatus(200);

        // Verify approval record was created
        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_APPROVE_INTERNAL)
            ->first();

        $this->assertNotNull($approval);
        $this->assertEquals($this->entityAdmin->id, $approval->performed_by);
        $this->assertEquals('Evento aprobado internamente.', $approval->comments);
        $this->assertNotNull($approval->performed_at);

        // Verify event status updated
        $this->event->refresh();
        $this->assertEquals($this->approvedInternalStatus->id, $this->event->status_id);
    }

    #[Test]
    public function request_public_approval_creates_approval_record(): void
    {
        // First approve internal
        $this->event->update(['status_id' => $this->approvedInternalStatus->id]);

        $response = $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/request-public");

        $response->assertStatus(200);

        // Verify approval record was created
        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_REQUEST_PUBLIC)
            ->first();

        $this->assertNotNull($approval);
        $this->assertEquals($this->entityAdmin->id, $approval->performed_by);
        $this->assertNotNull($approval->performed_at);

        // Verify event status updated
        $this->event->refresh();
        $this->assertEquals($this->pendingPublicStatus->id, $this->event->status_id);
    }

    #[Test]
    public function publish_event_creates_approval_record_with_publisher(): void
    {
        // Set event to pending_public_approval state
        $this->event->update(['status_id' => $this->pendingPublicStatus->id]);

        $response = $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/publish");

        $response->assertStatus(200);

        // Verify approval record was created
        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_PUBLISH)
            ->first();

        $this->assertNotNull($approval);
        $this->assertEquals($this->entityAdmin->id, $approval->performed_by);
        $this->assertNotNull($approval->performed_at);
        $this->assertNull($approval->scheduled_publish_at); // no scheduled date

        // Verify event status updated
        $this->event->refresh();
        $this->assertEquals($this->publishedStatus->id, $this->event->status_id);
    }

    #[Test]
    public function publish_event_with_scheduled_date_saves_scheduled_publish_at(): void
    {
        // Set event to pending_public_approval state
        $this->event->update(['status_id' => $this->pendingPublicStatus->id]);

        $scheduledDate = now()->addDays(7)->toISOString();

        $response = $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/publish", [
                'scheduled_at' => $scheduledDate,
            ]);

        $response->assertStatus(200);

        // Verify approval record has scheduled_publish_at
        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_PUBLISH)
            ->first();

        $this->assertNotNull($approval);
        $this->assertNotNull($approval->scheduled_publish_at);
        // Compare dates without microseconds (Carbon stores with microseconds)
        $this->assertEquals(
            date('Y-m-d H:i:s', strtotime($scheduledDate)),
            $approval->scheduled_publish_at->format('Y-m-d H:i:s'),
        );
    }

    #[Test]
    public function request_changes_creates_approval_record_with_reason(): void
    {
        $reason = 'Falta información sobre el lugar del evento.';

        $response = $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/request-changes", [
                'reason' => $reason,
            ]);

        $response->assertStatus(200);

        // Verify approval record was created
        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_REQUEST_CHANGES)
            ->first();

        $this->assertNotNull($approval);
        $this->assertEquals($this->entityAdmin->id, $approval->performed_by);
        $this->assertEquals($reason, $approval->comments);
        $this->assertNotNull($approval->performed_at);

        // Verify event status updated
        $this->event->refresh();
        $this->assertEquals($this->requiresChangesStatus->id, $this->event->status_id);
    }

    #[Test]
    public function reject_event_creates_approval_record_with_reason(): void
    {
        $reason = 'El evento no cumple con los criterios de publicación.';

        $response = $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/reject", [
                'reason' => $reason,
            ]);

        $response->assertStatus(200);

        // Verify approval record was created
        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_REJECT)
            ->first();

        $this->assertNotNull($approval);
        $this->assertEquals($this->entityAdmin->id, $approval->performed_by);
        $this->assertEquals($reason, $approval->comments);
        $this->assertNotNull($approval->performed_at);

        // Verify event status updated
        $this->event->refresh();
        $this->assertEquals($this->rejectedStatus->id, $this->event->status_id);
    }

    // ===== Validaciones - 4 tests =====

    #[Test]
    public function reject_with_short_reason_fails_validation(): void
    {
        $shortReason = 'Corto'; // < 10 characters

        $response = $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/reject", [
                'reason' => $shortReason,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['reason']);

        // Verify no approval record was created
        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_REJECT)
            ->first();

        $this->assertNull($approval);
    }

    #[Test]
    public function request_changes_with_short_reason_fails_validation(): void
    {
        $shortReason = 'Mal'; // < 10 characters

        $response = $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/request-changes", [
                'reason' => $shortReason,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['reason']);

        // Verify no approval record was created
        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_REQUEST_CHANGES)
            ->first();

        $this->assertNull($approval);
    }

    #[Test]
    public function approve_internal_with_comment_saves_comments(): void
    {
        $comment = 'Aprobado con observación sobre la fecha.';

        $response = $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/approve", [
                'comments' => $comment,
            ]);

        $response->assertStatus(200);

        // Verify comments were saved
        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_APPROVE_INTERNAL)
            ->first();

        $this->assertEquals($comment, $approval->comments);
    }

    #[Test]
    public function approve_internal_without_comment_works(): void
    {
        $response = $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/approve");

        $response->assertStatus(200);

        // Verify approval record created without comments
        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_APPROVE_INTERNAL)
            ->first();

        $this->assertNotNull($approval);
        $this->assertNull($approval->comments);
    }

    // ===== Edge Cases - 5 tests =====

    #[Test]
    public function multiple_approvals_on_same_event_creates_multiple_records(): void
    {
        // Approve internal
        $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/approve");

        // Request public approval
        $this->event->refresh();
        $this->event->update(['status_id' => $this->approvedInternalStatus->id]);

        $this->actingAs($this->entityStaff)
            ->patchJson("/api/v1/events/{$this->event->id}/request-public");

        // Publish event
        $this->event->refresh();
        $this->event->update(['status_id' => $this->pendingPublicStatus->id]);

        $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/publish");

        // Verify 3 approval records exist
        $approvals = EventApproval::where('event_id', $this->event->id)->get();

        $this->assertCount(3, $approvals);

        $actions = $approvals->pluck('action')->toArray();
        $this->assertContains(EventApproval::ACTION_APPROVE_INTERNAL, $actions);
        $this->assertContains(EventApproval::ACTION_REQUEST_PUBLIC, $actions);
        $this->assertContains(EventApproval::ACTION_PUBLISH, $actions);
    }

    #[Test]
    public function approval_record_has_correct_timestamp(): void
    {
        $beforeRequest = now();

        $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/approve");

        $afterRequest = now();

        $approval = EventApproval::where('event_id', $this->event->id)->first();

        $this->assertGreaterThanOrEqual($beforeRequest->timestamp, $approval->performed_at->timestamp);
        $this->assertLessThanOrEqual($afterRequest->timestamp, $approval->performed_at->timestamp);
    }

    #[Test]
    public function approval_belongs_to_event_and_user(): void
    {
        $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/approve");

        $approval = EventApproval::where('event_id', $this->event->id)->first();

        // Test relationships
        $this->assertNotNull($approval->event);
        $this->assertEquals($this->event->id, $approval->event->id);

        $this->assertNotNull($approval->performedBy);
        $this->assertEquals($this->entityAdmin->id, $approval->performedBy->id);
    }

    #[Test]
    public function approval_action_constant_matches_database_value(): void
    {
        $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/approve");

        $approval = EventApproval::where('event_id', $this->event->id)->first();

        // Verify constant value matches database
        $this->assertEquals(EventApproval::ACTION_APPROVE_INTERNAL, $approval->action);
        $this->assertEquals('approve_internal', $approval->action);
    }

    #[Test]
    public function event_approvals_ordered_by_performed_at_desc(): void
    {
        // Create multiple approvals with delays
        $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/approve");

        sleep(1);

        $this->event->refresh();
        $this->event->update(['status_id' => $this->approvedInternalStatus->id]);

        $this->actingAs($this->entityStaff)
            ->patchJson("/api/v1/events/{$this->event->id}/request-public");

        // Retrieve approvals using Event relationship
        $approvals = $this->event->approvals;

        // Verify ordered by performed_at desc (most recent first)
        $this->assertEquals(EventApproval::ACTION_REQUEST_PUBLIC, $approvals->first()->action);
        $this->assertEquals(EventApproval::ACTION_APPROVE_INTERNAL, $approvals->last()->action);
    }

    // ===== Errores y Permisos - 5 tests =====

    #[Test]
    public function approve_internal_from_invalid_state_fails(): void
    {
        // Try to approve from published state (invalid transition)
        $this->event->update(['status_id' => $this->publishedStatus->id]);

        $response = $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/approve");

        // 403 Forbidden — policy rejects approval on non-pending events
        $response->assertStatus(403);

        // Verify no approval record was created
        $approval = EventApproval::where('event_id', $this->event->id)->first();
        $this->assertNull($approval);
    }

    #[Test]
    public function publish_without_internal_approval_fails(): void
    {
        // Try to publish from pending_internal_approval state
        $response = $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/publish");

        // 403 Forbidden — policy rejects publish on non-approved events
        $response->assertStatus(403);

        // Verify no approval record was created
        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_PUBLISH)
            ->first();

        $this->assertNull($approval);
    }

    #[Test]
    public function non_admin_cannot_approve_event(): void
    {
        $response = $this->actingAs($this->organizer)
            ->patchJson("/api/v1/events/{$this->event->id}/approve");

        $response->assertStatus(403);

        // Verify no approval record was created
        $approval = EventApproval::where('event_id', $this->event->id)->first();
        $this->assertNull($approval);
    }

    #[Test]
    public function approve_internal_updates_event_status_correctly(): void
    {
        $this->assertEquals($this->pendingInternalStatus->id, $this->event->status_id);

        $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/approve");

        $this->event->refresh();

        $this->assertEquals($this->approvedInternalStatus->id, $this->event->status_id);
        $this->assertEquals('approved_internal', $this->event->status->status_code);
    }

    #[Test]
    public function event_can_retrieve_last_approval_by_action(): void
    {
        // Create multiple approvals
        $this->actingAs($this->entityAdmin)
            ->patchJson("/api/v1/events/{$this->event->id}/approve", [
                'comments' => 'First approval',
            ]);

        $this->event->refresh();
        $this->event->update(['status_id' => $this->pendingInternalStatus->id]);

        sleep(1);

        $this->actingAs($this->entityStaff)
            ->patchJson("/api/v1/events/{$this->event->id}/approve", [
                'comments' => 'Second approval',
            ]);

        $this->event->refresh();

        // Use Event helper method
        $lastApproval = $this->event->getLastApproval(EventApproval::ACTION_APPROVE_INTERNAL);

        $this->assertNotNull($lastApproval);
        $this->assertEquals('Second approval', $lastApproval->comments);
        $this->assertEquals($this->entityStaff->id, $lastApproval->performed_by);
    }
}
