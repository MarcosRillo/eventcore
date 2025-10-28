<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ApprovalTest extends TestCase
{
    use DatabaseTransactions;

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

    private function authenticateUser(): User
    {
        $user = User::factory()->create();
        $organization = \App\Models\Organization::factory()->create();
        $user->organizations()->attach($organization->id);
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    /**
     * Get event status ID by status code
     */
    private function getStatusId(string $statusCode): int
    {
        return \DB::table('event_statuses')
            ->where('status_code', $statusCode)
            ->value('id') ?? 1;
    }

    #[Test]
    public function test_can_approve_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => $this->getStatusId('pending_internal_approval')
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => 'Event approved for publication'
        ]);

        $response->assertStatus(200);

        // Event should be approved
        $event->refresh();
        $this->assertEquals($this->getStatusId('approved_internal'), $event->status_id);
    }

    #[Test]
    public function test_can_reject_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => $this->getStatusId('pending_internal_approval')
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/reject", [
            'reason' => 'Event does not meet quality standards'
        ]);

        $response->assertStatus(200);

        // Event should be rejected
        $event->refresh();
        $this->assertEquals($this->getStatusId('rejected'), $event->status_id);
    }

    #[Test]
    public function test_can_request_changes_on_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => $this->getStatusId('pending_internal_approval')
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => 'Please improve the event description and add more details'
        ]);

        $response->assertStatus(200);

        // Event should have changes requested
        $event->refresh();
        $this->assertEquals($this->getStatusId('requires_changes'), $event->status_id);
    }

    #[Test]
    public function test_can_publish_approved_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => $this->getStatusId('approved_internal')
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/publish", [
            'publish_immediately' => true
        ]);

        $response->assertStatus(200);

        // Event should be published
        $event->refresh();
        $this->assertEquals($this->getStatusId('published'), $event->status_id);
    }

    #[Test]
    public function test_can_request_public_visibility(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => $this->getStatusId('draft')
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-public");

        $response->assertStatus(200);

        // Event should be pending public approval
        $event->refresh();
        $this->assertEquals($this->getStatusId('pending_public_approval'), $event->status_id);
    }

    #[Test]
    public function test_can_get_approval_statistics(): void
    {
        $this->authenticateUser();

        $response = $this->getJson('/api/v1/events/approval/statistics');

        $response->assertStatus(200);

        // Verify statistics data structure
        $data = $response->json();
        $this->assertIsArray($data);
        $this->assertArrayHasKey('draft', $data);
        $this->assertArrayHasKey('published', $data);
        $this->assertArrayHasKey('rejected', $data);
    }
}
