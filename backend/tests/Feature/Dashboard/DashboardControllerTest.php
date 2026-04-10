<?php

namespace Tests\Feature\Dashboard;

use App\Features\Dashboard\Services\DashboardService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\Feature\Events\EventTestCase;

/**
 * Tests for DashboardController
 *
 * Tests authorization and functionality of dashboard endpoints.
 */
class DashboardControllerTest extends EventTestCase
{
    use RefreshDatabase;

    protected $organization;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
    }

    protected function authenticateUser(string $role = 'entity_admin'): User
    {
        $user = parent::authenticateUser($role);
        $this->organization = \App\Models\Organization::factory()->create();
        $user->organizations()->attach($this->organization->id);

        return $user;
    }

    #[Test]
    public function test_entity_admin_can_access_events_summary(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events/summary');

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data',
            'message',
        ]);
    }

    #[Test]
    public function test_entity_staff_can_access_events_summary(): void
    {
        $this->authenticateUser('entity_staff');

        $response = $this->getJson('/api/v1/dashboard/events/summary');

        $response->assertOk();
    }

    #[Test]
    public function test_platform_admin_cannot_access_dashboard(): void
    {
        $this->authenticateUser('platform_admin');

        $response = $this->getJson('/api/v1/dashboard/events/summary');

        $response->assertForbidden();
    }

    #[Test]
    public function test_organizer_admin_cannot_access_dashboard(): void
    {
        $this->authenticateUser('organizer_admin');

        $response = $this->getJson('/api/v1/dashboard/events/summary');

        $response->assertForbidden();
    }

    #[Test]
    public function test_unauthenticated_user_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/v1/dashboard/events/summary');

        $response->assertUnauthorized();
    }

    #[Test]
    public function test_entity_admin_can_access_events_list(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events');

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data',
            'pagination',
            'message',
        ]);
    }

    #[Test]
    public function test_events_list_validates_tab_parameter(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events?tab=invalid');

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['tab']);
    }

    #[Test]
    public function test_events_list_accepts_valid_tabs(): void
    {
        $this->authenticateUser('entity_admin');

        $validTabs = ['requires-action', 'pending', 'approved', 'rejected', 'published', 'all'];

        foreach ($validTabs as $tab) {
            $response = $this->getJson("/api/v1/dashboard/events?tab={$tab}");
            $response->assertOk();
        }
    }

    #[Test]
    public function test_entity_admin_can_access_event_detail(): void
    {
        $user = $this->authenticateUser('entity_admin');

        // Create required event type
        $eventType = \App\Models\EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ]);

        $event = \App\Models\Event::factory()->create([
            'entity_id' => $this->organization->id,
            'created_by' => $user->id,
            'status_id' => $this->getStatusId('draft'),
            'event_type_id' => $eventType->id,
        ]);

        $response = $this->getJson("/api/v1/events/{$event->id}/detail");

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data',
            'message',
        ]);
    }

    #[Test]
    public function test_event_detail_returns_404_for_nonexistent_event(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/events/999999/detail');

        $response->assertNotFound();
    }

    // ================================================================
    // ERROR HANDLING — 500 catch block coverage
    // ================================================================

    #[Test]
    public function test_events_summary_returns_500_on_service_exception(): void
    {
        $this->authenticateUser('entity_admin');

        $mock = $this->mock(DashboardService::class);
        $mock->shouldReceive('getEventsSummary')
            ->once()
            ->andThrow(new \RuntimeException('DB connection lost'));

        $response = $this->getJson('/api/v1/dashboard/events/summary');

        $response->assertStatus(500);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', 'Failed to retrieve events summary');
        $response->assertJsonPath('error', 'Internal server error');
    }

    #[Test]
    public function test_events_list_returns_500_on_service_exception(): void
    {
        $this->authenticateUser('entity_admin');

        $mock = $this->mock(DashboardService::class);
        $mock->shouldReceive('getFilteredEvents')
            ->once()
            ->andThrow(new \RuntimeException('Query timeout'));

        $response = $this->getJson('/api/v1/dashboard/events?tab=pending');

        $response->assertStatus(500);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', 'Failed to retrieve events');
        $response->assertJsonPath('error', 'Internal server error');
    }

    #[Test]
    public function test_event_detail_returns_500_on_service_exception(): void
    {
        $this->authenticateUser('entity_admin');

        $mock = $this->mock(DashboardService::class);
        $mock->shouldReceive('getEventDetail')
            ->once()
            ->andThrow(new \RuntimeException('Unexpected DB error'));

        $response = $this->getJson('/api/v1/events/1/detail');

        $response->assertStatus(500);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', 'Failed to retrieve event detail');
        $response->assertJsonPath('error', 'Internal server error');
    }
}
