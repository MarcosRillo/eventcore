<?php

namespace Tests\Feature\Auth;

use App\Features\Auth\Notifications\InvitationNotification;
use App\Features\Auth\Notifications\PasswordResetNotification;
use App\Features\Auth\Notifications\RegistrationApprovedNotification;
use App\Features\Auth\Notifications\RegistrationRejectedNotification;
use App\Features\Auth\Notifications\RegistrationRequestReceivedNotification;
use App\Models\Invitation;
use App\Models\Organization;
use App\Models\RegistrationRequest;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Tests for Auth Notification classes:
 * - InvitationNotification
 * - PasswordResetNotification
 * - RegistrationApprovedNotification
 * - RegistrationRejectedNotification
 * - RegistrationRequestReceivedNotification
 *
 * Tests cover: via() channel, toMail() content, toArray() data, and
 * integration via the API endpoints that trigger notifications.
 */
class NotificationsTest extends TestCase
{
    use RefreshDatabase;

    private function getValidRequestData(array $overrides = []): array
    {
        return array_merge([
            'dni' => '12345678',
            'first_name' => 'Juan',
            'last_name' => 'Perez',
            'email' => 'test@example.com',
            'whatsapp' => '+5493814567890',
            'organization_name' => 'Test Organization',
            'organization_cuit' => '30-71234567-9',
            'organization_sector' => 'Tecnologia',
            'motivation' => 'Queremos publicar nuestros eventos en la plataforma para llegar a mas turistas.',
            'status' => 'pending',
        ], $overrides);
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
    }

    // ===== InvitationNotification =====

    public function test_invitation_notification_via_mail_channel(): void
    {
        $role = UserRole::where('role_code', 'entity_admin')->first();
        $inviter = User::factory()->create(['role_id' => $role->id]);

        $invitation = Invitation::create([
            'email' => 'invited@example.com',
            'selector' => 'testselector',
            'token' => 'hashedtoken',
            'role_id' => $role->id,
            'invited_by' => $inviter->id,
            'expires_at' => now()->addDay(),
        ]);

        $notification = new InvitationNotification('testselector.validatorpart');

        $this->assertEquals(['mail'], $notification->via($invitation));
    }

    public function test_invitation_notification_to_mail_contains_accept_url(): void
    {
        $role = UserRole::where('role_code', 'entity_admin')->first();
        $inviter = User::factory()->create(['role_id' => $role->id]);

        $invitation = Invitation::create([
            'email' => 'invited@example.com',
            'selector' => 'testselector',
            'token' => 'hashedtoken',
            'role_id' => $role->id,
            'invited_by' => $inviter->id,
            'expires_at' => now()->addDay(),
        ]);

        $plainToken = 'testselector.validatorpart';
        $notification = new InvitationNotification($plainToken);
        $mail = $notification->toMail($invitation);

        $this->assertInstanceOf(MailMessage::class, $mail);
        $this->assertStringContainsString($plainToken, $mail->actionUrl);
        $this->assertStringContainsString('accept-invitation', $mail->actionUrl);
    }

    public function test_invitation_notification_to_array_contains_invitation_data(): void
    {
        $role = UserRole::where('role_code', 'entity_admin')->first();
        $inviter = User::factory()->create(['role_id' => $role->id]);

        $invitation = Invitation::create([
            'email' => 'invited@example.com',
            'selector' => 'testselector',
            'token' => 'hashedtoken',
            'role_id' => $role->id,
            'invited_by' => $inviter->id,
            'expires_at' => now()->addDay(),
        ]);

        $notification = new InvitationNotification('mytoken');
        $array = $notification->toArray($invitation);

        $this->assertArrayHasKey('invitation_id', $array);
        $this->assertArrayHasKey('email', $array);
        $this->assertArrayHasKey('role', $array);
        $this->assertArrayHasKey('invited_by', $array);
        $this->assertArrayHasKey('expires_at', $array);
        $this->assertEquals('invited@example.com', $array['email']);
        $this->assertEquals($inviter->name, $array['invited_by']);
    }

