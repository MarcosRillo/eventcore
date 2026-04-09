<?php

namespace Tests\Feature\Approval;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests for Approval FormRequest classes:
 * - ApproveEventRequest (authorize: entity_admin, entity_staff, platform_admin; rules: comments nullable max:1000)
 * - ApproveAndPublishEventRequest (authorize: entity_admin, entity_staff; rules: comments nullable max:1000)
 * - PublishEventRequest (authorize: entity_admin, entity_staff, platform_admin; rules: scheduled_at nullable date after:now)
 * - RejectEventRequest (authorize: entity_admin, entity_staff, platform_admin; rules: reason required min:10 max:1000)
 * - RequestChangesRequest (authorize: entity_admin, entity_staff, platform_admin; rules: reason required min:10 max:1000)
 */
class ApprovalRequestValidationTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;
    private User $entityAdmin;
    private User $entityStaff;
    private User $platformAdmin;
    private User $organizerAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);

        $this->organization = Organization::factory()->create();

        $this->entityAdmin = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'entity_admin')->first()->id,
        ]);
        $this->entityAdmin->organizations()->attach($this->organization->id);

        $this->entityStaff = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'entity_staff')->first()->id,
        ]);
        $this->entityStaff->organizations()->attach($this->organization->id);

        $this->platformAdmin = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'platform_admin')->first()->id,
        ]);

        $this->organizerAdmin = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'organizer_admin')->first()->id,
        ]);
        $this->organizerAdmin->organizations()->attach($this->organization->id);
    }

    private function getStatusId(string $statusCode): int
    {
        return EventStatus::where('status_code', $statusCode)->first()->id;
    }

    private function createEvent(string $statusCode): Event
    {
        return Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId($statusCode),
        ]);
    }

    // ===== ApproveEventRequest — authorization =====

    public function test_approve_authorized_for_entity_admin(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => 'All good',
        ]);

        // 200 means request passed authorization and validation
        $response->assertStatus(200);
    }

    public function test_approve_authorized_for_entity_staff(): void
    {
        $this->actingAs($this->entityStaff, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => 'Staff approval',
        ]);

        $response->assertStatus(200);
    }

    public function test_approve_authorized_for_platform_admin(): void
    {
        $this->actingAs($this->platformAdmin, 'sanctum');

        // platform_admin doesn't have org tenant scope, create event without org restriction
        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => 'Platform admin approval',
        ]);

        $response->assertStatus(200);
    }

    public function test_approve_blocked_for_unauthorized_role(): void
    {
        $this->actingAs($this->organizerAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve");

        // Role middleware returns 403
        $response->assertStatus(403);
    }

    public function test_approve_without_authentication_returns_401(): void
    {
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve");

        $response->assertStatus(401);
    }

    // ===== ApproveEventRequest — validation rules =====

    public function test_approve_accepts_null_comments(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", []);

        $response->assertStatus(200);
    }

    public function test_approve_rejects_comments_exceeding_1000_chars(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => str_repeat('a', 1001),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['comments']);
    }

    public function test_approve_accepts_comments_at_max_1000_chars(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => str_repeat('a', 1000),
        ]);

        $response->assertStatus(200);
    }

    // ===== ApproveAndPublishEventRequest — authorization =====

    public function test_approve_and_publish_authorized_for_entity_admin(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve-and-publish", [
            'comments' => 'Approved and published',
        ]);

        $response->assertStatus(200);
    }

    public function test_approve_and_publish_authorized_for_entity_staff(): void
    {
        $this->actingAs($this->entityStaff, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve-and-publish", [
            'comments' => 'Staff approve and publish',
        ]);

        $response->assertStatus(200);
    }

    public function test_approve_and_publish_rejects_comments_exceeding_1000_chars(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve-and-publish", [
            'comments' => str_repeat('b', 1001),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['comments']);
    }

    public function test_approve_and_publish_accepts_no_comments(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve-and-publish", []);

        $response->assertStatus(200);
    }

    // ===== PublishEventRequest — authorization =====

    public function test_publish_authorized_for_entity_admin(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_public_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/publish");

        $response->assertStatus(200);
    }

    public function test_publish_authorized_for_entity_staff(): void
    {
        $this->actingAs($this->entityStaff, 'sanctum');
        $event = $this->createEvent('pending_public_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/publish");

        $response->assertStatus(200);
    }

    public function test_publish_blocked_for_unauthorized_role(): void
    {
        $this->actingAs($this->organizerAdmin, 'sanctum');
        $event = $this->createEvent('pending_public_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/publish");

        $response->assertStatus(403);
    }

    // ===== PublishEventRequest — validation rules =====

    public function test_publish_accepts_no_scheduled_at(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_public_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/publish", []);

        $response->assertStatus(200);
    }

    public function test_publish_accepts_future_scheduled_at(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_public_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/publish", [
            'scheduled_at' => now()->addDay()->toIso8601String(),
        ]);

        $response->assertStatus(200);
    }

    public function test_publish_rejects_past_scheduled_at(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_public_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/publish", [
            'scheduled_at' => now()->subDay()->toIso8601String(),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['scheduled_at']);
    }

    public function test_publish_rejects_invalid_date_format(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_public_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/publish", [
            'scheduled_at' => 'not-a-date',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['scheduled_at']);
    }

    // ===== RejectEventRequest — authorization =====

    public function test_reject_authorized_for_entity_admin(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/reject", [
            'reason' => 'Does not meet the required standards',
        ]);

        $response->assertStatus(200);
    }

    public function test_reject_authorized_for_entity_staff(): void
    {
        $this->actingAs($this->entityStaff, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/reject", [
            'reason' => 'Staff reject with valid reason',
        ]);

        $response->assertStatus(200);
    }

    public function test_reject_blocked_for_unauthorized_role(): void
    {
        $this->actingAs($this->organizerAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/reject", [
            'reason' => 'Should not be allowed',
        ]);

        $response->assertStatus(403);
    }

    // ===== RejectEventRequest — validation rules =====

    public function test_reject_requires_reason(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/reject", []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['reason']);
    }

    public function test_reject_reason_must_be_at_least_10_chars(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/reject", [
            'reason' => 'Short',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['reason']);
    }

    public function test_reject_reason_cannot_exceed_1000_chars(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/reject", [
            'reason' => str_repeat('a', 1001),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['reason']);
    }

    public function test_reject_accepts_reason_at_exactly_10_chars(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/reject", [
            'reason' => '1234567890',
        ]);

        $response->assertStatus(200);
    }

    // ===== RequestChangesRequest — authorization =====

    public function test_request_changes_authorized_for_entity_admin(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => 'Please update the description with more details',
        ]);

        $response->assertStatus(200);
    }

    public function test_request_changes_authorized_for_entity_staff(): void
    {
        $this->actingAs($this->entityStaff, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => 'Staff requesting changes on the event data',
        ]);

        $response->assertStatus(200);
    }

    public function test_request_changes_blocked_for_unauthorized_role(): void
    {
        $this->actingAs($this->organizerAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => 'Should not be allowed',
        ]);

        $response->assertStatus(403);
    }

    // ===== RequestChangesRequest — validation rules =====

    public function test_request_changes_requires_reason(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['reason']);
    }

    public function test_request_changes_reason_must_be_at_least_10_chars(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => 'Too short',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['reason']);
    }

    public function test_request_changes_reason_cannot_exceed_1000_chars(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => str_repeat('r', 1001),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['reason']);
    }

    public function test_request_changes_accepts_reason_at_exactly_10_chars(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');
        $event = $this->createEvent('pending_internal_approval');

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => '1234567890',
        ]);

        $response->assertStatus(200);
    }
}
