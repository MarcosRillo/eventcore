<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use App\Features\Auth\Notifications\PasswordResetNotification;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
    }

    #[Test]
    public function test_can_request_password_reset(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        // Verify token was created
        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);

        // Verify notification was sent
        Notification::assertSentTo($user, PasswordResetNotification::class);
    }

    #[Test]
    public function test_forgot_password_returns_success_for_non_existent_email(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        // Should return success to prevent email enumeration
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        // But no notification should be sent
        Notification::assertNothingSent();
    }

    #[Test]
    public function test_forgot_password_requires_email(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function test_can_reset_password_with_valid_token(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('oldpassword'),
        ]);

        // Create a reset token
        $token = \Illuminate\Support\Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure(['data' => ['user_id']]);

        // Verify password was changed
        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword123', $user->password));

        // Verify token was deleted
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    #[Test]
    public function test_cannot_reset_password_with_invalid_token(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        // Create a reset token
        $token = \Illuminate\Support\Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'test@example.com',
            'token' => 'invalid_token_that_is_exactly_64_characters_long_abcdefgh',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function test_cannot_reset_password_with_expired_token(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        // Create an expired reset token (61 minutes ago)
        $token = \Illuminate\Support\Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now()->subMinutes(61),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function test_reset_password_requires_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'test@example.com',
            'token' => str_repeat('a', 64),
            'password' => 'newpassword123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function test_reset_password_requires_minimum_8_characters(): void
    {
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'test@example.com',
            'token' => str_repeat('a', 64),
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function test_can_validate_reset_token(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        // Create a valid reset token
        $token = \Illuminate\Support\Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/validate-reset-token', [
            'email' => 'test@example.com',
            'token' => $token,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.valid', true);
    }

    #[Test]
    public function test_validate_token_returns_false_for_invalid_token(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        // Create a valid reset token
        $token = \Illuminate\Support\Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/validate-reset-token', [
            'email' => 'test@example.com',
            'token' => 'wrong_token',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.valid', false);
    }

    #[Test]
    public function test_validate_token_returns_false_for_expired_token(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        // Create an expired reset token
        $token = \Illuminate\Support\Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now()->subMinutes(61),
        ]);

        $response = $this->postJson('/api/v1/auth/validate-reset-token', [
            'email' => 'test@example.com',
            'token' => $token,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.valid', false);
    }

    #[Test]
    public function test_resetting_password_revokes_all_tokens(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('oldpassword'),
        ]);

        // Create some API tokens for the user
        $user->createToken('device1');
        $user->createToken('device2');
        $this->assertEquals(2, $user->tokens()->count());

        // Create a reset token
        $token = \Illuminate\Support\Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        // All tokens should be revoked
        $this->assertEquals(0, $user->tokens()->count());
    }

    #[Test]
    public function test_requesting_new_reset_deletes_old_token(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'test@example.com']);

        // Request first reset
        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $firstToken = DB::table('password_reset_tokens')
            ->where('email', 'test@example.com')
            ->value('token');

        // Request second reset
        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $secondToken = DB::table('password_reset_tokens')
            ->where('email', 'test@example.com')
            ->value('token');

        // Should only have one token and it should be different
        $this->assertEquals(1, DB::table('password_reset_tokens')
            ->where('email', 'test@example.com')
            ->count());
        $this->assertNotEquals($firstToken, $secondToken);
    }

    #[Test]
    public function test_reset_password_does_not_change_user_email(): void
    {
        Notification::fake();

        $originalEmail = 'original@example.com';
        $user = User::factory()->create([
            'email' => $originalEmail,
            'password' => Hash::make('oldpassword'),
        ]);

        // Create reset token
        $token = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => $originalEmail,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $originalEmail,
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        // Email should remain unchanged
        $user->refresh();
        $this->assertEquals($originalEmail, $user->email);
        $this->assertNotNull($user->name);
        $this->assertNotNull($user->role_id);
    }

    #[Test]
    public function test_reset_password_response_structure_is_complete(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $token = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', 'Contraseña restablecida exitosamente. Puedes iniciar sesión con tu nueva contraseña.');
        $response->assertJsonPath('data.user_id', $user->id);
    }

    #[Test]
    public function test_forgot_password_response_has_correct_structure(): void
    {
        Notification::fake();

        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.');
        $response->assertJsonMissing(['error']);
    }

    #[Test]
    public function test_cannot_reset_password_without_token_record(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        // No token created - try to reset
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'test@example.com',
            'token' => Str::random(64),
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['message', 'errors' => ['email']]);
    }

    #[Test]
    public function test_token_is_hashed_in_database(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'hash-test@example.com']);

        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'hash-test@example.com',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', 'hash-test@example.com')
            ->first();

        // Token should be hashed (not plain text)
        $this->assertNotNull($record);
        $this->assertNotEquals(64, strlen($record->token)); // Hashed tokens are longer
        $this->assertGreaterThanOrEqual(60, strlen($record->token)); // Bcrypt hashes are ~60 chars
    }

    #[Test]
    public function test_old_password_no_longer_works_after_reset(): void
    {
        Notification::fake();

        $oldPassword = 'OldPassword123';
        $newPassword = 'NewPassword456';

        $user = User::factory()->create([
            'email' => 'pwd-test@example.com',
            'password' => Hash::make($oldPassword),
        ]);

        // Verify old password works initially
        $this->assertTrue(Hash::check($oldPassword, $user->password));

        // Reset password
        $token = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'pwd-test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'pwd-test@example.com',
            'token' => $token,
            'password' => $newPassword,
            'password_confirmation' => $newPassword,
        ]);

        $user->refresh();

        // Old password should NOT work
        $this->assertFalse(Hash::check($oldPassword, $user->password));
        // New password should work
        $this->assertTrue(Hash::check($newPassword, $user->password));
    }

    #[Test]
    public function test_reset_password_requires_uppercase_letter(): void
    {
        $user = User::factory()->create(['email' => 'upper@example.com']);

        $token = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'upper@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // Password without uppercase
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'upper@example.com',
            'token' => $token,
            'password' => 'lowercase123',
            'password_confirmation' => 'lowercase123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function test_reset_password_requires_lowercase_letter(): void
    {
        $user = User::factory()->create(['email' => 'lower@example.com']);

        $token = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'lower@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // Password without lowercase
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'lower@example.com',
            'token' => $token,
            'password' => 'UPPERCASE123',
            'password_confirmation' => 'UPPERCASE123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function test_reset_password_requires_number(): void
    {
        $user = User::factory()->create(['email' => 'number@example.com']);

        $token = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'number@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // Password without numbers
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'number@example.com',
            'token' => $token,
            'password' => 'NoNumbersHere',
            'password_confirmation' => 'NoNumbersHere',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function test_reset_password_with_complex_password_succeeds(): void
    {
        $user = User::factory()->create(['email' => 'complex@example.com']);

        $token = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'complex@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // Complex password with all requirements
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'complex@example.com',
            'token' => $token,
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
    }
}
