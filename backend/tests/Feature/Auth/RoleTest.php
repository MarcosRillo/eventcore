<?php

namespace Tests\Feature\Auth;

use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RoleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserRolesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
    }

    private function createUserWithRole(string $roleCode): User
    {
        $role = UserRole::where('role_code', $roleCode)->first();
        $user = User::factory()->create(['role_id' => $role->id]);
        $organization = Organization::factory()->create();
        $user->organizations()->attach($organization->id);

        return $user;
    }

    #[Test]
    public function test_platform_admin_sees_all_roles(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        $this->actingAs($platformAdmin, 'sanctum');

        $response = $this->getJson('/api/v1/roles/assignable');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $roles = $response->json('data');
        $roleCodes = array_column($roles, 'role_code');

        // Platform admin should see all roles
        $this->assertContains('platform_admin', $roleCodes);
        $this->assertContains('entity_admin', $roleCodes);
        $this->assertContains('entity_staff', $roleCodes);
    }

    #[Test]
    public function test_entity_admin_sees_assignable_roles(): void
    {
        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $response = $this->getJson('/api/v1/roles/assignable');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $roles = $response->json('data');
        $roleCodes = array_column($roles, 'role_code');

        // Entity admin should see entity_staff and organizer_admin
        $this->assertCount(2, $roles);
        $this->assertContains('entity_staff', $roleCodes);
        $this->assertContains('organizer_admin', $roleCodes);
        $this->assertNotContains('platform_admin', $roleCodes);
        $this->assertNotContains('entity_admin', $roleCodes);
    }

    #[Test]
    public function test_unauthenticated_cannot_list_roles(): void
    {
        $response = $this->getJson('/api/v1/roles/assignable');

        $response->assertStatus(401);
    }

    #[Test]
    public function test_roles_returns_correct_structure(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        $this->actingAs($platformAdmin, 'sanctum');

        $response = $this->getJson('/api/v1/roles/assignable');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'role_code',
                    'role_name',
                ],
            ],
        ]);
    }
}