    public function test_invitation_notification_sent_via_api(): void
    {
        Notification::fake();

        $role = UserRole::where('role_code', 'entity_admin')->first();
        $admin = User::factory()->create(['role_id' => $role->id]);
        $org = Organization::factory()->create();
        $admin->organizations()->attach($org->id);

        $this->actingAs($admin, 'sanctum');

        $inviteeRole = UserRole::where('role_code', 'entity_staff')->first();

        $response = $this->postJson('/api/v1/invitations', [
            'email' => 'newinvitee@example.com',
            'role_id' => $inviteeRole->id,
        ]);

        $response->assertStatus(201);

        Notification::assertSentTo(
            Invitation::where('email', 'newinvitee@example.com')->first(),
            InvitationNotification::class,
        );
    }

    // ===== PasswordResetNotification =====

    public function test_password_reset_notification_via_mail_channel(): void
    {
        $user = User::factory()->create();
        $notification = new PasswordResetNotification('reset-token-123');

        $this->assertEquals(['mail'], $notification->via($user));
    }

    public function test_password_reset_notification_to_mail_contains_reset_url(): void
    {
        $user = User::factory()->create(['email' => 'user@example.com']);
        $token = 'reset-token-xyz';
        $notification = new PasswordResetNotification($token);
        $mail = $notification->toMail($user);

        $this->assertInstanceOf(MailMessage::class, $mail);
        $this->assertStringContainsString('reset-password', $mail->actionUrl);
        $this->assertStringContainsString($token, $mail->actionUrl);
        $this->assertStringContainsString(urlencode($user->email), $mail->actionUrl);
    }

    public function test_password_reset_notification_to_array_contains_token(): void
    {
        $user = User::factory()->create();
        $token = 'test-token';
        $notification = new PasswordResetNotification($token);
        $array = $notification->toArray($user);

        $this->assertArrayHasKey('token', $array);
        $this->assertEquals($token, $array['token']);
    }

