<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class LocationTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Setup the test environment.
     *
     * DatabaseTransactions will rollback changes after each test,
     * but seeded data persists across all tests in this class.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // CRITICAL FOR POSTGRESQL + DOCKER:
        // Only seed if data doesn't exist (runs once for all tests)
        if (\DB::table('user_roles')->count() === 0) {
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\UserRolesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\OrganizationStatusesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\OrganizationTypesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\OrganizationSeeder']);
        }
    }

    /**
     * Authenticate a user for testing protected endpoints.
     */
    protected function authenticateUser(): User
    {
        $user = User::factory()->create();

        // Associate user with organization (ID 1 from OrganizationSeeder)
        $user->organizations()->attach(1);

        $this->actingAs($user);
        return $user;
    }

    /**
     * Test that we can list all locations.
     */
    public function test_can_list_locations(): void
    {
        // Arrange: Authenticate
        $this->authenticateUser();

        // Act: Make request (DB already has seeded locations)
        $response = $this->getJson('/api/v1/locations');

        // Assert: Verify response structure (custom JSON response from controller)
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data'      // Array of locations
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
     * Test that we can delete a location.
     */
    public function test_can_delete_location(): void
    {
        // Arrange: Authenticate and create location
        $this->authenticateUser();
        $location = Location::factory()->create();

        // Act: Delete location
        $response = $this->deleteJson("/api/v1/locations/{$location->id}");

        // Assert: Verify deletion (200 is valid for delete with response body)
        $response->assertStatus(200);
        $this->assertDatabaseMissing('locations', [
            'id' => $location->id,
        ]);
    }

    /**
     * Test that active endpoint returns only active locations.
     */
    public function test_can_get_active_locations_only(): void
    {
        // Arrange: Authenticate
        $this->authenticateUser();

        // Act: Get active locations (DB already has seeds with active/inactive mix)
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
}
