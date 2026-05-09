<?php

namespace Tests\Feature\Middleware;

use App\Http\Middleware\CheckActiveUser;
use App\Models\User;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * CheckActiveUser Middleware Tests
 *
 * Tests for CheckActiveUser middleware that blocks suspended users from accessing
 * protected routes.
 *
 * Features tested:
 * - Active users can proceed
 * - Suspended users are blocked with 403
 * - Unauthenticated requests proceed (handled by auth middleware)
 * - Real-time suspension check (database refresh)
 * - Correct JSON error structure
 *
 * Created: December 19, 2025
 */
class CheckActiveUserTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserRolesSeeder::class);
    }

    #[Test]
    public function test_allows_active_user_to_proceed(): void
    {
        // Arrange
        $user = User::factory()->create(['status' => 'active']);
        $this->actingAs($user, 'sanctum');

        $middleware = new CheckActiveUser;
        $request = Request::create('/api/v1/events', 'GET');

        $called = false;

        // Act
        $response = $middleware->handle($request, function ($req) use (&$called) {
            $called = true;

            return new Response('OK', 200);
        });

        // Assert (4 assertions)
        $this->assertTrue($called);                  // 1
        $this->assertEquals(200, $response->status()); // 2
        $this->assertFalse($user->isSuspended());     // 3
        $this->assertAuthenticatedAs($user);         // 4
    }

    #[Test]
    public function test_blocks_suspended_user(): void
    {
        // Arrange
        $user = User::factory()->create(['status' => 'suspended']);

        $middleware = new CheckActiveUser;
        $request = Request::create('/api/v1/events', 'GET');
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $called = false;

        // Act
        $response = $middleware->handle($request, function ($req) use (&$called) {
            $called = true;

            return new Response('OK', 200);
        });

        // Assert (5 assertions)
        $this->assertFalse($called);                  // 1: Next handler NOT called
        $this->assertEquals(403, $response->status()); // 2: Forbidden
        $this->assertTrue($user->isSuspended());       // 3
        $this->assertJson($response->getContent());   // 4

        $json = json_decode($response->getContent(), true);
        $this->assertEquals('Tu cuenta ha sido suspendida. Contacta al administrador.', $json['message']); // 5
    }

    #[Test]
    public function test_allows_unauthenticated_requests_to_proceed(): void
    {
        // Arrange (no authentication)
        $middleware = new CheckActiveUser;
        $request = Request::create('/api/v1/public/events', 'GET');

        $called = false;

        // Act
        $response = $middleware->handle($request, function ($req) use (&$called) {
            $called = true;

            return new Response('OK', 200);
        });

        // Assert (3 assertions)
        $this->assertTrue($called);                    // 1
        $this->assertEquals(200, $response->status()); // 2
        $this->assertGuest();                          // 3
    }

    #[Test]
    public function test_suspension_check_is_real_time(): void
    {
        // Arrange
        $user = User::factory()->create(['status' => 'active']);

        // Suspend user AFTER authentication (simulate admin action)
        $user->update(['status' => 'suspended']);

        $middleware = new CheckActiveUser;
        $request = Request::create('/api/v1/events', 'GET');
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $called = false;

        // Act
        $response = $middleware->handle($request, function ($req) use (&$called) {
            $called = true;

            return new Response('OK', 200);
        });

        // Assert (5 assertions)
        $this->assertFalse($called);                   // 1: Blocked
        $this->assertEquals(403, $response->status()); // 2
        $this->assertTrue($user->fresh()->isSuspended()); // 3: Verify DB state
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => 'suspended',
        ]); // 4
        $this->assertEquals('Tu cuenta ha sido suspendida. Contacta al administrador.',
            json_decode($response->getContent(), true)['message']); // 5
    }

    #[Test]
    public function test_returns_correct_json_structure_for_suspended_user(): void
    {
        // Arrange
        $user = User::factory()->create(['status' => 'suspended']);

        $middleware = new CheckActiveUser;
        $request = Request::create('/api/v1/events', 'GET');
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        // Act
        $response = $middleware->handle($request, function ($req) {
            return new Response('OK', 200);
        });

        // Assert (6 assertions)
        $this->assertEquals(403, $response->status());               // 1
        $this->assertEquals('application/json', $response->headers->get('Content-Type')); // 2

        $json = json_decode($response->getContent(), true);
        $this->assertIsArray($json);                                 // 3
        $this->assertArrayHasKey('error', $json);                    // 4
        $this->assertArrayHasKey('message', $json);                  // 5
        $this->assertEquals('Account suspended', $json['error']);    // 6
    }
}
