<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRolesSeeder::class);

        // Clear rate limiters before each test
        RateLimiter::clear('login');
    }

    #[Test]
    public function test_login_is_rate_limited(): void
    {
        // Make 5 requests (the limit)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/v1/auth/login', [
                'email' => 'test@example.com',
                'password' => 'wrongpassword',
            ]);
            // Should be 401 (unauthorized) not 429 (too many requests)
            $this->assertContains($response->status(), [401, 422]);
        }

        // 6th request should be rate limited
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(429);
    }

    #[Test]
    public function test_forgot_password_is_rate_limited(): void
    {
        // Make 5 requests (the limit)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/v1/auth/forgot-password', [
                'email' => "test{$i}@example.com",
            ]);
            $response->assertStatus(200);
        }

        // 6th request should be rate limited
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'another@example.com',
        ]);

        $response->assertStatus(429);
    }

    #[Test]
    public function test_register_request_is_rate_limited(): void
    {
        // Make 3 requests (the limit)
        for ($i = 0; $i < 3; $i++) {
            $response = $this->postJson('/api/v1/auth/register-request', [
                'dni' => "1234567{$i}",
                'first_name' => 'Test',
                'last_name' => 'User',
                'email' => "test{$i}@example.com",
                'whatsapp' => '+5493814567890',
                'organization_name' => 'Test Org',
                'organization_cuit' => "30-7123456{$i}-9",
                'organization_sector' => 'Test',
                'motivation' => 'Test motivation that is long enough to pass validation at least fifty characters.',
            ]);
            // Should be either 201 (created) or 422 (validation - duplicate email on subsequent)
            $this->assertContains($response->status(), [201, 422]);
        }

        // 4th request should be rate limited
        $response = $this->postJson('/api/v1/auth/register-request', [
            'dni' => '99999999',
            'first_name' => 'Another',
            'last_name' => 'User',
            'email' => 'another@example.com',
            'whatsapp' => '+5493814567890',
            'organization_name' => 'Another Org',
            'organization_cuit' => '30-99999999-9',
            'organization_sector' => 'Test',
            'motivation' => 'Test motivation that is long enough to pass validation at least fifty characters.',
        ]);

        $response->assertStatus(429);
    }

    #[Test]
    public function test_reset_password_is_rate_limited(): void
    {
        // Make 5 requests (the limit)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/v1/auth/reset-password', [
                'email' => 'test@example.com',
                'token' => str_repeat('a', 64),
                'password' => 'newpassword',
                'password_confirmation' => 'newpassword',
            ]);
            // Should be 422 (validation error - invalid token)
            $response->assertStatus(422);
        }

        // 6th request should be rate limited
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'test@example.com',
            'token' => str_repeat('a', 64),
            'password' => 'newpassword',
            'password_confirmation' => 'newpassword',
        ]);

        $response->assertStatus(429);
    }

    #[Test]
    public function test_rate_limit_returns_retry_after_header(): void
    {
        // Exhaust rate limit
        for ($i = 0; $i < 6; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'test@example.com',
                'password' => 'wrong',
            ]);
        }

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(429);
        $response->assertHeader('Retry-After');
    }
}
