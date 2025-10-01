<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ApprovalTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        if (\DB::table('user_roles')->count() === 0) {
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\UserRolesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\EventStatusesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\EventTypesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\OrganizationStatusesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\OrganizationTypesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\OrganizationSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\CategorySeeder']);
        }
    }

    private function authenticateUser(): User
    {
        $user = User::factory()->create();
        $user->organizations()->attach(1);
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    /** @test */
    public function test_can_approve_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => 2 // pending_review
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/approve", [
            'comments' => 'Event approved for publication'
        ]);

        $response->assertStatus(200);

        // Event should be approved (status_id 3)
        $event->refresh();
        $this->assertEquals(3, $event->status_id);
    }

    /** @test */
    public function test_can_reject_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => 2 // pending_review
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/reject", [
            'reason' => 'Event does not meet quality standards'
        ]);

        $response->assertStatus(200);

        // Event should be rejected (status_id 6)
        $event->refresh();
        $this->assertEquals(6, $event->status_id);
    }

    /** @test */
    public function test_can_request_changes_on_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => 2 // pending_review
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-changes", [
            'reason' => 'Please improve the event description and add more details'
        ]);

        $response->assertStatus(200);

        // Event should have changes requested (status_id 7)
        $event->refresh();
        $this->assertEquals(7, $event->status_id);
    }

    /** @test */
    public function test_can_publish_approved_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => 3 // approved_internal
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/publish", [
            'publish_immediately' => true
        ]);

        $response->assertStatus(200);

        // Event should be published (status_id 5)
        $event->refresh();
        $this->assertEquals(5, $event->status_id);
    }

    /** @test */
    public function test_can_request_public_visibility(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => 1 // draft
        ]);

        $response = $this->patchJson("/api/v1/events/{$event->id}/request-public");

        $response->assertStatus(200);

        // Event should be pending public approval (status_id 4)
        $event->refresh();
        $this->assertEquals(4, $event->status_id);
    }

    /** @test */
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
