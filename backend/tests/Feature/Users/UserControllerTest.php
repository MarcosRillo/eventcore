<?php

namespace Tests\Feature\Users;

use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    private User $entityAdmin;
    private User $entityStaff;
    private User $anotherEntityStaff;
    private Organization $entity;
    private Organization $otherEntity;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);

        $entityAdminRole = UserRole::where('role_code', 'entity_admin')->first();
        $entityStaffRole = UserRole::where('role_code', 'entity_staff')->first();

        // Create primary entity
        $this->entity = Organization::factory()->primaryEntity()->create();

        // Create another entity (for isolation tests)
        $this->otherEntity = Organization::factory()->primaryEntity()->create();

        // Create entity_admin
        $this->entityAdmin = User::factory()->create([
            'password' => Hash::make('password123'),
            'status' => 'active',
            'role_id' => $entityAdminRole->id,
        ]);
        $this->entityAdmin->organizations()->attach($this->entity->id);

        // Create entity_staff
        $this->entityStaff = User::factory()->create([
            'name' => 'Staff User',
            'email' => 'staff@entity.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'role_id' => $entityStaffRole->id,
        ]);
        $this->entityStaff->organizations()->attach($this->entity->id);

        // Create entity_staff in another entity (for isolation tests)
        $this->anotherEntityStaff = User::factory()->create([
            'name' => 'Other Staff',
            'email' => 'other@entity.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'role_id' => $entityStaffRole->id,
        ]);
        $this->anotherEntityStaff->organizations()->attach($this->otherEntity->id);
    }

    // ==================== LIST TESTS ====================

    #[Test]
    public function test_entity_admin_can_list_entity_staff_users(): void
    {
        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $this->assertTrue($response->json('success'));
        // Should only see entity_staff from own entity (1 user)
        $this->assertEquals(1, $response->json('meta.total'));
    }

    #[Test]
    public function test_entity_admin_only_sees_users_from_own_entity(): void
    {
        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/users');

        $response->assertStatus(200);

        // Should NOT see anotherEntityStaff
        $data = $response->json('data');
        $emails = array_column($data, 'email');

        $this->assertContains('staff@entity.com', $emails);
        $this->assertNotContains('other@entity.com', $emails);
    }

    #[Test]
    public function test_platform_admin_can_list_all_users(): void
    {
        $platformAdminRole = UserRole::where('role_code', 'platform_admin')->first();
        $platformAdmin = User::factory()->create([
            'status' => 'active',
            'role_id' => $platformAdminRole->id,
        ]);

        $token = $platformAdmin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/users');

        $response->assertStatus(200);

        // platform_admin should see ALL entity_staff users (2 total)
        $this->assertEquals(2, $response->json('meta.total'));
    }

    #[Test]
    public function test_search_filter_works_by_name_and_email(): void
    {
        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Search by name
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/users?search=Staff');

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, $response->json('meta.total'));

        // Search by email
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/users?search=staff@entity');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('meta.total'));
    }

    // ==================== UPDATE TESTS ====================

    #[Test]
    public function test_entity_admin_can_update_entity_staff_name_and_email(): void
    {
        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/users/{$this->entityStaff->id}", [
                'name' => 'Updated Name',
                'email' => 'updated@entity.com',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Usuario actualizado correctamente.',
            ]);

        // Verify database was updated
        $this->entityStaff->refresh();
        $this->assertEquals('Updated Name', $this->entityStaff->name);
        $this->assertEquals('updated@entity.com', $this->entityStaff->email);
    }

    #[Test]
    public function test_entity_admin_cannot_update_themselves(): void
    {
        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/users/{$this->entityAdmin->id}", [
                'name' => 'New Name',
                'email' => 'new@entity.com',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'No puedes modificar tu propio usuario desde este panel.',
            ]);
    }

    #[Test]
    public function test_entity_admin_cannot_update_other_entity_admin(): void
    {
        // Create another entity_admin in the same entity
        $entityAdminRole = UserRole::where('role_code', 'entity_admin')->first();
        $anotherAdmin = User::factory()->create([
            'status' => 'active',
            'role_id' => $entityAdminRole->id,
        ]);
        $anotherAdmin->organizations()->attach($this->entity->id);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/users/{$anotherAdmin->id}", [
                'name' => 'New Name',
                'email' => 'new@entity.com',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Solo puedes gestionar usuarios entity_staff.',
            ]);
    }

    // ==================== SUSPEND/UNSUSPEND TESTS ====================

    #[Test]
    public function test_entity_admin_can_suspend_entity_staff(): void
    {
        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson("/api/v1/users/{$this->entityStaff->id}/suspend");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Usuario suspendido correctamente.',
            ]);

        // Verify database was updated
        $this->entityStaff->refresh();
        $this->assertEquals('suspended', $this->entityStaff->status);
    }

    #[Test]
    public function test_entity_admin_can_unsuspend_entity_staff(): void
    {
        // First suspend the user
        $this->entityStaff->update(['status' => 'suspended']);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson("/api/v1/users/{$this->entityStaff->id}/unsuspend");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Usuario reactivado correctamente.',
            ]);

        // Verify database was updated
        $this->entityStaff->refresh();
        $this->assertEquals('active', $this->entityStaff->status);
    }

    // ==================== DELETE TESTS ====================

    #[Test]
    public function test_entity_admin_can_delete_entity_staff(): void
    {
        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/v1/users/{$this->entityStaff->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Usuario eliminado correctamente.',
            ]);

        // Verify soft delete
        $this->assertSoftDeleted('users', ['id' => $this->entityStaff->id]);
    }

    #[Test]
    public function test_entity_admin_cannot_delete_users_from_other_entity(): void
    {
        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/v1/users/{$this->anotherEntityStaff->id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'No tienes permisos sobre este usuario.',
            ]);

        // Verify user was NOT deleted
        $this->assertDatabaseHas('users', ['id' => $this->anotherEntityStaff->id, 'deleted_at' => null]);
    }

    // ==================== ACCESS CONTROL TESTS ====================

    #[Test]
    public function test_entity_staff_cannot_access_users_panel(): void
    {
        $token = $this->entityStaff->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/users');

        $response->assertStatus(403);
    }
}
