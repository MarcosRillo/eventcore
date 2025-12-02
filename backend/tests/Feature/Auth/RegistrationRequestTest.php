<?php

namespace Tests\Feature\Auth;

use App\Models\RegistrationRequest;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use App\Features\Auth\Notifications\RegistrationRequestReceivedNotification;
use App\Features\Auth\Notifications\RegistrationApprovedNotification;
use App\Features\Auth\Notifications\RegistrationRejectedNotification;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RegistrationRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
        Storage::fake('public');
    }

    private function createUserWithRole(string $roleCode): User
    {
        $role = UserRole::where('role_code', $roleCode)->first();
        $user = User::factory()->create(['role_id' => $role->id]);
        $organization = Organization::factory()->create();
        $user->organizations()->attach($organization->id);
        return $user;
    }

    private function getValidRequestData(): array
    {
        return [
            'dni' => '12345678',
            'first_name' => 'Juan',
            'last_name' => 'Pérez',
            'email' => 'organizer@example.com',
            'whatsapp' => '+5493814567890',
            'organization_name' => 'La Rural Tucumán',
            'organization_cuit' => '30-71234567-9',
            'organization_sector' => 'Eventos y Exposiciones',
            'motivation' => 'Queremos publicar nuestros eventos en la plataforma para llegar a más turistas y promocionar nuestras actividades culturales.',
        ];
    }

    #[Test]
    public function test_can_submit_registration_request(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/register-request', $this->getValidRequestData());

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure(['data' => ['id', 'email', 'status']]);

        $this->assertDatabaseHas('registration_requests', [
            'email' => 'organizer@example.com',
            'organization_name' => 'La Rural Tucumán',
            'status' => 'pending',
        ]);

        Notification::assertSentTo(
            RegistrationRequest::where('email', 'organizer@example.com')->first(),
            RegistrationRequestReceivedNotification::class
        );
    }

    #[Test]
    public function test_request_requires_all_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/register-request', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'dni', 'first_name', 'last_name', 'email',
            'whatsapp', 'organization_name', 'organization_cuit', 'organization_sector', 'motivation'
        ]);
    }

    #[Test]
    public function test_motivation_must_be_at_least_50_characters(): void
    {
        $data = $this->getValidRequestData();
        $data['motivation'] = 'Too short';

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['motivation']);
    }

    #[Test]
    public function test_cannot_submit_with_existing_user_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $data = $this->getValidRequestData();
        $data['email'] = 'existing@example.com';

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function test_cannot_submit_with_pending_request_email(): void
    {
        RegistrationRequest::create(array_merge($this->getValidRequestData(), [
            'status' => 'pending',
        ]));

        $response = $this->postJson('/api/v1/auth/register-request', $this->getValidRequestData());

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function test_entity_admin_can_view_pending_requests(): void
    {
        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        RegistrationRequest::create(array_merge($this->getValidRequestData(), ['status' => 'pending']));

        $response = $this->getJson('/api/v1/registration-requests');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertCount(1, $response->json('data'));
    }

    #[Test]
    public function test_entity_admin_can_approve_request(): void
    {
        Notification::fake();

        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $request = RegistrationRequest::create(array_merge($this->getValidRequestData(), ['status' => 'pending']));

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/approve");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure(['data' => ['user_id', 'organization_id']]);

        // Verify user was created
        $this->assertDatabaseHas('users', [
            'email' => 'organizer@example.com',
        ]);

        // Verify organization was created
        $this->assertDatabaseHas('organizations', [
            'name' => 'La Rural Tucumán',
        ]);

        // Verify request status updated
        $request->refresh();
        $this->assertEquals('approved', $request->status);
        $this->assertEquals($entityAdmin->id, $request->reviewed_by);

        Notification::assertSentTo($request, RegistrationApprovedNotification::class);
    }

    #[Test]
    public function test_approving_creates_user_with_organizer_admin_role(): void
    {
        Notification::fake();

        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $request = RegistrationRequest::create(array_merge($this->getValidRequestData(), ['status' => 'pending']));

        $this->postJson("/api/v1/registration-requests/{$request->id}/approve");

        $user = User::where('email', 'organizer@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('organizer_admin', $user->role->role_code);
    }

    #[Test]
    public function test_entity_admin_can_reject_request(): void
    {
        Notification::fake();

        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $request = RegistrationRequest::create(array_merge($this->getValidRequestData(), ['status' => 'pending']));

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/reject", [
            'reason' => 'La información proporcionada es insuficiente para verificar la organización.',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $request->refresh();
        $this->assertEquals('rejected', $request->status);
        $this->assertNotNull($request->rejection_reason);

        Notification::assertSentTo($request, RegistrationRejectedNotification::class);
    }

    #[Test]
    public function test_rejection_requires_reason(): void
    {
        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $request = RegistrationRequest::create(array_merge($this->getValidRequestData(), ['status' => 'pending']));

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/reject", []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['reason']);
    }

    #[Test]
    public function test_cannot_approve_already_processed_request(): void
    {
        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $request = RegistrationRequest::create(array_merge($this->getValidRequestData(), [
            'status' => 'approved',
            'reviewed_by' => $entityAdmin->id,
            'reviewed_at' => now(),
        ]));

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/approve");

        $response->assertStatus(422);
    }

    #[Test]
    public function test_unauthenticated_cannot_view_requests(): void
    {
        $response = $this->getJson('/api/v1/registration-requests');

        $response->assertStatus(401);
    }

    #[Test]
    public function test_new_organizer_is_associated_with_new_organization(): void
    {
        Notification::fake();

        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $request = RegistrationRequest::create(array_merge($this->getValidRequestData(), ['status' => 'pending']));

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/approve");

        $userId = $response->json('data.user_id');
        $orgId = $response->json('data.organization_id');

        $user = User::find($userId);
        $this->assertTrue($user->organizations->contains($orgId));
    }

    #[Test]
    public function test_cannot_submit_with_existing_organization_cuit(): void
    {
        // Create existing organization with CUIT
        Organization::factory()->create(['cuit' => '30-71234567-9']);

        $data = $this->getValidRequestData();

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['organization_cuit']);
        $response->assertJsonFragment([
            'organization_cuit' => ['Ya existe una organización o solicitud pendiente con este CUIT.'],
        ]);
    }

    #[Test]
    public function test_cannot_submit_with_pending_request_cuit(): void
    {
        // Create pending request with same CUIT
        RegistrationRequest::create([
            'dni' => '99999999',
            'first_name' => 'Otro',
            'last_name' => 'Usuario',
            'email' => 'otro@example.com',
            'whatsapp' => '+5493814567890',
            'organization_name' => 'Otra Org',
            'organization_cuit' => '30-71234567-9',
            'organization_sector' => 'Test',
            'motivation' => 'Queremos publicar nuestros eventos en la plataforma para llegar a más turistas y promocionar nuestras actividades culturales.',
            'status' => 'pending',
        ]);

        $data = $this->getValidRequestData();

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['organization_cuit']);
    }

    #[Test]
    public function test_can_submit_with_rejected_request_cuit(): void
    {
        Notification::fake();

        // Create REJECTED request with same CUIT (should allow resubmission)
        RegistrationRequest::create([
            'dni' => '99999999',
            'first_name' => 'Otro',
            'last_name' => 'Usuario',
            'email' => 'otro@example.com',
            'whatsapp' => '+5493814567890',
            'organization_name' => 'Otra Org',
            'organization_cuit' => '30-71234567-9',
            'organization_sector' => 'Test',
            'motivation' => 'Queremos publicar nuestros eventos en la plataforma para llegar a más turistas y promocionar nuestras actividades culturales.',
            'status' => 'rejected',
        ]);

        $data = $this->getValidRequestData();
        $data['email'] = 'new-email@example.com'; // Use different email

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
    }

    #[Test]
    public function test_cuit_format_validation(): void
    {
        $data = $this->getValidRequestData();
        $data['organization_cuit'] = '30712345679'; // Missing dashes

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['organization_cuit']);
        $response->assertJsonFragment([
            'organization_cuit' => ['El CUIT debe tener el formato XX-XXXXXXXX-X.'],
        ]);
    }
}
