<?php

namespace Tests\Feature\Auth;

use App\Features\Auth\Notifications\InvitationNotification;
use App\Models\Invitation;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class InvitationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
    }

    private function createUserWithRole(string $roleCode): User
    {
        $role = UserRole::where('role_code', $roleCode)->first();
        $user = User::factory()->create(['role_id' => $role->id]);
        $organization = Organization::factory()->create();
        $user->organizations()->attach($organization->id);

        return $user;
    }

    private function getRoleId(string $roleCode): int
    {
        return UserRole::where('role_code', $roleCode)->value('id');
    }

    /**
     * Create an invitation with proper selector + hashed token.
     * Returns [invitation, plainToken] for testing.
     */
    private function createInvitationWithToken(array $attributes): array
    {
        $selector = Str::random(32);
        $validator = Str::random(32);
        $plainToken = $selector.$validator;

        $invitation = Invitation::create(array_merge([
            'selector' => $selector,
            'token' => Hash::make($validator),
        ], $attributes));

        return [$invitation, $plainToken];
    }

    #[Test]
    public function test_platform_admin_can_send_invitation_to_entity_admin(): void
    {
        Notification::fake();

        $platformAdmin = $this->createUserWithRole('platform_admin');
        $this->actingAs($platformAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/invitations', [
            'email' => 'newadmin@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure(['data' => ['id', 'email', 'role', 'expires_at']]);

        $this->assertDatabaseHas('invitations', [
            'email' => 'newadmin@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
        ]);

        Notification::assertSentTo(
            Invitation::where('email', 'newadmin@example.com')->first(),
            InvitationNotification::class,
        );
    }

    #[Test]
    public function test_entity_admin_can_send_invitation_to_entity_staff(): void
    {
        Notification::fake();

        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/invitations', [
            'email' => 'newstaff@example.com',
            'role_id' => $this->getRoleId('entity_staff'),
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseHas('invitations', [
            'email' => 'newstaff@example.com',
            'role_id' => $this->getRoleId('entity_staff'),
        ]);
    }

    #[Test]
    public function test_entity_admin_can_send_invitation_to_organizer(): void
    {
        Notification::fake();

        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/invitations', [
            'email' => 'neworganizer@example.com',
            'role_id' => $this->getRoleId('organizer_admin'),
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseHas('invitations', [
            'email' => 'neworganizer@example.com',
            'role_id' => $this->getRoleId('organizer_admin'),
        ]);
    }

    #[Test]
    public function test_entity_admin_cannot_invite_platform_admin(): void
    {
        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/invitations', [
            'email' => 'newplatform@example.com',
            'role_id' => $this->getRoleId('platform_admin'),
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);

        $this->assertDatabaseMissing('invitations', [
            'email' => 'newplatform@example.com',
        ]);
    }

    #[Test]
    public function test_invitation_requires_valid_email(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        $this->actingAs($platformAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/invitations', [
            'email' => 'invalid-email',
            'role_id' => $this->getRoleId('entity_admin'),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function test_cannot_invite_existing_user_email(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);
        $this->actingAs($platformAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/invitations', [
            'email' => 'existing@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function test_can_validate_invitation_token(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'test@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        $response = $this->getJson("/api/v1/auth/invitations/validate/{$plainToken}");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.email', 'test@example.com');
        $response->assertJsonStructure(['data' => ['email', 'role', 'invited_by', 'expires_at']]);
    }

    #[Test]
    public function test_cannot_validate_expired_token(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'test@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->subHours(1),
        ]);

        $response = $this->getJson("/api/v1/auth/invitations/validate/{$plainToken}");

        $response->assertStatus(404);
        $response->assertJsonPath('success', false);
    }

    #[Test]
    public function test_can_accept_valid_invitation(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'newuser@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        $response = $this->postJson('/api/v1/auth/invitations/accept', [
            'token' => $plainToken,
            'name' => 'New User',
            'dni' => '12345678',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure(['data' => ['user' => ['id', 'name', 'email', 'role'], 'access_token', 'refresh_token', 'expires_at']]);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'name' => 'New User',
            'role_id' => $this->getRoleId('entity_admin'),
        ]);

        $invitation->refresh();
        $this->assertNotNull($invitation->accepted_at);
    }

    #[Test]
    public function test_cannot_accept_expired_invitation(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'expired@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->subHours(1),
        ]);

        $response = $this->postJson('/api/v1/auth/invitations/accept', [
            'token' => $plainToken,
            'name' => 'Expired User',
            'dni' => '12345678',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(422);

        $this->assertDatabaseMissing('users', [
            'email' => 'expired@example.com',
        ]);
    }

    #[Test]
    public function test_cannot_accept_already_used_invitation(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'used@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
            'accepted_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/invitations/accept', [
            'token' => $plainToken,
            'name' => 'Duplicate User',
            'dni' => '12345678',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(422);

        $this->assertDatabaseMissing('users', [
            'email' => 'used@example.com',
        ]);
    }

    #[Test]
    public function test_can_cancel_pending_invitation(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        $this->actingAs($platformAdmin, 'sanctum');

        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'tocancel@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        $response = $this->deleteJson("/api/v1/invitations/{$invitation->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseMissing('invitations', ['id' => $invitation->id]);
    }

    #[Test]
    public function test_unauthenticated_cannot_send_invitation(): void
    {
        $response = $this->postJson('/api/v1/invitations', [
            'email' => 'test@example.com',
            'role_id' => 1,
        ]);

        $response->assertStatus(401);
    }

    #[Test]
    public function test_can_list_pending_invitations(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        $this->actingAs($platformAdmin, 'sanctum');

        $this->createInvitationWithToken([
            'email' => 'pending1@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        $this->createInvitationWithToken([
            'email' => 'pending2@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        $response = $this->getJson('/api/v1/invitations');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertCount(2, $response->json('data'));
    }

    #[Test]
    public function test_new_user_inherits_organization_from_inviter(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        $orgId = $platformAdmin->organizations()->first()->id;

        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'inheritor@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        $response = $this->postJson('/api/v1/auth/invitations/accept', [
            'token' => $plainToken,
            'name' => 'Inheritor User',
            'dni' => '87654321',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(201);

        $newUser = User::where('email', 'inheritor@example.com')->first();
        $this->assertTrue($newUser->organizations->contains($orgId));
    }

    #[Test]
    public function test_token_validation_fails_with_wrong_validator(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'test@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        // Use correct selector but wrong validator
        $selector = substr($plainToken, 0, 32);
        $wrongToken = $selector.Str::random(32);

        $response = $this->getJson("/api/v1/auth/invitations/validate/{$wrongToken}");

        $response->assertStatus(404);
        $response->assertJsonPath('success', false);
    }

    #[Test]
    public function test_token_validation_fails_with_wrong_length(): void
    {
        $response = $this->getJson('/api/v1/auth/invitations/validate/short_token');

        $response->assertStatus(404);
        $response->assertJsonPath('success', false);
    }

    #[Test]
    public function test_accept_invitation_requires_complex_password(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'complexity@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        // Test: password without uppercase
        $response = $this->postJson('/api/v1/auth/invitations/accept', [
            'token' => $plainToken,
            'name' => 'Test User',
            'dni' => '12345678',
            'password' => 'lowercase123',
            'password_confirmation' => 'lowercase123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function test_accept_invitation_requires_password_with_numbers(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'numbers@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        // Test: password without numbers
        $response = $this->postJson('/api/v1/auth/invitations/accept', [
            'token' => $plainToken,
            'name' => 'Test User',
            'dni' => '12345678',
            'password' => 'NoNumbersHere',
            'password_confirmation' => 'NoNumbersHere',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function test_accept_invitation_with_complex_password_succeeds(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'strong@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        // Complex password: uppercase, lowercase, numbers
        $response = $this->postJson('/api/v1/auth/invitations/accept', [
            'token' => $plainToken,
            'name' => 'Strong User',
            'dni' => '87654321',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
    }

    // ==================== RESEND INVITATION TESTS ====================

    #[Test]
    public function test_can_resend_pending_invitation(): void
    {
        Notification::fake();

        $platformAdmin = $this->createUserWithRole('platform_admin');
        $this->actingAs($platformAdmin, 'sanctum');

        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'resend@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        $response = $this->postJson("/api/v1/invitations/{$invitation->id}/resend");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure(['data' => ['id', 'email', 'expires_at']]);

        // Verify notification was sent
        Notification::assertSentTo(
            $invitation->fresh(),
            InvitationNotification::class,
        );
    }

    #[Test]
    public function test_resend_generates_new_token(): void
    {
        Notification::fake();

        $platformAdmin = $this->createUserWithRole('platform_admin');
        $this->actingAs($platformAdmin, 'sanctum');

        [$invitation, $oldPlainToken] = $this->createInvitationWithToken([
            'email' => 'newtoken@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        $oldSelector = $invitation->selector;
        $oldTokenHash = $invitation->token;

        $response = $this->postJson("/api/v1/invitations/{$invitation->id}/resend");

        $response->assertStatus(200);

        $invitation->refresh();

        // Selector should be different (new token)
        $this->assertNotEquals($oldSelector, $invitation->selector);
        // Token hash should be different
        $this->assertNotEquals($oldTokenHash, $invitation->token);
    }

    #[Test]
    public function test_resend_extends_expiration(): void
    {
        Notification::fake();

        $platformAdmin = $this->createUserWithRole('platform_admin');
        $this->actingAs($platformAdmin, 'sanctum');

        // Create invitation that expires in 1 hour
        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'extend@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHour(),
        ]);

        $oldExpiresAt = $invitation->expires_at;

        $response = $this->postJson("/api/v1/invitations/{$invitation->id}/resend");

        $response->assertStatus(200);

        $invitation->refresh();

        // New expiration should be ~24 hours from now (more than the old 1 hour)
        $this->assertTrue($invitation->expires_at->gt($oldExpiresAt));
        $this->assertTrue($invitation->expires_at->gt(now()->addHours(23)));
    }

    #[Test]
    public function test_cannot_resend_accepted_invitation(): void
    {
        $platformAdmin = $this->createUserWithRole('platform_admin');
        $this->actingAs($platformAdmin, 'sanctum');

        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'accepted@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
            'accepted_at' => now(), // Already accepted
        ]);

        $response = $this->postJson("/api/v1/invitations/{$invitation->id}/resend");

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    #[Test]
    public function test_cannot_resend_others_invitation(): void
    {
        Notification::fake();

        $platformAdmin = $this->createUserWithRole('platform_admin');
        $entityAdmin = $this->createUserWithRole('entity_admin');

        // Invitation created by platform_admin
        [$invitation, $plainToken] = $this->createInvitationWithToken([
            'email' => 'others@example.com',
            'role_id' => $this->getRoleId('entity_staff'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        // Entity admin (not the inviter) tries to resend
        $this->actingAs($entityAdmin, 'sanctum');

        $response = $this->postJson("/api/v1/invitations/{$invitation->id}/resend");

        $response->assertStatus(403);
        $response->assertJsonPath('success', false);
    }

    #[Test]
    public function test_resend_invalidates_old_token(): void
    {
        Notification::fake();

        $platformAdmin = $this->createUserWithRole('platform_admin');
        $this->actingAs($platformAdmin, 'sanctum');

        [$invitation, $oldPlainToken] = $this->createInvitationWithToken([
            'email' => 'invalidate@example.com',
            'role_id' => $this->getRoleId('entity_admin'),
            'invited_by' => $platformAdmin->id,
            'expires_at' => now()->addHours(24),
        ]);

        // Resend invitation (generates new token)
        $response = $this->postJson("/api/v1/invitations/{$invitation->id}/resend");
        $response->assertStatus(200);

        // Try to validate with old token - should fail
        $validateResponse = $this->getJson("/api/v1/auth/invitations/validate/{$oldPlainToken}");

        $validateResponse->assertStatus(404);
        $validateResponse->assertJsonPath('success', false);
    }
}
