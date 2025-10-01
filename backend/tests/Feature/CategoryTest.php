<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Seed required data for tests
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationSeeder::class);
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
     * Test that we can list all categories.
     */
    public function test_can_list_categories(): void
    {
        // Arrange: Authenticate and create test data
        $this->authenticateUser();
        Category::factory()->count(3)->create();

        // Act: Make request
        $response = $this->getJson('/api/v1/categories');

        // Assert: Verify response
        $response->assertStatus(200)
                 ->assertJsonStructure(['data'])
                 ->assertJsonCount(3, 'data');
    }

    /**
     * Test that we can create a new category.
     */
    public function test_can_create_category(): void
    {
        // Arrange: Authenticate and prepare data
        $this->authenticateUser();
        $categoryData = [
            'name' => 'Test Category',
            'color' => '#FF0000',
            'is_active' => true,
        ];

        // Act: Create category
        $response = $this->postJson('/api/v1/categories', $categoryData);

        // Assert: Verify creation
        $response->assertStatus(201);
        $this->assertDatabaseHas('categories', [
            'name' => 'Test Category',
            'color' => '#FF0000',
        ]);
    }

    /**
     * Test that we can update an existing category.
     */
    public function test_can_update_category(): void
    {
        // Arrange: Authenticate and create category
        $this->authenticateUser();
        $category = Category::factory()->create(['name' => 'Original Name']);

        // Act: Update category using slug (route key name)
        $response = $this->putJson("/api/v1/categories/{$category->slug}", [
            'name' => 'Updated Name',
        ]);

        // Assert: Verify update
        $response->assertStatus(200);
        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Updated Name',
        ]);
    }

    /**
     * Test that we can delete a category.
     */
    public function test_can_delete_category(): void
    {
        // Arrange: Authenticate and create category
        $this->authenticateUser();
        $category = Category::factory()->create();

        // Act: Delete category using slug (route key name)
        $response = $this->deleteJson("/api/v1/categories/{$category->slug}");

        // Assert: Verify deletion (200 is valid for delete with response body)
        $response->assertStatus(200);
        $this->assertDatabaseMissing('categories', [
            'id' => $category->id,
        ]);
    }

    /**
     * Test that active endpoint returns only active categories.
     */
    public function test_can_get_active_categories_only(): void
    {
        // Arrange: Authenticate and create active and inactive categories
        $this->authenticateUser();
        Category::factory()->count(2)->active()->create();
        Category::factory()->inactive()->create();

        // Act: Get active categories
        $response = $this->getJson('/api/v1/categories/active');

        // Assert: Only active categories returned
        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data');
    }
}
