<?php

namespace Tests\Feature\Approval;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ApprovalControllerTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;
    private Organization $otherOrganization;
    private User $entityAdmin;
    private User $entityStaff;
    private User $otherEntityAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);

        $this->organization = Organization::factory()->create();
        $this->otherOrganization = Organization::factory()->create();

        $entityAdminRole = UserRole::where('role_code', 'entity_admin')->first();
        $entityStaffRole = UserRole::where('role_code', 'entity_staff')->first();

        $this->entityAdmin = User::factory()->create(['role_id' => $entityAdminRole->id]);
        $this->entityAdmin->organizations()->attach($this->organization->id);

        $this->entityStaff = User::factory()->create(['role_id' => $entityStaffRole->id]);
        $this->entityStaff->organizations()->attach($this->organization->id);

        $this->otherEntityAdmin = User::factory()->create(['role_id' => $entityAdminRole->id]);
        $this->otherEntityAdmin->organizations()->attach($this->otherOrganization->id);
    }

    private function getStatusId(string $statusCode): int
    {
        return EventStatus::where('status_code', $statusCode)->first()->id;
    }

    // ===== approve endpoint =====

    #[Test]
    public function entity_admin_can_approve_event(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => 'Looks good',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.status.status_code', 'approved_internal');
    }

    #[Test]
    public function entity_staff_can_approve_event(): void
    {
        $this->actingAs($this->entityStaff, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => 'Staff approved',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.status.status_code', 'approved_internal');
    }

    #[Test]
    public function cross_entity_approve_blocked_by_tenant_scope(): void
    {
        $this->actingAs($this->otherEntityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => 'Cross-entity attempt',
        ]);

        // TenantScope filters out the event → 404
        $response->assertStatus(404);
    }

    #[Test]
    public function approve_denied_for_wrong_status(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('draft'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => 'Trying to approve draft',
        ]);

        $response->assertStatus(403);
    }

    // ===== approveAndPublish endpoint =====

    #[Test]
    public function approve_and_publish_uses_approve_policy(): void
    {
        $this->actingAs($this->otherEntityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve-and-publish", [
            'comments' => 'Cross-entity attempt',
        ]);

        $response->assertStatus(404);
    }

    // ===== requestPublicApproval endpoint =====

    #[Test]
    public function entity_admin_can_request_public_approval(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('approved_internal'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-public");

        $response->assertStatus(200);
    }

    #[Test]
    public function request_public_approval_blocked_cross_entity(): void
    {
        $this->actingAs($this->otherEntityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-public");

        $response->assertStatus(404);
    }

    // ===== publish endpoint =====

    #[Test]
    public function entity_admin_can_publish_approved_event(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_public_approval'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/publish");

        $response->assertStatus(200);
        $response->assertJsonPath('data.status.status_code', 'published');
    }

    #[Test]
    public function cross_entity_publish_blocked(): void
    {
        $this->actingAs($this->otherEntityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('approved_internal'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/publish");

        $response->assertStatus(404);
    }

    // ===== requestChanges endpoint =====

    #[Test]
    public function entity_admin_can_request_changes(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => 'Please update the description with more details',
        ]);

        $response->assertStatus(200);
    }

    #[Test]
    public function entity_staff_can_request_changes(): void
    {
        $this->actingAs($this->entityStaff, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => 'Staff requesting changes on the event',
        ]);

        $response->assertStatus(200);
    }

    #[Test]
    public function request_changes_blocked_cross_entity(): void
    {
        $this->actingAs($this->otherEntityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => 'Cross-entity request changes attempt',
        ]);

        $response->assertStatus(404);
    }

    #[Test]
    public function request_changes_denied_for_wrong_status(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('draft'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => 'Trying to request changes on draft',
        ]);

        $response->assertStatus(403);
    }

    // ===== reject endpoint =====

    #[Test]
    public function entity_admin_can_reject_event(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/reject", [
            'reason' => 'Does not meet requirements',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.status.status_code', 'rejected');
    }

    #[Test]
    public function cross_entity_reject_blocked(): void
    {
        $this->actingAs($this->otherEntityAdmin, 'sanctum');

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/reject", [
            'reason' => 'Cross-entity rejection attempt',
        ]);

        $response->assertStatus(404);
    }

    // ===== Status unchanged on denial =====

    #[Test]
    public function event_status_unchanged_when_approval_denied(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $draftStatusId = $this->getStatusId('draft');
        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $draftStatusId,
        ]);

        $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => 'Trying to approve draft',
        ]);

        $event->refresh();
        $this->assertEquals($draftStatusId, $event->status_id);
    }
}
