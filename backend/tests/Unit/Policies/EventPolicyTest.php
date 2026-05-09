<?php

namespace Tests\Unit\Policies;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Database\Seeders\EventLookupSeeder;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypeSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EventPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected Organization $entity;

    protected Organization $otherEntity;

    protected User $entityAdmin;

    protected User $entityStaff;

    protected User $otherEntityAdmin;

    protected User $platformAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(UserRolesSeeder::class);
        $this->seed(EventStatusesSeeder::class);
        $this->seed(EventTypesSeeder::class);
        $this->seed(EventTypeSeeder::class);
        $this->seed(EventLookupSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);

        $this->entity = Organization::factory()->create();
        $this->otherEntity = Organization::factory()->create();

        $this->entityAdmin = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'entity_admin')->first()->id,
        ]);
        $this->entityAdmin->organizations()->attach($this->entity->id);

        $this->entityStaff = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'entity_staff')->first()->id,
        ]);
        $this->entityStaff->organizations()->attach($this->entity->id);

        $this->otherEntityAdmin = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'entity_admin')->first()->id,
        ]);
        $this->otherEntityAdmin->organizations()->attach($this->otherEntity->id);

        $this->platformAdmin = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'platform_admin')->first()->id,
        ]);
    }

    private function getStatusId(string $statusCode): int
    {
        return EventStatus::where('status_code', $statusCode)->first()->id;
    }

    // ===== approve() =====

    #[Test]
    public function entity_admin_can_approve_event_from_same_entity(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $this->assertTrue($this->entityAdmin->can('approve', $event));
    }

    #[Test]
    public function entity_staff_can_approve_event_from_same_entity(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $this->assertTrue($this->entityStaff->can('approve', $event));
    }

    #[Test]
    public function entity_admin_cannot_approve_event_from_different_entity(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->otherEntity->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $this->assertFalse($this->entityAdmin->can('approve', $event));
    }

    #[Test]
    public function approve_requires_pending_approval_status(): void
    {
        // Valid: pending_internal_approval
        $pending = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);
        $this->assertTrue($this->entityAdmin->can('approve', $pending));

        // Valid: pending_public_approval
        $pendingPublic = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('pending_public_approval'),
        ]);
        $this->assertTrue($this->entityAdmin->can('approve', $pendingPublic));

        // Invalid: draft
        $draft = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('draft'),
        ]);
        $this->assertFalse($this->entityAdmin->can('approve', $draft));

        // Invalid: published
        $published = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('published'),
        ]);
        $this->assertFalse($this->entityAdmin->can('approve', $published));
    }

    // ===== reject() =====

    #[Test]
    public function entity_admin_can_reject_event_from_same_entity(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $this->assertTrue($this->entityAdmin->can('reject', $event));
    }

    #[Test]
    public function entity_staff_can_reject_event_from_same_entity(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $this->assertTrue($this->entityStaff->can('reject', $event));
    }

    #[Test]
    public function entity_admin_cannot_reject_event_from_different_entity(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->otherEntity->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $this->assertFalse($this->entityAdmin->can('reject', $event));
    }

    // ===== publish() =====

    #[Test]
    public function entity_admin_can_publish_approved_internal_event(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('approved_internal'),
        ]);

        $this->assertTrue($this->entityAdmin->can('publish', $event));
    }

    #[Test]
    public function entity_staff_can_publish_approved_internal_event(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('approved_internal'),
        ]);

        $this->assertTrue($this->entityStaff->can('publish', $event));
    }

    #[Test]
    public function cannot_publish_draft_event(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('draft'),
        ]);

        $this->assertFalse($this->entityAdmin->can('publish', $event));
    }

    #[Test]
    public function entity_admin_cannot_publish_event_from_different_entity(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->otherEntity->id,
            'status_id' => $this->getStatusId('approved_internal'),
        ]);

        $this->assertFalse($this->entityAdmin->can('publish', $event));
    }

    // ===== requestChanges() =====

    #[Test]
    public function entity_admin_can_request_changes_on_pending_event(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $this->assertTrue($this->entityAdmin->can('requestChanges', $event));
    }

    #[Test]
    public function entity_staff_can_request_changes_on_pending_event(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $this->assertTrue($this->entityStaff->can('requestChanges', $event));
    }

    #[Test]
    public function cannot_request_changes_on_draft_event(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->entity->id,
            'status_id' => $this->getStatusId('draft'),
        ]);

        $this->assertFalse($this->entityAdmin->can('requestChanges', $event));
    }

    #[Test]
    public function entity_admin_cannot_request_changes_on_different_entity_event(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->otherEntity->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $this->assertFalse($this->entityAdmin->can('requestChanges', $event));
    }

    // ===== platform_admin bypass =====

    #[Test]
    public function platform_admin_can_perform_all_approval_actions_on_any_event(): void
    {
        $event = Event::factory()->create([
            'entity_id' => $this->otherEntity->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        $this->assertTrue($this->platformAdmin->can('approve', $event));
        $this->assertTrue($this->platformAdmin->can('reject', $event));
        $this->assertTrue($this->platformAdmin->can('publish', $event));
        $this->assertTrue($this->platformAdmin->can('requestChanges', $event));
    }
}
