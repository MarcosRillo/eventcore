<?php

namespace Tests\Feature\Approval;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\Feature\Events\EventTestCase;

class ApprovalTest extends EventTestCase
{
    use RefreshDatabase;

    protected $organization;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed only lookup tables
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
    }

    /**
     * Override to add organization attachment for approval tests
     */
    protected function authenticateUser(string $role = 'entity_admin'): User
    {
        $user = parent::authenticateUser($role);
        $this->organization = \App\Models\Organization::factory()->create();
        $user->organizations()->attach($this->organization->id);
        return $user;
    }

    #[Test]
    public function test_can_approve_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval')
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => 'Event approved for publication'
        ]);

        // Assert response (4 assertions)
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'status' => ['id', 'status_code', 'status_name', 'description']
            ]
        ]);
        $response->assertJsonPath('data.status.status_code', 'approved_internal');
        $this->assertNotNull($response->json('data'));

        // Assert database state (3+ assertions)
        $event->refresh();
        $this->assertEquals($this->getStatusId('approved_internal'), $event->status_id);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'status_id' => $this->getStatusId('approved_internal')
        ]);
        $this->assertNotNull($event->updated_at);
    }

    #[Test]
    public function test_can_reject_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval')
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/reject", [
            'reason' => 'Event does not meet quality standards'
        ]);

        // Assert response (4 assertions)
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'status' => ['id', 'status_code', 'status_name', 'description']
            ]
        ]);
        $response->assertJsonPath('data.status.status_code', 'rejected');
        $this->assertNotNull($response->json('data'));

        // Assert database state (3+ assertions)
        $event->refresh();
        $this->assertEquals($this->getStatusId('rejected'), $event->status_id);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'status_id' => $this->getStatusId('rejected')
        ]);
        $this->assertNotNull($event->updated_at);
    }

    #[Test]
    public function test_can_request_changes_on_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_internal_approval')
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => 'Please improve the event description and add more details'
        ]);

        // Assert response (4 assertions)
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'status' => ['id', 'status_code', 'status_name', 'description']
            ]
        ]);
        $response->assertJsonPath('data.status.status_code', 'requires_changes');
        $this->assertNotNull($response->json('data'));

        // Assert database state (3+ assertions)
        $event->refresh();
        $this->assertEquals($this->getStatusId('requires_changes'), $event->status_id);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'status_id' => $this->getStatusId('requires_changes')
        ]);
        $this->assertNotNull($event->updated_at);
    }

    #[Test]
    public function test_can_publish_event_pending_public_approval(): void
    {
        $this->authenticateUser();

        // Must start from pending_public_approval state (valid transition to published)
        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('pending_public_approval')
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/publish", [
            'publish_immediately' => true
        ]);

        // Assert response (4 assertions)
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'status' => ['id', 'status_code', 'status_name', 'description']
            ]
        ]);
        $response->assertJsonPath('data.status.status_code', 'published');
        $this->assertNotNull($response->json('data'));

        // Assert database state (3+ assertions)
        $event->refresh();
        $this->assertEquals($this->getStatusId('published'), $event->status_id);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'status_id' => $this->getStatusId('published')
        ]);
        $this->assertNotNull($event->updated_at);
    }

    #[Test]
    public function test_can_request_public_visibility(): void
    {
        $this->authenticateUser();

        // Must start from approved_internal state (valid transition path)
        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->getStatusId('approved_internal')
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-public");

        // Assert response (4 assertions)
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'status' => ['id', 'status_code', 'status_name', 'description']
            ]
        ]);
        $response->assertJsonPath('data.status.status_code', 'pending_public_approval');
        $this->assertNotNull($response->json('data'));

        // Assert database state (3+ assertions)
        $event->refresh();
        $this->assertEquals($this->getStatusId('pending_public_approval'), $event->status_id);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'status_id' => $this->getStatusId('pending_public_approval')
        ]);
        $this->assertNotNull($event->updated_at);
    }

    #[Test]
    public function test_can_get_approval_statistics(): void
    {
        $this->authenticateUser();

        $response = $this->getJson('/api/v1/events/approval/statistics');

        $response->assertStatus(200);

        // Verify statistics data structure (wrapped in data key)
        $json = $response->json();
        $this->assertArrayHasKey('data', $json);

        $data = $json['data'];
        $this->assertIsArray($data);
        $this->assertArrayHasKey('draft', $data);
        $this->assertArrayHasKey('pending_internal_approval', $data);
        $this->assertArrayHasKey('published', $data);
        $this->assertArrayHasKey('rejected', $data);
        $this->assertArrayHasKey('total', $data);
    }
}