    public function test_password_reset_notification_sent_via_api(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'forgot@example.com']);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'forgot@example.com',
        ]);

        // API returns 200 regardless of email existence (security)
        $response->assertStatus(200);

        Notification::assertSentTo($user, PasswordResetNotification::class);
    }

    // ===== RegistrationRequestReceivedNotification =====

    public function test_registration_request_received_notification_via_mail(): void
    {
        $request = RegistrationRequest::create($this->getValidRequestData());
        $notification = new RegistrationRequestReceivedNotification($request);

        $this->assertEquals(['mail'], $notification->via($request));
    }

    public function test_registration_request_received_notification_to_mail_content(): void
    {
        $request = RegistrationRequest::create($this->getValidRequestData([
            'organization_name' => 'Mi Organizacion Test',
        ]));
        $notification = new RegistrationRequestReceivedNotification($request);
        $mail = $notification->toMail($request);

        $this->assertInstanceOf(MailMessage::class, $mail);
        // Check organization name appears in the mail lines
        $lineContent = implode(' ', array_map(fn ($l) => is_string($l) ? $l : '', $mail->introLines));
        $this->assertStringContainsString('Mi Organizacion Test', $lineContent);
    }

    public function test_registration_request_received_notification_to_array(): void
    {
        $request = RegistrationRequest::create($this->getValidRequestData([
            'organization_name' => 'Array Test Org',
        ]));
        $notification = new RegistrationRequestReceivedNotification($request);
        $array = $notification->toArray($request);

        $this->assertArrayHasKey('request_id', $array);
        $this->assertArrayHasKey('email', $array);
        $this->assertArrayHasKey('organization_name', $array);
        $this->assertEquals($request->id, $array['request_id']);
        $this->assertEquals('test@example.com', $array['email']);
        $this->assertEquals('Array Test Org', $array['organization_name']);
    }

    public function test_registration_request_received_notification_sent_on_submission(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/register-request', [
            'dni' => '87654321',
            'first_name' => 'Maria',
            'last_name' => 'Garcia',
            'email' => 'maria@example.com',
            'whatsapp' => '+5493814567890',
            'organization_name' => 'Organizacion Maria',
            'organization_cuit' => '30-71234569-1',
            'organization_sector' => 'Turismo',
            'motivation' => 'Queremos publicar nuestros eventos en la plataforma para llegar a mas turistas y atraer visitantes.',
        ]);

        $response->assertStatus(201);

        Notification::assertSentTo(
            RegistrationRequest::where('email', 'maria@example.com')->first(),
            RegistrationRequestReceivedNotification::class,
        );
    }

    // ===== RegistrationApprovedNotification =====

    public function test_registration_approved_notification_via_mail(): void
    {
        $request = RegistrationRequest::create($this->getValidRequestData());
        $user = User::factory()->create();
        $notification = new RegistrationApprovedNotification($request, $user, 'reset-token');

        $this->assertEquals(['mail'], $notification->via($user));
    }

    public function test_registration_approved_notification_to_mail_contains_reset_link(): void
    {
        $request = RegistrationRequest::create($this->getValidRequestData([
            'first_name' => 'Carlos',
        ]));
        $user = User::factory()->create(['email' => 'carlos@example.com']);
        $resetToken = 'my-reset-token';
        $notification = new RegistrationApprovedNotification($request, $user, $resetToken);
        $mail = $notification->toMail($user);

        $this->assertInstanceOf(MailMessage::class, $mail);
        $this->assertStringContainsString('reset-password', $mail->actionUrl);
        $this->assertStringContainsString($resetToken, $mail->actionUrl);
    }

    public function test_registration_approved_notification_to_array(): void
    {
        $request = RegistrationRequest::create($this->getValidRequestData());
        $user = User::factory()->create(['email' => 'approved@example.com']);
        $notification = new RegistrationApprovedNotification($request, $user, 'token');
        $array = $notification->toArray($user);

        $this->assertArrayHasKey('request_id', $array);
        $this->assertArrayHasKey('user_id', $array);
        $this->assertArrayHasKey('email', $array);
        $this->assertEquals($request->id, $array['request_id']);
        $this->assertEquals($user->id, $array['user_id']);
        $this->assertEquals($user->email, $array['email']);
    }

    public function test_registration_approved_notification_sent_on_approval(): void
    {
        Notification::fake();

        $role = UserRole::where('role_code', 'entity_admin')->first();
        $admin = User::factory()->create(['role_id' => $role->id]);
        $org = Organization::factory()->create();
        $admin->organizations()->attach($org->id);
        $this->actingAs($admin, 'sanctum');

        $request = RegistrationRequest::create($this->getValidRequestData([
            'email' => 'approval-test@example.com',
        ]));

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/approve");

        $response->assertStatus(200);

        Notification::assertSentTo($request, RegistrationApprovedNotification::class);
    }

    // ===== RegistrationRejectedNotification =====

    public function test_registration_rejected_notification_via_mail(): void
    {
        $request = RegistrationRequest::create($this->getValidRequestData());
        $notification = new RegistrationRejectedNotification($request);

        $this->assertEquals(['mail'], $notification->via($request));
    }

    public function test_registration_rejected_notification_to_mail_contains_reason(): void
    {
        $request = RegistrationRequest::create($this->getValidRequestData([
            'rejection_reason' => 'La informacion no es suficiente',
        ]));
        $notification = new RegistrationRejectedNotification($request);
        $mail = $notification->toMail($request);

        $this->assertInstanceOf(MailMessage::class, $mail);
        // Verify it's a MailMessage with intro lines
        $this->assertNotEmpty($mail->introLines);
    }

    public function test_registration_rejected_notification_to_array(): void
    {
        $request = RegistrationRequest::create($this->getValidRequestData([
            'rejection_reason' => 'Datos incompletos',
        ]));
        $notification = new RegistrationRejectedNotification($request);
        $array = $notification->toArray($request);

        $this->assertArrayHasKey('request_id', $array);
        $this->assertArrayHasKey('email', $array);
        $this->assertArrayHasKey('rejection_reason', $array);
        $this->assertEquals($request->id, $array['request_id']);
        $this->assertEquals('test@example.com', $array['email']);
        $this->assertEquals('Datos incompletos', $array['rejection_reason']);
    }

    public function test_registration_rejected_notification_sent_on_rejection(): void
    {
        Notification::fake();

        $role = UserRole::where('role_code', 'entity_admin')->first();
        $admin = User::factory()->create(['role_id' => $role->id]);
        $org = Organization::factory()->create();
        $admin->organizations()->attach($org->id);
        $this->actingAs($admin, 'sanctum');

        $request = RegistrationRequest::create($this->getValidRequestData([
            'email' => 'rejected-test@example.com',
        ]));

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/reject", [
            'reason' => 'La informacion proporcionada es insuficiente para verificar la organizacion.',
        ]);

        $response->assertStatus(200);

        Notification::assertSentTo($request, RegistrationRejectedNotification::class);
    }
}
