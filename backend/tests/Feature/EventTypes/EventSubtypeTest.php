<?php

namespace Tests\Feature\EventTypes;

use Tests\TestCase;
use App\Models\EventType;
use App\Models\EventSubtype;
use App\Models\Event;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * EventSubtype Controller Tests
 *
 * Tests for EventSubtype CRUD operations including:
 * - Index (list subtypes for event type)
 * - Store (create subtype for event type)
 * - Show (retrieve)
 * - Update
 * - Delete
 * - Toggle status
 * - Active only endpoint
 * - Parent-child relationship validation
 *
 * Created: December 2, 2025
 */
class EventSubtypeTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;
    private EventType $eventType;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Seed lookup tables
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
    }

    /**
     * Authenticate a user and create a parent event type.
     */
    protected function authenticateAndSetup(): User
    {
        $user = User::factory()->create();
        $this->organization = Organization::factory()->create();
        $user->organizations()->attach($this->organization->id);

        $this->eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Conferencia'
        ]);

        $this->actingAs($user);
        return $user;
    }

    // ==================== INDEX TESTS ====================

    /**
     * Test that we can list subtypes for an event type.
     */
    public function test_can_list_subtypes_for_event_type(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        EventSubtype::factory()->count(5)->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Act
        $response = $this->getJson("/api/v1/event-types/{$this->eventType->id}/subtypes");

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'links',
                'meta'
            ]);

        $this->assertCount(5, $response->json('data'));
    }

    /**
     * Test that subtypes list only returns subtypes of the specified event type.
     */
    public function test_subtypes_list_is_filtered_by_event_type(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        // Create another event type with subtypes
        $otherEventType = EventType::factory()->create([
            'entity_id' => $this->organization->id
        ]);

        // Create subtypes for our event type
        EventSubtype::factory()->count(3)->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Create subtypes for other event type
        EventSubtype::factory()->count(2)->create([
            'event_type_id' => $otherEventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Act
        $response = $this->getJson("/api/v1/event-types/{$this->eventType->id}/subtypes");

        // Assert - Only subtypes of the requested event type
        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));

        // All returned subtypes belong to the requested event type
        foreach ($response->json('data') as $subtype) {
            $this->assertEquals($this->eventType->id, $subtype['event_type_id']);
        }
    }

    /**
     * Test that we can filter subtypes by search term.
     */
    public function test_can_filter_subtypes_by_search(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        EventSubtype::factory()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Congreso Nacional'
        ]);
        EventSubtype::factory()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Seminario Internacional'
        ]);

        // Act
        $response = $this->getJson("/api/v1/event-types/{$this->eventType->id}/subtypes?search=congreso");

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertStringContainsStringIgnoringCase('congreso', $data[0]['name']);
    }

    /**
     * Test that we can filter subtypes by active status.
     */
    public function test_can_filter_subtypes_by_active_status(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        EventSubtype::factory()->count(3)->active()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id
        ]);
        EventSubtype::factory()->count(2)->inactive()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Act - Get only active
        $response = $this->getJson("/api/v1/event-types/{$this->eventType->id}/subtypes?is_active=true");

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(3, $data);
        foreach ($data as $subtype) {
            $this->assertTrue($subtype['is_active']);
        }
    }

    // ==================== STORE TESTS ====================

    /**
     * Test that we can create a new subtype.
     */
    public function test_can_create_subtype(): void
    {
        // Arrange
        $this->authenticateAndSetup();
        $subtypeData = [
            'name' => 'Congreso Científico',
            'is_active' => true,
        ];

        // Act
        $response = $this->postJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes",
            $subtypeData
        );

        // Assert
        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Congreso Científico')
            ->assertJsonPath('data.event_type_id', $this->eventType->id);

        $this->assertDatabaseHas('event_subtypes', [
            'name' => 'Congreso Científico',
            'event_type_id' => $this->eventType->id,
        ]);
    }

    /**
     * Test that subtype creation fails without required name.
     */
    public function test_cannot_create_subtype_without_name(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        // Act
        $response = $this->postJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes",
            []
        );

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * Test that subtype creation requires authentication.
     */
    public function test_cannot_create_subtype_without_authentication(): void
    {
        // Arrange - Create event type without auth
        $eventType = EventType::factory()->create();

        // Act
        $response = $this->postJson(
            "/api/v1/event-types/{$eventType->id}/subtypes",
            ['name' => 'Test Subtype']
        );

        // Assert
        $response->assertStatus(401);
    }

    /**
     * Test that subtype inherits entity_id from parent event type.
     */
    public function test_subtype_inherits_entity_id_from_parent(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        // Act
        $response = $this->postJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes",
            ['name' => 'Test Subtype']
        );

        // Assert
        $response->assertStatus(201);

        $this->assertDatabaseHas('event_subtypes', [
            'name' => 'Test Subtype',
            'entity_id' => $this->eventType->entity_id,
        ]);
    }

    // ==================== SHOW TESTS ====================

    /**
     * Test that we can retrieve a single subtype.
     */
    public function test_can_show_subtype(): void
    {
        // Arrange
        $this->authenticateAndSetup();
        $subtype = EventSubtype::factory()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Seminario Especial'
        ]);

        // Act
        $response = $this->getJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes/{$subtype->id}"
        );

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Seminario Especial');
    }

    /**
     * Test that show validates subtype belongs to event type.
     */
    public function test_show_validates_subtype_belongs_to_event_type(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        // Create subtype for a different event type
        $otherEventType = EventType::factory()->create([
            'entity_id' => $this->organization->id
        ]);
        $subtype = EventSubtype::factory()->create([
            'event_type_id' => $otherEventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Act - Try to access subtype through wrong event type
        $response = $this->getJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes/{$subtype->id}"
        );

        // Assert
        $response->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    // ==================== UPDATE TESTS ====================

    /**
     * Test that we can update a subtype.
     */
    public function test_can_update_subtype(): void
    {
        // Arrange
        $this->authenticateAndSetup();
        $subtype = EventSubtype::factory()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Original Name'
        ]);

        // Act
        $response = $this->putJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes/{$subtype->id}",
            ['name' => 'Updated Name']
        );

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('event_subtypes', [
            'id' => $subtype->id,
            'name' => 'Updated Name',
        ]);
    }

    /**
     * Test that update validates subtype belongs to event type.
     */
    public function test_update_validates_subtype_belongs_to_event_type(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        $otherEventType = EventType::factory()->create([
            'entity_id' => $this->organization->id
        ]);
        $subtype = EventSubtype::factory()->create([
            'event_type_id' => $otherEventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Act - Try to update through wrong event type
        $response = $this->putJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes/{$subtype->id}",
            ['name' => 'Updated Name']
        );

        // Assert
        $response->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    // ==================== DELETE TESTS ====================

    /**
     * Test that we can delete a subtype without events.
     */
    public function test_can_delete_subtype_without_events(): void
    {
        // Arrange
        $this->authenticateAndSetup();
        $subtype = EventSubtype::factory()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Act
        $response = $this->deleteJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes/{$subtype->id}"
        );

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('event_subtypes', [
            'id' => $subtype->id,
        ]);
    }

    /**
     * Test that delete validates subtype belongs to event type.
     */
    public function test_delete_validates_subtype_belongs_to_event_type(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        $otherEventType = EventType::factory()->create([
            'entity_id' => $this->organization->id
        ]);
        $subtype = EventSubtype::factory()->create([
            'event_type_id' => $otherEventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Act - Try to delete through wrong event type
        $response = $this->deleteJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes/{$subtype->id}"
        );

        // Assert
        $response->assertStatus(404)
            ->assertJsonPath('success', false);

        // Subtype should still exist
        $this->assertDatabaseHas('event_subtypes', [
            'id' => $subtype->id,
        ]);
    }

    // ==================== TOGGLE STATUS TESTS ====================

    /**
     * Test that we can toggle subtype status to inactive.
     */
    public function test_can_toggle_subtype_status_to_inactive(): void
    {
        // Arrange
        $this->authenticateAndSetup();
        $subtype = EventSubtype::factory()->active()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Act
        $response = $this->patchJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes/{$subtype->id}/toggle-status"
        );

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_active', false);
    }

    /**
     * Test that we can toggle subtype status to active.
     */
    public function test_can_toggle_subtype_status_to_active(): void
    {
        // Arrange
        $this->authenticateAndSetup();
        $subtype = EventSubtype::factory()->inactive()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Act
        $response = $this->patchJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes/{$subtype->id}/toggle-status"
        );

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_active', true);
    }

    /**
     * Test that toggle validates subtype belongs to event type.
     */
    public function test_toggle_validates_subtype_belongs_to_event_type(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        $otherEventType = EventType::factory()->create([
            'entity_id' => $this->organization->id
        ]);
        $subtype = EventSubtype::factory()->create([
            'event_type_id' => $otherEventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Act
        $response = $this->patchJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes/{$subtype->id}/toggle-status"
        );

        // Assert
        $response->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    // ==================== ACTIVE ENDPOINT TESTS ====================

    /**
     * Test that active endpoint returns only active subtypes.
     */
    public function test_can_get_active_subtypes_only(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        // Create active subtypes
        EventSubtype::factory()->count(3)->active()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Create inactive subtypes
        EventSubtype::factory()->count(2)->inactive()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Act
        $response = $this->getJson("/api/v1/event-types/{$this->eventType->id}/subtypes/active");

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'message', 'data']);

        $data = $response->json('data');
        $this->assertCount(3, $data);

        foreach ($data as $subtype) {
            $this->assertTrue($subtype['is_active']);
        }
    }

    // ==================== EDGE CASES ====================

    /**
     * Test pagination works correctly.
     */
    public function test_subtypes_pagination(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        EventSubtype::factory()->count(20)->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id
        ]);

        // Act
        $response = $this->getJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes?per_page=5&page=1"
        );

        // Assert
        $response->assertStatus(200);
        $this->assertCount(5, $response->json('data'));
        $this->assertEquals(1, $response->json('meta.current_page'));
    }

    /**
     * Test search is case-insensitive.
     */
    public function test_search_is_case_insensitive(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        EventSubtype::factory()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'SEMINARIO MAYÚSCULAS'
        ]);

        // Act
        $response = $this->getJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes?search=seminario"
        );

        // Assert
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    /**
     * Test empty subtypes list returns empty array.
     */
    public function test_empty_subtypes_returns_empty_array(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        // Act
        $response = $this->getJson("/api/v1/event-types/{$this->eventType->id}/subtypes");

        // Assert
        $response->assertStatus(200);
        $this->assertCount(0, $response->json('data'));
    }

    /**
     * Test that default is_active value is true for new subtypes.
     */
    public function test_default_is_active_true(): void
    {
        // Arrange
        $this->authenticateAndSetup();

        // Act - Create without specifying is_active
        $response = $this->postJson(
            "/api/v1/event-types/{$this->eventType->id}/subtypes",
            ['name' => 'Default Active Subtype']
        );

        // Assert
        $response->assertStatus(201)
            ->assertJsonPath('data.is_active', true);
    }
}
