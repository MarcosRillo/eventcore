<?php

namespace Tests\Feature\Organizations;

use Tests\TestCase;
use App\Models\Organization;
use App\Models\OrganizationStatus;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class OrganizationTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed lookup tables
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
    }

    /**
     * Create an entity admin user with a primary entity.
     */
    protected function createEntityAdmin(): array
    {
        // Get entity_admin role
        $role = UserRole::where('role_code', 'entity_admin')->first();

        // Create primary entity (the ente)
        $entity = Organization::factory()->primaryEntity()->create();

        // Create user with entity_admin role
        $user = User::factory()->create([
            'role_id' => $role->id,
        ]);

        // Associate user with entity
        $user->organizations()->attach($entity->id);

        $this->actingAs($user);

        return ['user' => $user, 'entity' => $entity];
    }

    /**
     * Create linked organizations (organizers) for an entity.
     */
    protected function createLinkedOrganizations(Organization $entity, int $count = 3): \Illuminate\Database\Eloquent\Collection
    {
        return Organization::factory()
            ->count($count)
            ->eventOrganizer()
            ->create([
                'parent_id' => $entity->id,
            ]);
    }

    /**
     * Test that entity admin can list linked organizations.
     */
    public function test_entity_admin_can_list_linked_organizations(): void
    {
        // Arrange
        $setup = $this->createEntityAdmin();
        $this->createLinkedOrganizations($setup['entity'], 5);

        // Act
        $response = $this->getJson('/api/v1/organizations');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'pagination' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $this->assertTrue($response->json('success'));
        $this->assertEquals(5, $response->json('pagination.total'));
    }

    /**
     * Test that organizations include event metrics.
     */
    public function test_organizations_include_event_metrics(): void
    {
        // Arrange
        $setup = $this->createEntityAdmin();
        $organizers = $this->createLinkedOrganizations($setup['entity'], 2);

        // Act
        $response = $this->getJson('/api/v1/organizations');

        // Assert
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertNotEmpty($data);

        // Each organization should have event metrics
        foreach ($data as $org) {
            $this->assertArrayHasKey('events_total', $org);
            $this->assertArrayHasKey('events_published', $org);
            $this->assertArrayHasKey('events_pending', $org);
            $this->assertArrayHasKey('events_rejected', $org);
        }
    }

    /**
     * Test that entity admin can view organization detail.
     */
    public function test_entity_admin_can_view_organization_detail(): void
    {
        // Arrange
        $setup = $this->createEntityAdmin();
        $organizers = $this->createLinkedOrganizations($setup['entity'], 1);
        $organizer = $organizers->first();

        // Act
        $response = $this->getJson("/api/v1/organizations/{$organizer->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'name',
                    'cuit',
                    'status',
                    'type',
                    'users',
                ],
            ]);

        $this->assertTrue($response->json('success'));
        $this->assertEquals($organizer->id, $response->json('data.id'));
    }

    /**
     * Test that entity admin can toggle organization status.
     */
    public function test_entity_admin_can_toggle_organization_status(): void
    {
        // Arrange
        $setup = $this->createEntityAdmin();
        $organizers = $this->createLinkedOrganizations($setup['entity'], 1);
        $organizer = $organizers->first();

        // Verify initial status is active
        $this->assertEquals('active', $organizer->status->status_code);

        // Act - Toggle to suspended
        $response = $this->patchJson("/api/v1/organizations/{$organizer->id}/status");

        // Assert
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verify status changed in database
        $organizer->refresh();
        $this->assertEquals('suspended', $organizer->status->status_code);

        // Act - Toggle back to active
        $response = $this->patchJson("/api/v1/organizations/{$organizer->id}/status");

        // Assert
        $response->assertStatus(200);
        $organizer->refresh();
        $this->assertEquals('active', $organizer->status->status_code);
    }

    /**
     * Test that search filter works.
     */
    public function test_can_search_organizations_by_name(): void
    {
        // Arrange
        $setup = $this->createEntityAdmin();

        Organization::factory()->eventOrganizer()->create([
            'parent_id' => $setup['entity']->id,
            'name' => 'Hotel Tucumán',
        ]);

        Organization::factory()->eventOrganizer()->create([
            'parent_id' => $setup['entity']->id,
            'name' => 'Restaurante Plaza',
        ]);

        // Act
        $response = $this->getJson('/api/v1/organizations?search=Hotel');

        // Assert
        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('pagination.total'));
        $this->assertStringContainsString('Hotel', $response->json('data.0.name'));
    }

    /**
     * Test that status filter works.
     */
    public function test_can_filter_organizations_by_status(): void
    {
        // Arrange
        $setup = $this->createEntityAdmin();
        $suspendedStatus = OrganizationStatus::where('status_code', 'suspended')->first();

        // Create active organization
        Organization::factory()->eventOrganizer()->active()->create([
            'parent_id' => $setup['entity']->id,
        ]);

        // Create suspended organization
        Organization::factory()->eventOrganizer()->create([
            'parent_id' => $setup['entity']->id,
            'status_id' => $suspendedStatus->id,
        ]);

        // Act - Filter by suspended
        $response = $this->getJson('/api/v1/organizations?status=suspended');

        // Assert
        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('pagination.total'));
    }

    /**
     * Test that entity staff can only read organizations (not toggle status).
     */
    public function test_entity_staff_cannot_toggle_status(): void
    {
        // Arrange
        $staffRole = UserRole::where('role_code', 'entity_staff')->first();
        $entity = Organization::factory()->primaryEntity()->create();

        $staff = User::factory()->create([
            'role_id' => $staffRole->id,
        ]);
        $staff->organizations()->attach($entity->id);

        $organizer = Organization::factory()->eventOrganizer()->create([
            'parent_id' => $entity->id,
        ]);

        $this->actingAs($staff);

        // Act - Try to toggle status
        $response = $this->patchJson("/api/v1/organizations/{$organizer->id}/status");

        // Assert - Should be forbidden
        $response->assertStatus(403);
    }

    /**
     * Test that entity staff can read organizations.
     */
    public function test_entity_staff_can_read_organizations(): void
    {
        // Arrange
        $staffRole = UserRole::where('role_code', 'entity_staff')->first();
        $entity = Organization::factory()->primaryEntity()->create();

        $staff = User::factory()->create([
            'role_id' => $staffRole->id,
        ]);
        $staff->organizations()->attach($entity->id);

        Organization::factory()->eventOrganizer()->create([
            'parent_id' => $entity->id,
        ]);

        $this->actingAs($staff);

        // Act
        $response = $this->getJson('/api/v1/organizations');

        // Assert
        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('pagination.total'));
    }

    /**
     * Test that organizer cannot access organizations endpoint.
     */
    public function test_organizer_cannot_access_organizations(): void
    {
        // Arrange
        $organizerRole = UserRole::where('role_code', 'organizer_admin')->first();
        $entity = Organization::factory()->primaryEntity()->create();
        $organizer = Organization::factory()->eventOrganizer()->create([
            'parent_id' => $entity->id,
        ]);

        $user = User::factory()->create([
            'role_id' => $organizerRole->id,
        ]);
        $user->organizations()->attach($organizer->id);

        $this->actingAs($user);

        // Act
        $response = $this->getJson('/api/v1/organizations');

        // Assert - Should be forbidden
        $response->assertStatus(403);
    }

    /**
     * Test that cannot view organization from another entity.
     */
    public function test_cannot_view_organization_from_another_entity(): void
    {
        // Arrange
        $setup = $this->createEntityAdmin();

        // Create another entity with an organizer
        $otherEntity = Organization::factory()->primaryEntity()->create();
        $otherOrganizer = Organization::factory()->eventOrganizer()->create([
            'parent_id' => $otherEntity->id,
        ]);

        // Act - Try to view organizer from another entity
        $response = $this->getJson("/api/v1/organizations/{$otherOrganizer->id}");

        // Assert
        $response->assertStatus(404);
    }
}
