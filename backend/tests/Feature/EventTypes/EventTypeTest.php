<?php

namespace Tests\Feature\EventTypes;

use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Events\EventTestCase;

/**
 * EventType Controller Tests
 *
 * Tests for EventType CRUD operations including:
 * - Index (list with filters)
 * - Store (create)
 * - Show (retrieve)
 * - Update
 * - Delete
 * - Toggle status
 * - Active only endpoint
 * - Stats endpoint
 *
 * Created: December 2, 2025
 */
class EventTypeTest extends EventTestCase
{
    use RefreshDatabase;

    protected $organization;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Seed lookup tables
        $this->seed(UserRolesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
    }

    /**
     * Override to add organization attachment for event type tests
     */
    protected function authenticateUser(string $role = 'entity_admin'): User
    {
        $user = parent::authenticateUser($role);
        $this->organization = Organization::factory()->create();
        $user->organizations()->attach($this->organization->id);

        return $user;
    }

    // ==================== INDEX TESTS ====================

    /**
     * Test that we can list all event types.
     */
    public function test_can_list_event_types(): void
    {
        // Arrange
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        EventType::factory()->count(5)->create([
            'entity_id' => $organization->id,
        ]);

        // Act
        $response = $this->getJson('/api/v1/event-types');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'links',
                'meta',
            ]);

        $this->assertGreaterThanOrEqual(5, count($response->json('data')));
    }

    /**
     * Test that we can filter event types by search term.
     */
    public function test_can_filter_event_types_by_search(): void
    {
        // Arrange
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        EventType::factory()->create([
            'entity_id' => $organization->id,
            'name' => 'Conferencia Internacional',
        ]);
        EventType::factory()->create([
            'entity_id' => $organization->id,
            'name' => 'Taller Práctico',
        ]);

        // Act
        $response = $this->getJson('/api/v1/event-types?search=conferencia');

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertGreaterThan(0, count($data));
        $this->assertStringContainsStringIgnoringCase('conferencia', $data[0]['name']);
    }

    /**
     * Test that we can filter event types by active status.
     */
    public function test_can_filter_event_types_by_active_status(): void
    {
        // Arrange
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        EventType::factory()->count(3)->active()->create([
            'entity_id' => $organization->id,
        ]);
        EventType::factory()->count(2)->inactive()->create([
            'entity_id' => $organization->id,
        ]);

        // Act - Get only active
        $response = $this->getJson('/api/v1/event-types?is_active=true');

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data');
        foreach ($data as $eventType) {
            $this->assertTrue($eventType['is_active']);
        }
    }

    /**
     * Test pagination works correctly.
     */
    public function test_event_types_pagination(): void
    {
        // Arrange
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        EventType::factory()->count(20)->create([
            'entity_id' => $organization->id,
        ]);

        // Act - Get first page with 5 items
        $response = $this->getJson('/api/v1/event-types?per_page=5&page=1');

        // Assert
        $response->assertStatus(200);
        $this->assertCount(5, $response->json('data'));
        $this->assertEquals(1, $response->json('meta.current_page'));
    }

    // ==================== STORE TESTS ====================

    /**
     * Test that we can create a new event type.
     */
    public function test_can_create_event_type(): void
    {
        // Arrange
        $this->authenticateUser();
        $eventTypeData = [
            'name' => 'Congreso Nacional',
            'color' => '#FF5733',
            'is_active' => true,
        ];

        // Act
        $response = $this->postJson('/api/v1/event-types', $eventTypeData);

        // Assert
        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Congreso Nacional')
            ->assertJsonPath('data.color', '#FF5733')
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('event_types', [
            'name' => 'Congreso Nacional',
        ]);
    }

    /**
     * Test that event type creation fails without required fields.
     */
    public function test_cannot_create_event_type_without_name(): void
    {
        // Arrange
        $this->authenticateUser();

        // Act
        $response = $this->postJson('/api/v1/event-types', []);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * Test that event type creation requires authentication.
     */
    public function test_cannot_create_event_type_without_authentication(): void
    {
        // Act
        $response = $this->postJson('/api/v1/event-types', [
            'name' => 'Test Type',
            'is_active' => true,
        ]);

        // Assert
        $response->assertStatus(401);
    }

    /**
     * Test that default is_active value is true.
     */
    public function test_event_type_default_is_active_true(): void
    {
        // Arrange
        $this->authenticateUser();

        // Act - Create without specifying is_active
        $response = $this->postJson('/api/v1/event-types', [
            'name' => 'Default Active Type',
            'color' => '#3B82F6',
        ]);

        // Assert
        $response->assertStatus(201)
            ->assertJsonPath('data.is_active', true);
    }

    // ==================== SHOW TESTS ====================

    /**
     * Test that we can retrieve a single event type.
     */
    public function test_can_show_event_type(): void
    {
        // Arrange
        $this->authenticateUser();
        $eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Festival Cultural',
        ]);

        // Act
        $response = $this->getJson("/api/v1/event-types/{$eventType->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Festival Cultural');
    }

    /**
     * Test that show returns 404 for non-existent event type.
     */
    public function test_show_returns_404_for_nonexistent_event_type(): void
    {
        // Arrange
        $this->authenticateUser();

        // Act
        $response = $this->getJson('/api/v1/event-types/99999');

        // Assert
        $response->assertStatus(404);
    }

    // ==================== UPDATE TESTS ====================

    /**
     * Test that we can update an event type.
     */
    public function test_can_update_event_type(): void
    {
        // Arrange
        $this->authenticateUser();
        $eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Original Name',
        ]);

        // Act
        $response = $this->putJson("/api/v1/event-types/{$eventType->id}", [
            'name' => 'Updated Name',
        ]);

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('event_types', [
            'id' => $eventType->id,
            'name' => 'Updated Name',
        ]);
    }

    /**
     * Test that we can update event type active status.
     */
    public function test_can_update_event_type_active_status(): void
    {
        // Arrange
        $this->authenticateUser();
        $eventType = EventType::factory()->active()->create([
            'entity_id' => $this->organization->id,
        ]);

        // Act
        $response = $this->putJson("/api/v1/event-types/{$eventType->id}", [
            'name' => $eventType->name,
            'is_active' => false,
        ]);

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('event_types', [
            'id' => $eventType->id,
            'is_active' => false,
        ]);
    }

    /**
     * Test that update requires authentication.
     */
    public function test_cannot_update_event_type_without_authentication(): void
    {
        // Arrange
        $eventType = EventType::factory()->create();

        // Act
        $response = $this->putJson("/api/v1/event-types/{$eventType->id}", [
            'name' => 'Updated Name',
        ]);

        // Assert
        $response->assertStatus(401);
    }

    // ==================== DELETE TESTS ====================

    /**
     * Test that we can delete an event type without subtypes.
     */
    public function test_can_delete_event_type_without_subtypes(): void
    {
        // Arrange
        $this->authenticateUser();
        $eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
        ]);

        // Act
        $response = $this->deleteJson("/api/v1/event-types/{$eventType->id}");

        // Assert
        $response->assertNoContent();

        $this->assertSoftDeleted('event_types', [
            'id' => $eventType->id,
        ]);
    }

    /**
     * Test that we cannot delete an event type with subtypes.
     */
    public function test_cannot_delete_event_type_with_subtypes(): void
    {
        // Arrange
        $this->authenticateUser();
        $eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
        ]);
        EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $eventType->entity_id,
        ]);

        // Act
        $response = $this->deleteJson("/api/v1/event-types/{$eventType->id}");

        // Assert
        $response->assertStatus(400)
            ->assertJsonPath('success', false);

        // Event type should still exist
        $this->assertDatabaseHas('event_types', [
            'id' => $eventType->id,
        ]);
    }

    /**
     * Test that delete requires authentication.
     */
    public function test_cannot_delete_event_type_without_authentication(): void
    {
        // Arrange
        $eventType = EventType::factory()->create();

        // Act
        $response = $this->deleteJson("/api/v1/event-types/{$eventType->id}");

        // Assert
        $response->assertStatus(401);
    }

    // ==================== TOGGLE STATUS TESTS ====================

    /**
     * Test that we can toggle event type status from active to inactive.
     */
    public function test_can_toggle_event_type_status_to_inactive(): void
    {
        // Arrange
        $this->authenticateUser();
        $eventType = EventType::factory()->active()->create([
            'entity_id' => $this->organization->id,
        ]);

        // Act
        $response = $this->patchJson("/api/v1/event-types/{$eventType->id}/toggle-status");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_active', false);
    }

    /**
     * Test that we can toggle event type status from inactive to active.
     */
    public function test_can_toggle_event_type_status_to_active(): void
    {
        // Arrange
        $this->authenticateUser();
        $eventType = EventType::factory()->inactive()->create([
            'entity_id' => $this->organization->id,
        ]);

        // Act
        $response = $this->patchJson("/api/v1/event-types/{$eventType->id}/toggle-status");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_active', true);
    }

    // ==================== ACTIVE ENDPOINT TESTS ====================

    /**
     * Test that active endpoint returns only active event types.
     */
    public function test_can_get_active_event_types_only(): void
    {
        // Arrange
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        // Create active event types
        EventType::factory()->count(3)->active()->create([
            'entity_id' => $organization->id,
        ]);

        // Create inactive event types (should not be returned)
        EventType::factory()->count(2)->inactive()->create([
            'entity_id' => $organization->id,
        ]);

        // Act
        $response = $this->getJson('/api/v1/event-types/active');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'message', 'data']);

        $data = $response->json('data');
        $this->assertGreaterThan(0, count($data));

        // All returned event types should be active
        foreach ($data as $eventType) {
            $this->assertTrue($eventType['is_active']);
        }
    }

    // ==================== STATS ENDPOINT TESTS ====================

    /**
     * Test that stats endpoint returns correct statistics.
     */
    public function test_can_get_event_type_stats(): void
    {
        // Arrange
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        // Create known number of event types
        EventType::factory()->count(3)->active()->create([
            'entity_id' => $organization->id,
        ]);
        EventType::factory()->count(2)->inactive()->create([
            'entity_id' => $organization->id,
        ]);

        // Act
        $response = $this->getJson('/api/v1/event-types/stats');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['total', 'active', 'inactive'],
            ]);

        $stats = $response->json('data');
        $this->assertGreaterThanOrEqual(5, $stats['total']);
        $this->assertGreaterThanOrEqual(3, $stats['active']);
        $this->assertGreaterThanOrEqual(2, $stats['inactive']);
    }

    // ==================== EDGE CASES ====================

    /**
     * Test that name validation rejects empty string.
     */
    public function test_name_validation_rejects_empty_string(): void
    {
        // Arrange
        $this->authenticateUser();

        // Act
        $response = $this->postJson('/api/v1/event-types', [
            'name' => '',
        ]);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * Test that name validation rejects whitespace only.
     */
    public function test_name_validation_rejects_whitespace(): void
    {
        // Arrange
        $this->authenticateUser();

        // Act
        $response = $this->postJson('/api/v1/event-types', [
            'name' => '   ',
        ]);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * Test search is case-insensitive.
     */
    public function test_search_is_case_insensitive(): void
    {
        // Arrange
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        EventType::factory()->create([
            'entity_id' => $organization->id,
            'name' => 'CONFERENCIA MAYÚSCULAS',
        ]);

        // Act - Search with lowercase
        $response = $this->getJson('/api/v1/event-types?search=conferencia');

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertGreaterThan(0, count($data));
    }

    /**
     * Test per_page has maximum limit.
     */
    public function test_per_page_has_maximum_limit(): void
    {
        // Arrange
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        EventType::factory()->count(150)->create([
            'entity_id' => $organization->id,
        ]);

        // Act - Request more than max
        $response = $this->getJson('/api/v1/event-types?per_page=200');

        // Assert - Should be capped at MAX_PER_PAGE (100)
        $response->assertStatus(200);
        $this->assertLessThanOrEqual(100, count($response->json('data')));
    }
}
