<?php

namespace Tests\Feature\Locations;

use Tests\TestCase;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class LocationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Seed only lookup tables
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
    }

    /**
     * Authenticate a user for testing protected endpoints.
     */
    protected function authenticateUser(): User
    {
        $user = User::factory()->create();
        $organization = \App\Models\Organization::factory()->create();
        $user->organizations()->attach($organization->id);
        $this->actingAs($user);
        return $user;
    }

    /**
     * Test that we can list all locations.
     */
    public function test_can_list_locations(): void
    {
        // Arrange: Authenticate and create locations
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        Location::factory()->count(3)->create([
            'entity_id' => $organization->id,
        ]);

        // Act: Make request
        $response = $this->getJson('/api/v1/locations');

        // Assert: Verify Laravel Resource Collection pagination structure
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data',
                     'meta' => ['current_page', 'last_page', 'per_page', 'total'],
                     'links'
                 ]);

        // Assert: At least some locations exist
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /**
     * Test that we can create a new location.
     */
    public function test_can_create_location(): void
    {
        // Arrange: Authenticate and prepare data
        $this->authenticateUser();
        $locationData = [
            'name' => 'Test Location',
            'address' => '123 Test Street',
            'city' => 'Test City',
            'state' => 'Tucumán',
            'country' => 'Argentina',
            'is_active' => true,
        ];

        // Act: Create location
        $response = $this->postJson('/api/v1/locations', $locationData);

        // Assert: Verify creation
        $response->assertStatus(201);
        $this->assertDatabaseHas('locations', [
            'name' => 'Test Location',
            'address' => '123 Test Street',
        ]);
    }

    /**
     * Test that we can update an existing location.
     */
    public function test_can_update_location(): void
    {
        // Arrange: Authenticate and create location
        $this->authenticateUser();
        $location = Location::factory()->create(['name' => 'Original Location']);

        // Act: Update location
        $response = $this->putJson("/api/v1/locations/{$location->id}", [
            'name' => 'Updated Location',
        ]);

        // Assert: Verify update
        $response->assertStatus(200);
        $this->assertDatabaseHas('locations', [
            'id' => $location->id,
            'name' => 'Updated Location',
        ]);
    }

    /**
     * Test that we can delete a location (soft delete).
     */
    public function test_can_delete_location(): void
    {
        // Arrange: Authenticate and create location
        $this->authenticateUser();
        $location = Location::factory()->create();

        // Act: Delete location
        $response = $this->deleteJson("/api/v1/locations/{$location->id}");

        // Assert: Verify soft deletion (200 is valid for delete with response body)
        $response->assertStatus(200);
        // With SoftDeletes, the record exists but has deleted_at set
        $this->assertSoftDeleted('locations', [
            'id' => $location->id,
        ]);
    }

    /**
     * Test that active endpoint returns only active locations.
     */
    public function test_can_get_active_locations_only(): void
    {
        // Arrange: Authenticate and create test locations
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        // Create active locations
        Location::factory()->count(3)->create([
            'entity_id' => $organization->id,
            'is_active' => true
        ]);

        // Create inactive locations (should not be returned)
        Location::factory()->count(2)->create([
            'entity_id' => $organization->id,
            'is_active' => false
        ]);

        // Act: Get active locations
        $response = $this->getJson('/api/v1/locations/active');

        // Assert: Only active locations returned
        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'message', 'data']);

        // Assert: At least some active locations exist
        $this->assertGreaterThan(0, count($response->json('data')));

        // Assert: All returned locations are active
        $locations = $response->json('data');
        foreach ($locations as $location) {
            $this->assertTrue($location['is_active'] ?? false);
        }
    }

    // ============================================================
    // SEARCH FILTER TESTS
    // ============================================================

    /**
     * Test that locations can be searched by name.
     */
    public function test_can_search_locations_by_name(): void
    {
        // Arrange: Authenticate and create locations
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        Location::factory()->create([
            'entity_id' => $organization->id,
            'name' => 'Centro de Convenciones Tucumán',
        ]);

        Location::factory()->create([
            'entity_id' => $organization->id,
            'name' => 'Parque 9 de Julio',
        ]);

        // Act: Search for "Centro"
        $response = $this->getJson('/api/v1/locations?search=Centro');

        // Assert: Only matching location is returned
        $response->assertStatus(200);

        // Laravel Resource Collection: data is directly in response.data
        $locations = $response->json('data');
        $this->assertGreaterThan(0, count($locations));

        // Verify search results contain the search term
        $foundMatch = false;
        foreach ($locations as $location) {
            if (str_contains(strtolower($location['name']), 'centro')) {
                $foundMatch = true;
                break;
            }
        }
        $this->assertTrue($foundMatch, 'Search should return locations matching the name');
    }

    /**
     * Test that locations can be searched by city.
     */
    public function test_can_search_locations_by_city(): void
    {
        // Arrange: Authenticate and create locations
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        Location::factory()->create([
            'entity_id' => $organization->id,
            'name' => 'Venue A',
            'city' => 'San Miguel de Tucuman',
        ]);

        Location::factory()->create([
            'entity_id' => $organization->id,
            'name' => 'Venue B',
            'city' => 'Valle Grande',
        ]);

        // Act: Search for "Valle" (no accents to avoid encoding issues)
        $response = $this->getJson('/api/v1/locations?search=Valle');

        // Assert: Response is successful
        $response->assertStatus(200);

        // Laravel Resource Collection: data is directly in response.data
        $locations = $response->json('data');

        // Verify search results contain the search term in city
        $foundMatch = false;
        foreach ($locations as $location) {
            if (str_contains(strtolower($location['city'] ?? ''), 'valle')) {
                $foundMatch = true;
                break;
            }
        }
        $this->assertTrue($foundMatch, 'Search should return locations matching the city');
    }

    // ============================================================
    // FILTER TESTS
    // ============================================================

    /**
     * Test that locations can be filtered by active status true.
     */
    public function test_can_filter_by_active_true(): void
    {
        // Arrange: Authenticate and create locations
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        Location::factory()->create([
            'entity_id' => $organization->id,
            'name' => 'Active Venue',
            'is_active' => true,
        ]);

        Location::factory()->create([
            'entity_id' => $organization->id,
            'name' => 'Inactive Venue',
            'is_active' => false,
        ]);

        // Act: Filter by active=1 (Laravel boolean validation accepts 1/0)
        $response = $this->getJson('/api/v1/locations?active=1');

        // Assert: Only active locations returned
        $response->assertStatus(200);
        $locations = $response->json('data');

        foreach ($locations as $location) {
            $this->assertTrue($location['is_active'], 'All returned locations should be active');
        }
    }

    /**
     * Test that locations can be filtered by active status false.
     */
    public function test_can_filter_by_active_false(): void
    {
        // Arrange: Authenticate and create locations
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        Location::factory()->create([
            'entity_id' => $organization->id,
            'name' => 'Active Venue',
            'is_active' => true,
        ]);

        Location::factory()->create([
            'entity_id' => $organization->id,
            'name' => 'Inactive Venue',
            'is_active' => false,
        ]);

        // Act: Filter by active=0 (Laravel boolean validation accepts 1/0)
        $response = $this->getJson('/api/v1/locations?active=0');

        // Assert: Only inactive locations returned
        $response->assertStatus(200);
        $locations = $response->json('data');

        foreach ($locations as $location) {
            $this->assertFalse($location['is_active'], 'All returned locations should be inactive');
        }
    }

    // ============================================================
    // PAGINATION TESTS
    // ============================================================

    /**
     * Test that per_page parameter works correctly.
     */
    public function test_can_paginate_with_custom_per_page(): void
    {
        // Arrange: Authenticate and create many locations
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        Location::factory()->count(10)->create([
            'entity_id' => $organization->id,
        ]);

        // Act: Request with per_page=5
        $response = $this->getJson('/api/v1/locations?per_page=5');

        // Assert: Verify pagination
        $response->assertStatus(200);

        // Laravel Resource Collection: per_page is in meta
        $perPage = $response->json('meta.per_page');
        $this->assertEquals(5, $perPage);
    }

    // ============================================================
    // VALIDATION TESTS
    // ============================================================

    /**
     * Test that creating location without name returns 422.
     */
    public function test_create_location_without_name_returns_422(): void
    {
        // Arrange: Authenticate
        $this->authenticateUser();

        // Act: Try to create without name
        $response = $this->postJson('/api/v1/locations', [
            'address' => '123 Test Street',
            'city' => 'Test City',
        ]);

        // Assert: Validation error
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name']);
    }

    /**
     * Test that creating location without address returns 422.
     */
    public function test_create_location_without_address_returns_422(): void
    {
        // Arrange: Authenticate
        $this->authenticateUser();

        // Act: Try to create without address
        $response = $this->postJson('/api/v1/locations', [
            'name' => 'Test Location',
            'city' => 'Test City',
        ]);

        // Assert: Validation error
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['address']);
    }

    /**
     * Test that creating location without city returns 422.
     */
    public function test_create_location_without_city_returns_422(): void
    {
        // Arrange: Authenticate
        $this->authenticateUser();

        // Act: Try to create without city
        $response = $this->postJson('/api/v1/locations', [
            'name' => 'Test Location',
            'address' => '123 Test Street',
        ]);

        // Assert: Validation error
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['city']);
    }

    /**
     * Test that creating location with all required fields returns 201.
     */
    public function test_create_location_with_required_fields_returns_201(): void
    {
        // Arrange: Authenticate
        $this->authenticateUser();

        // Act: Create with all required fields
        $response = $this->postJson('/api/v1/locations', [
            'name' => 'Complete Location',
            'address' => 'Av. Soldati 330',
            'city' => 'San Miguel de Tucumán',
        ]);

        // Assert: Created successfully
        $response->assertStatus(201);
        $this->assertDatabaseHas('locations', [
            'name' => 'Complete Location',
            'address' => 'Av. Soldati 330',
            'city' => 'San Miguel de Tucumán',
        ]);
    }

    /**
     * Test that updating location returns 200.
     */
    public function test_update_location_returns_200(): void
    {
        // Arrange: Authenticate and create location
        $this->authenticateUser();
        $location = Location::factory()->create();

        // Act: Update with valid data
        $response = $this->putJson("/api/v1/locations/{$location->id}", [
            'name' => 'Updated Name',
            'address' => 'Updated Address',
            'city' => 'Updated City',
        ]);

        // Assert: Updated successfully
        $response->assertStatus(200);
        $this->assertDatabaseHas('locations', [
            'id' => $location->id,
            'name' => 'Updated Name',
        ]);
    }

    // ============================================================
    // TOGGLE STATUS TESTS
    // ============================================================

    /**
     * Test that active location can be toggled to inactive.
     */
    public function test_can_toggle_location_status_from_active_to_inactive(): void
    {
        // Arrange: Authenticate and create active location
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        $location = Location::factory()->create([
            'entity_id' => $organization->id,
            'is_active' => true,
        ]);

        // Act: Toggle status
        $response = $this->patchJson("/api/v1/locations/{$location->id}/toggle-status");

        // Assert: Status toggled
        $response->assertStatus(200);
        $response->assertJsonPath('data.is_active', false);
        $this->assertDatabaseHas('locations', [
            'id' => $location->id,
            'is_active' => false,
        ]);
    }

    /**
     * Test that inactive location can be toggled to active.
     */
    public function test_can_toggle_location_status_from_inactive_to_active(): void
    {
        // Arrange: Authenticate and create inactive location
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        $location = Location::factory()->create([
            'entity_id' => $organization->id,
            'is_active' => false,
        ]);

        // Act: Toggle status
        $response = $this->patchJson("/api/v1/locations/{$location->id}/toggle-status");

        // Assert: Status toggled
        $response->assertStatus(200);
        $response->assertJsonPath('data.is_active', true);
        $this->assertDatabaseHas('locations', [
            'id' => $location->id,
            'is_active' => true,
        ]);
    }

    // ============================================================
    // STATISTICS TESTS
    // ============================================================

    /**
     * Test that location statistics are returned.
     */
    public function test_can_get_location_statistics(): void
    {
        // Arrange: Authenticate and create locations
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        Location::factory()->count(3)->create([
            'entity_id' => $organization->id,
            'is_active' => true,
        ]);

        Location::factory()->count(2)->create([
            'entity_id' => $organization->id,
            'is_active' => false,
        ]);

        // Act: Get statistics
        $response = $this->getJson('/api/v1/locations/statistics');

        // Assert: Statistics returned
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'total',
                'active',
                'inactive',
            ],
        ]);
    }

    /**
     * Test that statistics returns correct counts.
     */
    public function test_statistics_returns_correct_counts(): void
    {
        // Arrange: Authenticate and create specific locations
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        Location::factory()->count(4)->create([
            'entity_id' => $organization->id,
            'is_active' => true,
        ]);

        Location::factory()->count(2)->create([
            'entity_id' => $organization->id,
            'is_active' => false,
        ]);

        // Act: Get statistics
        $response = $this->getJson('/api/v1/locations/statistics');

        // Assert: Correct counts
        $response->assertStatus(200);
        $response->assertJsonPath('data.total', 6);
        $response->assertJsonPath('data.active', 4);
        $response->assertJsonPath('data.inactive', 2);
    }
}
