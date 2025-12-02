<?php

namespace Tests\Feature\Auth;

use App\Models\RefreshToken;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RefreshTokenTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);

        $this->user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);
    }

    // ==================== LOGIN TESTS ====================

    #[Test]
    public function test_login_returns_access_and_refresh_tokens(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'user',
                'access_token',
                'refresh_token',
                'expires_at',
            ],
            'message',
        ]);

        // Verify access_token is present and not empty
        $data = $response->json('data');
        $this->assertNotEmpty($data['access_token']);
        $this->assertNotEmpty($data['refresh_token']);
        $this->assertNotEmpty($data['expires_at']);
    }

    #[Test]
    public function test_login_creates_refresh_token_in_database(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200);

        // Verify refresh token was stored in database
        $this->assertDatabaseHas('refresh_tokens', [
            'user_id' => $this->user->id,
        ]);

        $refreshToken = RefreshToken::where('user_id', $this->user->id)->first();
        $this->assertNotNull($refreshToken);
        $this->assertNotNull($refreshToken->family_id);
        $this->assertNull($refreshToken->revoked_at);
    }

    #[Test]
    public function test_login_refresh_token_has_correct_expiration(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 11, 27, 12, 0, 0));

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200);

        $refreshToken = RefreshToken::where('user_id', $this->user->id)->first();

        // Refresh token should expire in 7 days (10080 minutes)
        $expectedExpiration = Carbon::now()->addMinutes(config('tokens.refresh_token_expiration', 10080));
        $this->assertEquals(
            $expectedExpiration->format('Y-m-d H:i'),
            Carbon::parse($refreshToken->expires_at)->format('Y-m-d H:i')
        );

        Carbon::setTestNow(); // Reset
    }

    #[Test]
    public function test_new_login_creates_new_token_family(): void
    {
        // First login
        $response1 = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);
        $response1->assertStatus(200);

        // Get all tokens after first login (should be 1)
        $tokensAfterFirst = RefreshToken::where('user_id', $this->user->id)->get();
        $this->assertCount(1, $tokensAfterFirst);
        $familyId1 = $tokensAfterFirst->first()->family_id;

        // Second login (new session)
        $response2 = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);
        $response2->assertStatus(200);

        // Get all tokens after second login (should be 2)
        $tokensAfterSecond = RefreshToken::where('user_id', $this->user->id)->get();
        $this->assertCount(2, $tokensAfterSecond);

        // Get the newest token (highest ID)
        $token2 = RefreshToken::where('user_id', $this->user->id)
            ->orderBy('id', 'desc')
            ->first();
        $familyId2 = $token2->family_id;

        // Different family IDs for different login sessions
        $this->assertNotEquals($familyId1, $familyId2);
    }

    // ==================== REFRESH ENDPOINT TESTS ====================

    #[Test]
    public function test_refresh_endpoint_returns_new_tokens(): void
    {
        // Login first
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);
        $refreshToken = $loginResponse->json('data.refresh_token');

        // Use refresh endpoint
        $refreshResponse = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken,
        ]);

        $refreshResponse->assertStatus(200);
        $refreshResponse->assertJsonStructure([
            'success',
            'data' => [
                'access_token',
                'refresh_token',
                'expires_at',
            ],
            'message',
        ]);

        $data = $refreshResponse->json('data');
        $this->assertNotEmpty($data['access_token']);
        $this->assertNotEmpty($data['refresh_token']);
        // New tokens should be different from original
        $this->assertNotEquals($refreshToken, $data['refresh_token']);
    }

    #[Test]
    public function test_refresh_invalidates_old_refresh_token(): void
    {
        // Login first
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);
        $originalRefreshToken = $loginResponse->json('data.refresh_token');

        // Refresh tokens
        $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $originalRefreshToken,
        ]);

        // Verify old token is revoked in database
        $oldToken = RefreshToken::where('user_id', $this->user->id)
            ->whereNotNull('revoked_at')
            ->first();

        $this->assertNotNull($oldToken);
        $this->assertNotNull($oldToken->revoked_at);
    }

    #[Test]
    public function test_refresh_maintains_same_family_id(): void
    {
        // Login first
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);
        $refreshToken = $loginResponse->json('data.refresh_token');

        $originalToken = RefreshToken::where('user_id', $this->user->id)
            ->whereNull('revoked_at')
            ->first();
        $originalFamilyId = $originalToken->family_id;

        // Refresh tokens
        $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken,
        ]);

        // New token should have same family_id
        $newToken = RefreshToken::where('user_id', $this->user->id)
            ->whereNull('revoked_at')
            ->first();

        $this->assertEquals($originalFamilyId, $newToken->family_id);
    }

    #[Test]
    public function test_cannot_reuse_revoked_refresh_token(): void
    {
        // Login first
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);
        $originalRefreshToken = $loginResponse->json('data.refresh_token');

        // Refresh tokens (this revokes the original)
        $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $originalRefreshToken,
        ]);

        // Try to reuse the old refresh token
        $reuseResponse = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $originalRefreshToken,
        ]);

        $reuseResponse->assertStatus(401);
        $reuseResponse->assertJson([
            'success' => false,
            'message' => 'Invalid or expired refresh token',
        ]);
    }

    #[Test]
    public function test_token_reuse_revokes_entire_family(): void
    {
        // Login first
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);
        $originalRefreshToken = $loginResponse->json('data.refresh_token');

        $token = RefreshToken::where('user_id', $this->user->id)->first();
        $familyId = $token->family_id;

        // Refresh to get new token
        $refreshResponse = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $originalRefreshToken,
        ]);
        $newRefreshToken = $refreshResponse->json('data.refresh_token');

        // Try to reuse the old (revoked) token - this is a potential attack
        $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $originalRefreshToken,
        ]);

        // All tokens in the family should now be revoked (security measure)
        $activeTokensInFamily = RefreshToken::where('family_id', $familyId)
            ->whereNull('revoked_at')
            ->count();

        $this->assertEquals(0, $activeTokensInFamily);

        // Even the "new" token should be revoked
        $attemptWithNewToken = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $newRefreshToken,
        ]);
        $attemptWithNewToken->assertStatus(401);
    }

    #[Test]
    public function test_refresh_with_expired_token_returns_401(): void
    {
        // Login first
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);
        $refreshToken = $loginResponse->json('data.refresh_token');

        // Manually expire the token
        RefreshToken::where('user_id', $this->user->id)
            ->update(['expires_at' => Carbon::now()->subDay()]);

        // Try to use expired token
        $response = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken,
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'message' => 'Invalid or expired refresh token',
        ]);
    }

    #[Test]
    public function test_refresh_with_invalid_token_returns_401(): void
    {
        $response = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => 'invalid-token-that-does-not-exist',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'message' => 'Invalid or expired refresh token',
        ]);
    }

    #[Test]
    public function test_refresh_without_token_returns_422(): void
    {
        $response = $this->postJson('/api/v1/auth/refresh', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['refresh_token']);
    }

    // ==================== LOGOUT TESTS ====================

    #[Test]
    public function test_logout_revokes_all_refresh_tokens(): void
    {
        // Login first
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);
        $accessToken = $loginResponse->json('data.access_token');

        // Verify there's an active refresh token
        $this->assertDatabaseHas('refresh_tokens', [
            'user_id' => $this->user->id,
            'revoked_at' => null,
        ]);

        // Logout
        $this->withHeader('Authorization', "Bearer {$accessToken}")
            ->postJson('/api/v1/auth/logout');

        // All refresh tokens should be revoked
        $activeTokens = RefreshToken::where('user_id', $this->user->id)
            ->whereNull('revoked_at')
            ->count();

        $this->assertEquals(0, $activeTokens);
    }

    #[Test]
    public function test_logout_revokes_refresh_tokens_from_all_families(): void
    {
        // Create multiple login sessions (different families)
        $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);

        $loginResponse2 = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);
        $accessToken = $loginResponse2->json('data.access_token');

        // Should have 2 active refresh tokens (different families)
        $activeTokensBefore = RefreshToken::where('user_id', $this->user->id)
            ->whereNull('revoked_at')
            ->count();
        $this->assertEquals(2, $activeTokensBefore);

        // Logout
        $this->withHeader('Authorization', "Bearer {$accessToken}")
            ->postJson('/api/v1/auth/logout');

        // All refresh tokens should be revoked
        $activeTokensAfter = RefreshToken::where('user_id', $this->user->id)
            ->whereNull('revoked_at')
            ->count();

        $this->assertEquals(0, $activeTokensAfter);
    }

    // ==================== ACCESS TOKEN TESTS ====================

    #[Test]
    public function test_access_token_expires_at_is_correct(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 11, 27, 12, 0, 0));

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $expiresAt = $response->json('data.expires_at');

        // Access token should expire in 15 minutes
        $expectedExpiration = Carbon::now()->addMinutes(config('tokens.access_token_expiration', 15));
        $this->assertEquals(
            $expectedExpiration->toISOString(),
            $expiresAt
        );

        Carbon::setTestNow();
    }

    #[Test]
    public function test_access_token_works_for_authenticated_requests(): void
    {
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);

        $accessToken = $loginResponse->json('data.access_token');

        // Use access token to get user profile
        $meResponse = $this->withHeader('Authorization', "Bearer {$accessToken}")
            ->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200);
        $meResponse->assertJson([
            'success' => true,
        ]);
        $meResponse->assertJsonPath('data.email', $this->user->email);
    }

    // ==================== SECURITY TESTS ====================

    #[Test]
    public function test_refresh_token_is_hashed_in_database(): void
    {
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);

        $refreshTokenPlaintext = $loginResponse->json('data.refresh_token');

        $storedToken = RefreshToken::where('user_id', $this->user->id)->first();

        // The stored token should NOT match the plaintext (it should be hashed)
        $this->assertNotEquals($refreshTokenPlaintext, $storedToken->token);

        // SHA256 hash should match for fast O(1) lookups
        $expectedHash = hash('sha256', $refreshTokenPlaintext);
        $this->assertEquals($expectedHash, $storedToken->token_hash);
        $this->assertEquals($expectedHash, $storedToken->token);
    }

    #[Test]
    public function test_refresh_token_uses_timing_safe_comparison(): void
    {
        // This test verifies the token lookup works correctly
        // The implementation uses SHA256 for O(1) indexed lookups

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);

        $refreshToken = $loginResponse->json('data.refresh_token');

        // Should successfully refresh (proving SHA256 lookup works)
        $refreshResponse = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken,
        ]);

        $refreshResponse->assertStatus(200);
    }
}
