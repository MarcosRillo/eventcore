<?php

namespace Tests\Feature\RateLimiting;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthenticatedRateLimitingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
    }

    #[Test]
    public function test_authenticated_endpoint_has_rate_limit_headers(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertOk();
        $response->assertHeader('X-RateLimit-Limit', '120');
        $response->assertHeader('X-RateLimit-Remaining', '119');
    }

    #[Test]
    public function test_different_users_have_independent_rate_limits(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        // User A makes 5 requests
        Sanctum::actingAs($userA);
        for ($i = 0; $i < 5; $i++) {
            $this->getJson('/api/v1/auth/me');
        }

        // User B's first request should have full remaining limit
        Sanctum::actingAs($userB);
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertOk();
        $response->assertHeader('X-RateLimit-Remaining', '119');
    }

    #[Test]
    public function test_logout_has_rate_limit_headers(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertOk();
        $response->assertHeader('X-RateLimit-Limit', '120');
    }
}
