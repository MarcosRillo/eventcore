<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CategoryTest extends TestCase
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
     * Test that we can list all categories.
     */
    public function test_can_list_categories(): void
    {
        // Arrange: Authenticate
        $this->authenticateUser();

        // Act: Make request (DB already has seeded categories)
        $response = $this->getJson('/api/v1/categories');

        // Assert: Verify response structure (pagination from Laravel Resource Collection)
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data',      // Array of categories
                     'links',     // Pagination links
                     'meta'       // Pagination metadata
                 ]);

        // Assert: At least some categories exist
        $this->assertGreaterThan(0, count($response->json('data')));
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
        // Arrange: Authenticate
        $this->authenticateUser();

        // Act: Get active categories (DB already has seeds with active/inactive mix)
        $response = $this->getJson('/api/v1/categories/active');

        // Assert: Only active categories returned
        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'message', 'data']);

        // Assert: At least some active categories exist
        $this->assertGreaterThan(0, count($response->json('data')));

        // Assert: All returned categories are active
        $categories = $response->json('data');
        foreach ($categories as $category) {
            $this->assertTrue($category['is_active'] ?? false);
        }
    }
}
