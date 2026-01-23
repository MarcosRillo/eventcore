<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SuspendedUserTest extends TestCase
{
    private User $activeUser;

    private User $suspendedUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);

        $entityAdminRole = UserRole::where('role_code', 'entity_admin')->first();

        $this->activeUser = User::factory()->create([
            'password' => Hash::make('password123'),
            'status' => 'active',
            'role_id' => $entityAdminRole->id,
        ]);

        $this->suspendedUser = User::factory()->create([
            'password' => Hash::make('password123'),
            'status' => 'suspended',
            'role_id' => $entityAdminRole->id,
        ]);
    }

    // ==================== LOGIN TESTS ====================

    #[Test]
    public function test_suspended_user_cannot_login(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->suspendedUser->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'message' => 'Tu cuenta ha sido suspendida. Contacta al administrador.',
        ]);
    }

    #[Test]
    public function test_active_user_can_login(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->activeUser->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'user',
                'access_token',
                'refresh_token',
            ],
        ]);
    }

    // ==================== API ACCESS TESTS ====================

    #[Test]
    public function test_suspended_user_cannot_access_protected_routes(): void
    {
        // First, we need to create a token for the suspended user
        // (simulating a user who was suspended after logging in)
        $token = $this->suspendedUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/events');

        $response->assertStatus(403);
        $response->assertJson([
            'error' => 'Account suspended',
            'message' => 'Tu cuenta ha sido suspendida. Contacta al administrador.',
        ]);
    }

    #[Test]
    public function test_active_user_can_access_protected_routes(): void
    {
        $token = $this->activeUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/events');

        // Should return 200 (or data), not 403
        $response->assertStatus(200);
    }

    #[Test]
    public function test_suspended_user_cannot_access_dashboard(): void
    {
        $token = $this->suspendedUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/dashboard/events/summary');

        $response->assertStatus(403);
        $response->assertJson([
            'error' => 'Account suspended',
        ]);
    }

    // ==================== EDGE CASES ====================

    #[Test]
    public function test_user_suspended_after_login_is_blocked_on_next_request(): void
    {
        // User logs in while active
        $token = $this->activeUser->createToken('test-token')->plainTextToken;

        // Verify user can access routes
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/events');
        $response->assertStatus(200);

        // Suspend the user
        $this->activeUser->update(['status' => 'suspended']);

        // User should now be blocked
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/events');

        $response->assertStatus(403);
        $response->assertJson([
            'error' => 'Account suspended',
        ]);
    }

    #[Test]
    public function test_reactivated_user_can_login_again(): void
    {
        // Suspend a user
        $this->activeUser->update(['status' => 'suspended']);

        // Verify they cannot login
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->activeUser->email,
            'password' => 'password123',
        ]);
        $response->assertStatus(401);

        // Reactivate the user
        $this->activeUser->update(['status' => 'active']);

        // Now they should be able to login
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->activeUser->email,
            'password' => 'password123',
        ]);
        $response->assertStatus(200);
    }

    #[Test]
    public function test_reactivated_user_can_access_protected_routes(): void
    {
        // Suspend a user who has a token
        $token = $this->activeUser->createToken('test-token')->plainTextToken;
        $this->activeUser->update(['status' => 'suspended']);

        // Verify blocked
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/events');
        $response->assertStatus(403);

        // Reactivate
        $this->activeUser->update(['status' => 'active']);

        // Now should have access
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/events');
        $response->assertStatus(200);
    }
}
