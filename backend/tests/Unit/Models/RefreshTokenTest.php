<?php

namespace Tests\Unit\Models;

use App\Models\RefreshToken;
use App\Models\User;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * RefreshToken Model Tests
 *
 * Tests for RefreshToken model methods and scopes.
 */
class RefreshTokenTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserRolesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
    }

    private function createToken(array $attributes = []): RefreshToken
    {
        $user = User::factory()->create();

        return RefreshToken::create(array_merge([
            'user_id' => $user->id,
            'token' => 'plain_token_'.uniqid(),
            'token_hash' => hash('sha256', 'plain_token_'.uniqid()),
            'family_id' => \Illuminate\Support\Str::uuid()->toString(),
            'expires_at' => now()->addDays(30),
            'revoked_at' => null,
        ], $attributes));
    }

    // ================================================================
    // RELATIONSHIP TESTS
    // ================================================================

    #[Test]
    public function test_belongs_to_user(): void
    {
        $user = User::factory()->create(['name' => 'Token Owner']);
        $token = RefreshToken::create([
            'user_id' => $user->id,
            'token' => 'some_token',
            'token_hash' => hash('sha256', 'some_token'),
            'family_id' => \Illuminate\Support\Str::uuid()->toString(),
            'expires_at' => now()->addDays(30),
        ]);

        $this->assertInstanceOf(User::class, $token->user);
        $this->assertEquals($user->id, $token->user->id);
        $this->assertEquals('Token Owner', $token->user->name);
    }

    // ================================================================
    // isExpired() TESTS
    // ================================================================

    #[Test]
    public function test_is_expired_returns_false_for_future_token(): void
    {
        $token = $this->createToken(['expires_at' => now()->addDays(30)]);

        $this->assertFalse($token->isExpired());
    }

    #[Test]
    public function test_is_expired_returns_true_for_past_token(): void
    {
        $token = $this->createToken(['expires_at' => now()->subMinute()]);

        $this->assertTrue($token->isExpired());
    }

    // ================================================================
    // isRevoked() TESTS
    // ================================================================

    #[Test]
    public function test_is_revoked_returns_false_when_revoked_at_is_null(): void
    {
        $token = $this->createToken(['revoked_at' => null]);

        $this->assertFalse($token->isRevoked());
    }

    #[Test]
    public function test_is_revoked_returns_true_when_revoked_at_is_set(): void
    {
        $token = $this->createToken(['revoked_at' => now()->subMinute()]);

        $this->assertTrue($token->isRevoked());
    }

    // ================================================================
    // isValid() TESTS
    // ================================================================

    #[Test]
    public function test_is_valid_returns_true_for_active_non_expired_token(): void
    {
        $token = $this->createToken([
            'expires_at' => now()->addDays(30),
            'revoked_at' => null,
        ]);

        $this->assertTrue($token->isValid());
    }

    #[Test]
    public function test_is_valid_returns_false_for_expired_token(): void
    {
        $token = $this->createToken([
            'expires_at' => now()->subMinute(),
            'revoked_at' => null,
        ]);

        $this->assertFalse($token->isValid());
    }

    #[Test]
    public function test_is_valid_returns_false_for_revoked_token(): void
    {
        $token = $this->createToken([
            'expires_at' => now()->addDays(30),
            'revoked_at' => now()->subMinute(),
        ]);

        $this->assertFalse($token->isValid());
    }

    #[Test]
    public function test_is_valid_returns_false_for_expired_and_revoked_token(): void
    {
        $token = $this->createToken([
            'expires_at' => now()->subDay(),
            'revoked_at' => now()->subHour(),
        ]);

        $this->assertFalse($token->isValid());
    }

    // ================================================================
    // revoke() TESTS
    // ================================================================

    #[Test]
    public function test_revoke_sets_revoked_at(): void
    {
        $token = $this->createToken(['revoked_at' => null]);

        $this->assertNull($token->revoked_at);

        $token->revoke();
        $token->refresh();

        $this->assertNotNull($token->revoked_at);
        $this->assertTrue($token->isRevoked());
    }

    #[Test]
    public function test_revoke_persists_to_database(): void
    {
        $token = $this->createToken(['revoked_at' => null]);

        $token->revoke();

        $this->assertDatabaseMissing('refresh_tokens', [
            'id' => $token->id,
            'revoked_at' => null,
        ]);
    }

    // ================================================================
    // SCOPE TESTS
    // ================================================================

    #[Test]
    public function test_scope_active_excludes_revoked_tokens(): void
    {
        $user = User::factory()->create();
        $familyId = \Illuminate\Support\Str::uuid()->toString();

        RefreshToken::create([
            'user_id' => $user->id,
            'token' => 'active_token',
            'token_hash' => hash('sha256', 'active_token'),
            'family_id' => $familyId,
            'expires_at' => now()->addDays(30),
            'revoked_at' => null,
        ]);

        RefreshToken::create([
            'user_id' => $user->id,
            'token' => 'revoked_token',
            'token_hash' => hash('sha256', 'revoked_token'),
            'family_id' => $familyId,
            'expires_at' => now()->addDays(30),
            'revoked_at' => now()->subHour(),
        ]);

        $active = RefreshToken::active()->where('user_id', $user->id)->get();

        $this->assertCount(1, $active);
        $this->assertEquals('active_token', $active->first()->token);
    }

    #[Test]
    public function test_scope_by_family_filters_by_family_id(): void
    {
        $user = User::factory()->create();
        $familyA = \Illuminate\Support\Str::uuid()->toString();
        $familyB = \Illuminate\Support\Str::uuid()->toString();

        RefreshToken::create([
            'user_id' => $user->id,
            'token' => 'token_family_a',
            'token_hash' => hash('sha256', 'token_family_a'),
            'family_id' => $familyA,
            'expires_at' => now()->addDays(30),
        ]);

        RefreshToken::create([
            'user_id' => $user->id,
            'token' => 'token_family_b',
            'token_hash' => hash('sha256', 'token_family_b'),
            'family_id' => $familyB,
            'expires_at' => now()->addDays(30),
        ]);

        $familyATokens = RefreshToken::byFamily($familyA)->get();

        $this->assertCount(1, $familyATokens);
        $this->assertEquals($familyA, $familyATokens->first()->family_id);
    }

    #[Test]
    public function test_casts_dates_correctly(): void
    {
        $token = $this->createToken();

        $this->assertInstanceOf(\Carbon\Carbon::class, $token->expires_at);
    }

    #[Test]
    public function test_revoked_at_is_cast_to_carbon_when_set(): void
    {
        $token = $this->createToken(['revoked_at' => now()->subHour()]);

        $this->assertInstanceOf(\Carbon\Carbon::class, $token->revoked_at);
    }

    #[Test]
    public function test_revoked_at_is_null_when_not_revoked(): void
    {
        $token = $this->createToken(['revoked_at' => null]);

        $this->assertNull($token->revoked_at);
    }

    // ================================================================
    // FILLABLE TESTS
    // ================================================================

    #[Test]
    public function test_fillable_fields_are_defined(): void
    {
        $model = new RefreshToken();
        $fillable = $model->getFillable();

        $this->assertContains('user_id', $fillable);
        $this->assertContains('token', $fillable);
        $this->assertContains('token_hash', $fillable);
        $this->assertContains('family_id', $fillable);
        $this->assertContains('expires_at', $fillable);
        $this->assertContains('revoked_at', $fillable);
    }
}
