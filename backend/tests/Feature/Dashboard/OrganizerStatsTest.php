<?php

namespace Tests\Feature\Dashboard;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\Feature\Events\EventTestCase;

class OrganizerStatsTest extends EventTestCase
{
    use RefreshDatabase;

    protected $organization;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed only lookup tables (DatabaseTransactions rolls back after each test)
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
    }

    /**
     * Override to add organization attachment for organizer stats tests
     */
    protected function authenticateUser(string $role = 'organizer_admin'): User
    {
        $user = parent::authenticateUser($role);
        $this->organization = \App\Models\Organization::factory()->create();
        $user->organizations()->attach($this->organization->id);

        return $user;
    }

    #[Test]
    public function test_returns_correct_stats_for_authenticated_organizer(): void
    {
        $organizer = $this->authenticateUser();

        // Arrange: Create 12 events with all different statuses (mutually exclusive)
        // 2 pending_internal
        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        // 3 approved_internal
        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('approved_internal'),
        ]);

        // 1 pending_public
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('pending_public_approval'),
        ]);

        // 4 published
        Event::factory()->count(4)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('published'),
        ]);

        // 1 requires_changes
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('requires_changes'),
        ]);

        // 1 rejected
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('rejected'),
        ]);

        // Act
        $response = $this->getJson('/api/v1/organizer/stats');

        // Assert (>3 assertions - testing all 6 separate counters)
        $response->assertStatus(200);                                    // Assertion 1
        $response->assertJsonPath('data.total_events', 12);              // Assertion 2
        $response->assertJsonPath('data.pending_internal', 2);           // Assertion 3
        $response->assertJsonPath('data.approved_internal', 3);          // Assertion 4
        $response->assertJsonPath('data.pending_public', 1);             // Assertion 5
        $response->assertJsonPath('data.published', 4);                  // Assertion 6
        $response->assertJsonPath('data.requires_changes', 1);           // Assertion 7
        $response->assertJsonPath('data.rejected', 1);                   // Assertion 8

        // Verify database state - count only this organizer's events
        $this->assertEquals(12, Event::where('created_by', $organizer->id)->count()); // Assertion 9
    }

    #[Test]
    public function test_returns_401_for_unauthenticated_request(): void
    {
        // Act: Request without authentication
        $response = $this->getJson('/api/v1/organizer/stats');

        // Assert (>3 assertions)
        $response->assertStatus(401);                                    // Assertion 1
        $response->assertJsonStructure(['message']);                     // Assertion 2
        $this->assertEquals('Unauthenticated', $response->json('message')); // Assertion 3
        $this->assertNull($response->json('total_events'));              // Assertion 4
    }

    #[Test]
    public function test_only_counts_organizers_own_events(): void
    {
        // Arrange: Create two organizers with events
        $organizerA = $this->authenticateUser();
        $organizerB = User::factory()->create();
        $organizationB = \App\Models\Organization::factory()->create();
        $organizerB->organizations()->attach($organizationB->id);

        // Organizer A: 5 events
        Event::factory()->count(5)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizerA->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        // Organizer B: 3 events (should not be counted)
        Event::factory()->count(3)->create([
            'entity_id' => $organizationB->id,
            'organization_id' => $organizationB->id,
            'created_by' => $organizerB->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        // Act: Get stats for Organizer A
        $response = $this->getJson('/api/v1/organizer/stats');

        // Assert (>3 assertions)
        $response->assertStatus(200);                                 // Assertion 1
        $response->assertJsonPath('data.total_events', 5);            // Assertion 2: Only A's events
        $this->assertEquals(5, Event::where('created_by', $organizerA->id)->count()); // Assertion 3
        $this->assertEquals(3, Event::withoutGlobalScopes()->where('created_by', $organizerB->id)->count()); // Assertion 4
        $this->assertDatabaseHas('events', [                          // Assertion 5
            'created_by' => $organizerA->id,
        ]);
        $this->assertDatabaseHas('events', [                          // Assertion 6
            'created_by' => $organizerB->id,
        ]);
    }

    #[Test]
    public function test_returns_zero_for_organizer_with_no_events(): void
    {
        // Arrange: Organizer with no events
        $organizer = $this->authenticateUser();

        // Act
        $response = $this->getJson('/api/v1/organizer/stats');

        // Assert (>3 assertions - all counters should be zero)
        $response->assertStatus(200);                                    // Assertion 1
        $response->assertJsonPath('data.total_events', 0);               // Assertion 2
        $response->assertJsonPath('data.pending_internal', 0);           // Assertion 3
        $response->assertJsonPath('data.approved_internal', 0);          // Assertion 4
        $response->assertJsonPath('data.draft', 0);                       // Assertion 5
        $response->assertJsonPath('data.pending_public', 0);             // Assertion 6
        $response->assertJsonPath('data.published', 0);                  // Assertion 7
        $response->assertJsonPath('data.requires_changes', 0);           // Assertion 8
        $response->assertJsonPath('data.rejected', 0);                   // Assertion 9
        $this->assertDatabaseMissing('events', [                    // Assertion 9
            'created_by' => $organizer->id,
        ]);
    }

    #[Test]
    public function test_pending_internal_count_only_includes_pending_internal_status(): void
    {
        $organizer = $this->authenticateUser();

        // Arrange: Mix of statuses
        Event::factory()->count(4)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('pending_public_approval'),
        ]);

        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('published'),
        ]);

        // Act
        $response = $this->getJson('/api/v1/organizer/stats');

        // Assert (>3 assertions)
        $response->assertStatus(200);                                // Assertion 1
        $response->assertJsonPath('data.pending_internal', 4);       // Assertion 2: Only pending_internal
        $response->assertJsonPath('data.pending_public', 2);         // Assertion 3: Verify other statuses separate
        $response->assertJsonPath('data.total_events', 9);           // Assertion 4
        $this->assertEquals(9, Event::where('created_by', $organizer->id)->count()); // Assertion 5
        $this->assertEquals(4, Event::where('created_by', $organizer->id)
            ->where('status_id', $this->getStatusId('pending_internal_approval'))->count()); // Assertion 6
    }

    #[Test]
    public function test_approved_internal_count_only_includes_approved_internal_status(): void
    {
        $organizer = $this->authenticateUser();

        // Arrange: Mix of statuses
        Event::factory()->count(5)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('approved_internal'),
        ]);

        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('published'),
        ]);

        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        // Act
        $response = $this->getJson('/api/v1/organizer/stats');

        // Assert (>3 assertions)
        $response->assertStatus(200);                                 // Assertion 1
        $response->assertJsonPath('data.approved_internal', 5);       // Assertion 2: Only approved_internal
        $response->assertJsonPath('data.published', 3);               // Assertion 3: Published is separate
        $response->assertJsonPath('data.pending_internal', 2);        // Assertion 4: Pending is separate
        $response->assertJsonPath('data.total_events', 10);           // Assertion 5
        $this->assertEquals(5, Event::where('created_by', $organizer->id)
            ->where('status_id', $this->getStatusId('approved_internal'))->count()); // Assertion 6
    }

    #[Test]
    public function test_pending_public_count_only_includes_pending_public_status(): void
    {
        $organizer = $this->authenticateUser();

        // Arrange: Mix of statuses
        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('pending_public_approval'),
        ]);

        Event::factory()->count(4)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('published'),
        ]);

        // Act
        $response = $this->getJson('/api/v1/organizer/stats');

        // Assert (>3 assertions)
        $response->assertStatus(200);                                // Assertion 1
        $response->assertJsonPath('data.pending_public', 3);         // Assertion 2: Only pending_public
        $response->assertJsonPath('data.pending_internal', 4);       // Assertion 3: Different pending status
        $response->assertJsonPath('data.total_events', 9);           // Assertion 4
        $this->assertEquals(9, Event::where('created_by', $organizer->id)->count()); // Assertion 5
        $this->assertEquals(3, Event::where('created_by', $organizer->id)
            ->where('status_id', $this->getStatusId('pending_public_approval'))->count()); // Assertion 6
    }

    #[Test]
    public function test_published_count_only_includes_published_status(): void
    {
        $organizer = $this->authenticateUser();

        // Arrange: Mix of statuses
        Event::factory()->count(6)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('published'),
        ]);

        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('approved_internal'),
        ]);

        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('pending_public_approval'),
        ]);

        // Act
        $response = $this->getJson('/api/v1/organizer/stats');

        // Assert (>3 assertions)
        $response->assertStatus(200);                                // Assertion 1
        $response->assertJsonPath('data.published', 6);              // Assertion 2: Only published
        $response->assertJsonPath('data.approved_internal', 3);      // Assertion 3: Approved is separate
        $response->assertJsonPath('data.total_events', 11);          // Assertion 4
        $this->assertEquals(11, Event::where('created_by', $organizer->id)->count()); // Assertion 5
        $this->assertEquals(6, Event::where('created_by', $organizer->id)
            ->where('status_id', $this->getStatusId('published'))->count()); // Assertion 6
        $this->assertEquals(5, Event::where('created_by', $organizer->id)
            ->where('status_id', '!=', $this->getStatusId('published'))->count()); // Assertion 7
    }

    #[Test]
    public function test_requires_changes_count_only_includes_requires_changes_status(): void
    {
        $organizer = $this->authenticateUser();

        // Arrange: Mix of statuses
        Event::factory()->count(4)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('requires_changes'),
        ]);

        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('rejected'),
        ]);

        Event::factory()->count(5)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        // Act
        $response = $this->getJson('/api/v1/organizer/stats');

        // Assert (>3 assertions)
        $response->assertStatus(200);                                // Assertion 1
        $response->assertJsonPath('data.requires_changes', 4);       // Assertion 2: Only requires_changes
        $response->assertJsonPath('data.rejected', 3);               // Assertion 3: Rejected is separate
        $response->assertJsonPath('data.total_events', 12);          // Assertion 4
        $this->assertEquals(12, Event::where('created_by', $organizer->id)->count()); // Assertion 5
        $this->assertEquals(4, Event::where('created_by', $organizer->id)
            ->where('status_id', $this->getStatusId('requires_changes'))->count()); // Assertion 6
    }

    #[Test]
    public function test_rejected_count_only_includes_rejected_status(): void
    {
        $organizer = $this->authenticateUser();

        // Arrange: Mix of statuses
        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('rejected'),
        ]);

        Event::factory()->count(5)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('pending_internal_approval'),
        ]);

        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'created_by' => $organizer->id,
            'status_id' => $this->getStatusId('requires_changes'),
        ]);

        // Act
        $response = $this->getJson('/api/v1/organizer/stats');

        // Assert (>3 assertions)
        $response->assertStatus(200);                                // Assertion 1
        $response->assertJsonPath('data.rejected', 3);               // Assertion 2: Only rejected
        $response->assertJsonPath('data.requires_changes', 2);       // Assertion 3: Different status
        $response->assertJsonPath('data.total_events', 10);          // Assertion 4
        $this->assertEquals(10, Event::where('created_by', $organizer->id)->count()); // Assertion 5
        $this->assertEquals(3, Event::where('created_by', $organizer->id)
            ->where('status_id', $this->getStatusId('rejected'))->count()); // Assertion 6
    }
}
