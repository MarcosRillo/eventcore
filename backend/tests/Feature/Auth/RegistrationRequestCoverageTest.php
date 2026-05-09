<?php

namespace Tests\Feature\Auth;

use App\Features\Auth\Notifications\RegistrationApprovedNotification;
use App\Features\Auth\Notifications\RegistrationRejectedNotification;
use App\Features\Auth\Notifications\RegistrationRequestReceivedNotification;
use App\Models\Organization;
use App\Models\RegistrationRequest;
use App\Models\User;
use App\Models\UserRole;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * RegistrationRequest Coverage Tests — Tier 2c
 *
 * Targets uncovered branches in:
 * - RegistrationRequestService (file uploads, getPendingRequests,
 *   platform_admin approve path, missing user/org guards)
 * - RegistrationRequestController (show extra fields, file upload store,
 *   reject/suspend/unsuspend response shapes)
 */
class RegistrationRequestCoverageTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserRolesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
        Storage::fake('public');
        Notification::fake();

        $this->admin = $this->createUserWithRole('platform_admin');
        $this->actingAs($this->admin, 'sanctum');
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    private function createUserWithRole(string $roleCode): User
    {
        $role = UserRole::where('role_code', $roleCode)->firstOrFail();
        $user = User::factory()->create(['role_id' => $role->id]);
        $organization = Organization::factory()->create();
        $user->organizations()->attach($organization->id);

        return $user;
    }

    private function makeRequestData(array $override = []): array
    {
        return array_merge([
            'dni' => '12345678',
            'first_name' => 'Juan',
            'last_name' => 'Pérez',
            'email' => 'organizer'.uniqid().'@example.com',
            'whatsapp' => '+5493814567890',
            'organization_name' => 'Org '.uniqid(),
            'organization_cuit' => '30-'.rand(10000000, 99999999).'-9',
            'organization_sector' => 'Eventos',
            'motivation' => 'Queremos publicar nuestros eventos en la plataforma para llegar a más turistas.',
        ], $override);
    }

    private function createApprovedRequest(array $userAttributes = []): RegistrationRequest
    {
        $requestUser = User::factory()->create(array_merge(['status' => 'active'], $userAttributes));
        $organization = Organization::factory()->active()->create();

        return RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'approved']),
            [
                'user_id' => $requestUser->id,
                'organization_id' => $organization->id,
                'reviewed_by' => $this->admin->id,
                'reviewed_at' => now(),
            ],
        ));
    }

    private function createPendingRequest(): RegistrationRequest
    {
        return RegistrationRequest::create($this->makeRequestData([
            'status' => 'pending',
            'user_id' => null,
            'organization_id' => null,
        ]));
    }

    // ================================================================
    // SERVICE: submitRequest — file uploads
    // ================================================================

    #[Test]
    public function test_store_with_profile_photo_stores_file(): void
    {
        $photo = UploadedFile::fake()->image('photo.jpg', 100, 100);
        $data = $this->makeRequestData(['profile_photo' => $photo]);

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);

        $request = RegistrationRequest::where('email', $data['email'])->firstOrFail();
        $this->assertNotNull($request->profile_photo, 'profile_photo should be stored');
        Storage::disk('public')->assertExists($request->profile_photo);
    }

    #[Test]
    public function test_store_with_organization_logo_stores_file(): void
    {
        $logo = UploadedFile::fake()->image('logo.png', 200, 200);
        $data = $this->makeRequestData(['organization_logo' => $logo]);

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(201);

        $request = RegistrationRequest::where('email', $data['email'])->firstOrFail();
        $this->assertNotNull($request->organization_logo, 'organization_logo should be stored');
        Storage::disk('public')->assertExists($request->organization_logo);
    }

    #[Test]
    public function test_store_with_both_files_stores_both(): void
    {
        $photo = UploadedFile::fake()->image('photo.jpg', 100, 100);
        $logo = UploadedFile::fake()->image('logo.png', 200, 200);
        $data = $this->makeRequestData([
            'profile_photo' => $photo,
            'organization_logo' => $logo,
        ]);

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(201);

        $request = RegistrationRequest::where('email', $data['email'])->firstOrFail();
        $this->assertNotNull($request->profile_photo);
        $this->assertNotNull($request->organization_logo);
        Storage::disk('public')->assertExists($request->profile_photo);
        Storage::disk('public')->assertExists($request->organization_logo);
    }

    #[Test]
    public function test_store_without_files_stores_nulls(): void
    {
        $data = $this->makeRequestData();

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(201);

        $request = RegistrationRequest::where('email', $data['email'])->firstOrFail();
        $this->assertNull($request->profile_photo);
        $this->assertNull($request->organization_logo);
    }

    #[Test]
    public function test_store_with_optional_website_saves_it(): void
    {
        $data = $this->makeRequestData(['website' => 'https://example.com']);

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('registration_requests', [
            'email' => $data['email'],
            'website' => 'https://example.com',
        ]);
    }

    #[Test]
    public function test_store_without_website_saves_null(): void
    {
        $data = $this->makeRequestData();
        unset($data['website']);

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(201);
        $request = RegistrationRequest::where('email', $data['email'])->firstOrFail();
        $this->assertNull($request->website);
    }

    #[Test]
    public function test_store_sends_received_notification(): void
    {
        $data = $this->makeRequestData();

        $this->postJson('/api/v1/auth/register-request', $data);

        $request = RegistrationRequest::where('email', $data['email'])->firstOrFail();
        Notification::assertSentTo($request, RegistrationRequestReceivedNotification::class);
    }

    // ================================================================
    // SERVICE: getPendingRequests
    // ================================================================

    #[Test]
    public function test_index_returns_only_pending_requests_via_pending_scope(): void
    {
        $this->createPendingRequest();
        $this->createPendingRequest();
        $this->createApprovedRequest();

        $response = $this->getJson('/api/v1/registration-requests?status=pending');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(2, $data);
        foreach ($data as $item) {
            $this->assertEquals('pending', $item['status']);
        }
    }

    #[Test]
    public function test_index_returns_empty_when_no_requests_exist(): void
    {
        $response = $this->getJson('/api/v1/registration-requests');

        $response->assertOk();
        $this->assertCount(0, $response->json('data'));
    }

    #[Test]
    public function test_index_orders_by_created_at_desc(): void
    {
        // Force distinct timestamps to guarantee ordering via forceFill + save
        $first = $this->createPendingRequest();
        $first->forceFill(['created_at' => now()->subMinutes(5)])->save();

        $second = $this->createPendingRequest();
        $second->forceFill(['created_at' => now()->subMinute()])->save();

        $response = $this->getJson('/api/v1/registration-requests?status=pending');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        // Most recent first — $second has newer created_at
        $this->assertEquals($second->id, $ids[0]);
        $this->assertEquals($first->id, $ids[1]);
    }

    // ================================================================
    // SERVICE: approveRequest — platform_admin (no organization_id)
    // fallback to first primary entity
    // ================================================================

    #[Test]
    public function test_platform_admin_without_org_approves_and_uses_primary_entity_as_parent(): void
    {
        // Create a platform_admin with NO organization attached (no pivot rows)
        $role = UserRole::where('role_code', 'platform_admin')->firstOrFail();
        $platformAdmin = User::factory()->create(['role_id' => $role->id]);
        // Do NOT attach any organization — organization_id accessor returns null
        $this->actingAs($platformAdmin, 'sanctum');

        $pendingRequest = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'pending']),
        ));

        $response = $this->postJson("/api/v1/registration-requests/{$pendingRequest->id}/approve");

        $response->assertOk();
        $response->assertJsonPath('success', true);

        // The newly created organization should have a parent_id pointing to a primary entity
        $orgId = $response->json('data.organization_id');
        $organization = Organization::find($orgId);

        // Either a specific primary entity was used, or the factory created one — either way parent_id must be set
        $primaryEntityTypeId = \DB::table('organization_types')
            ->where('type_code', 'primary_entity')
            ->value('id');

        $parentOrg = Organization::find($organization->parent_id);
        $this->assertNotNull($organization->parent_id, 'Approved org should have a primary entity as parent');
        $this->assertEquals($primaryEntityTypeId, $parentOrg->type_id, 'Parent should be a primary entity');
    }

    #[Test]
    public function test_approve_sends_approved_notification(): void
    {
        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $pendingRequest = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'pending']),
        ));

        $this->postJson("/api/v1/registration-requests/{$pendingRequest->id}/approve");

        Notification::assertSentTo($pendingRequest, RegistrationApprovedNotification::class);
    }

    #[Test]
    public function test_approve_creates_password_reset_token_in_db(): void
    {
        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $pendingRequest = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'pending']),
        ));

        $this->postJson("/api/v1/registration-requests/{$pendingRequest->id}/approve");

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => $pendingRequest->email,
        ]);
    }

    #[Test]
    public function test_approve_nonexistent_request_returns_404(): void
    {
        $response = $this->postJson('/api/v1/registration-requests/999999/approve');

        $response->assertNotFound();
    }

    #[Test]
    public function test_cannot_reject_already_approved_request(): void
    {
        $request = $this->createApprovedRequest();

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/reject", [
            'reason' => 'La información proporcionada es insuficiente para verificar la organización.',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    #[Test]
    public function test_reject_sends_rejected_notification(): void
    {
        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $pendingRequest = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'pending']),
        ));

        $this->postJson("/api/v1/registration-requests/{$pendingRequest->id}/reject", [
            'reason' => 'La información proporcionada es insuficiente para verificar la organización.',
        ]);

        Notification::assertSentTo($pendingRequest, RegistrationRejectedNotification::class);
    }

    #[Test]
    public function test_reject_nonexistent_request_returns_404(): void
    {
        $response = $this->postJson('/api/v1/registration-requests/999999/reject', [
            'reason' => 'La información proporcionada es insuficiente para verificar la organización.',
        ]);

        $response->assertNotFound();
    }

    // ================================================================
    // SERVICE: suspendApprovedRequest — missing user/org guard
    // ================================================================

    #[Test]
    public function test_suspend_request_without_user_returns_422(): void
    {
        $organization = Organization::factory()->active()->create();
        $request = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'approved']),
            [
                'user_id' => null,
                'organization_id' => $organization->id,
                'reviewed_by' => $this->admin->id,
                'reviewed_at' => now(),
            ],
        ));

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/suspend");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    #[Test]
    public function test_suspend_request_without_organization_returns_422(): void
    {
        $user = User::factory()->create(['status' => 'active']);
        $request = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'approved']),
            [
                'user_id' => $user->id,
                'organization_id' => null,
                'reviewed_by' => $this->admin->id,
                'reviewed_at' => now(),
            ],
        ));

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/suspend");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    #[Test]
    public function test_suspend_returns_registration_request_resource_in_data(): void
    {
        $request = $this->createApprovedRequest();

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/suspend");

        $response->assertOk();
        $response->assertJsonStructure(['success', 'message', 'data']);
        $this->assertEquals($request->id, $response->json('data.id'));
    }

    // ================================================================
    // SERVICE: unsuspendApprovedRequest — missing user/org guard
    // ================================================================

    #[Test]
    public function test_unsuspend_request_without_user_returns_422(): void
    {
        $organization = Organization::factory()->active()->create();
        $request = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'approved']),
            [
                'user_id' => null,
                'organization_id' => $organization->id,
                'reviewed_by' => $this->admin->id,
                'reviewed_at' => now(),
            ],
        ));

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/unsuspend");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    #[Test]
    public function test_unsuspend_request_without_organization_returns_422(): void
    {
        $user = User::factory()->create(['status' => 'suspended']);
        $request = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'approved']),
            [
                'user_id' => $user->id,
                'organization_id' => null,
                'reviewed_by' => $this->admin->id,
                'reviewed_at' => now(),
            ],
        ));

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/unsuspend");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    #[Test]
    public function test_unsuspend_returns_registration_request_resource_in_data(): void
    {
        $request = $this->createApprovedRequest(['status' => 'suspended']);

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/unsuspend");

        $response->assertOk();
        $response->assertJsonStructure(['success', 'message', 'data']);
        $this->assertEquals($request->id, $response->json('data.id'));
    }

    // ================================================================
    // SERVICE: deleteApprovedRequest — missing user/org guard
    // ================================================================

    #[Test]
    public function test_delete_request_without_user_returns_422(): void
    {
        $organization = Organization::factory()->active()->create();
        $request = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'approved']),
            [
                'user_id' => null,
                'organization_id' => $organization->id,
                'reviewed_by' => $this->admin->id,
                'reviewed_at' => now(),
            ],
        ));

        $response = $this->deleteJson("/api/v1/registration-requests/{$request->id}");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    #[Test]
    public function test_delete_request_without_organization_returns_422(): void
    {
        $user = User::factory()->create(['status' => 'suspended']);
        $request = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'approved']),
            [
                'user_id' => $user->id,
                'organization_id' => null,
                'reviewed_by' => $this->admin->id,
                'reviewed_at' => now(),
            ],
        ));

        $response = $this->deleteJson("/api/v1/registration-requests/{$request->id}");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    // ================================================================
    // CONTROLLER: show — response shape and data fields
    // ================================================================

    #[Test]
    public function test_show_returns_full_name_in_response(): void
    {
        $request = RegistrationRequest::create(array_merge(
            $this->makeRequestData([
                'status' => 'pending',
                'first_name' => 'María',
                'last_name' => 'González',
            ]),
        ));

        $response = $this->getJson("/api/v1/registration-requests/{$request->id}");

        $response->assertOk();
        // The resource returns full_name (concatenated), not first_name/last_name separately
        $this->assertEquals('María González', $response->json('data.full_name'));
    }

    #[Test]
    public function test_show_returns_correct_id(): void
    {
        $request = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'pending']),
        ));

        $response = $this->getJson("/api/v1/registration-requests/{$request->id}");

        $response->assertOk();
        $this->assertEquals($request->id, $response->json('data.id'));
    }

    #[Test]
    public function test_show_returns_organization_name(): void
    {
        $request = RegistrationRequest::create(array_merge(
            $this->makeRequestData([
                'status' => 'pending',
                'organization_name' => 'Empresa de Eventos SA',
            ]),
        ));

        $response = $this->getJson("/api/v1/registration-requests/{$request->id}");

        $response->assertOk();
        $this->assertEquals('Empresa de Eventos SA', $response->json('data.organization_name'));
    }

    #[Test]
    public function test_show_returns_email_in_response(): void
    {
        $email = 'unique.show.test@example.com';
        $request = RegistrationRequest::create(array_merge(
            $this->makeRequestData([
                'status' => 'pending',
                'email' => $email,
            ]),
        ));

        $response = $this->getJson("/api/v1/registration-requests/{$request->id}");

        $response->assertOk();
        $this->assertEquals($email, $response->json('data.email'));
    }

    #[Test]
    public function test_show_response_contains_standard_resource_fields(): void
    {
        $request = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'pending']),
        ));

        $response = $this->getJson("/api/v1/registration-requests/{$request->id}");

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                'id',
                'full_name',
                'email',
                'whatsapp',
                'organization_name',
                'organization_sector',
                'status',
                'created_at',
            ],
        ]);
    }

    // ================================================================
    // CONTROLLER: reject — full response shape
    // ================================================================

    #[Test]
    public function test_reject_returns_success_true_and_message(): void
    {
        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $pendingRequest = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'pending']),
        ));

        $response = $this->postJson("/api/v1/registration-requests/{$pendingRequest->id}/reject", [
            'reason' => 'La información proporcionada es insuficiente para verificar la organización.',
        ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure(['success', 'message']);
        $this->assertStringContainsString('rechazada', $response->json('message'));
    }

    #[Test]
    public function test_reject_updates_rejection_reason_in_db(): void
    {
        $entityAdmin = $this->createUserWithRole('entity_admin');
        $this->actingAs($entityAdmin, 'sanctum');

        $pendingRequest = RegistrationRequest::create(array_merge(
            $this->makeRequestData(['status' => 'pending']),
        ));

        $reason = 'La información proporcionada es insuficiente para verificar la organización.';
        $this->postJson("/api/v1/registration-requests/{$pendingRequest->id}/reject", [
            'reason' => $reason,
        ]);

        $pendingRequest->refresh();
        $this->assertEquals($reason, $pendingRequest->rejection_reason);
        $this->assertEquals('rejected', $pendingRequest->status);
        $this->assertEquals($entityAdmin->id, $pendingRequest->reviewed_by);
    }

    // ================================================================
    // CONTROLLER: store — invalid file type rejected
    // ================================================================

    #[Test]
    public function test_store_rejects_invalid_profile_photo_mime_type(): void
    {
        $data = $this->makeRequestData();
        $data['profile_photo'] = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['profile_photo']);
    }

    #[Test]
    public function test_store_rejects_invalid_organization_logo_mime_type(): void
    {
        $data = $this->makeRequestData();
        $data['organization_logo'] = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['organization_logo']);
    }

    #[Test]
    public function test_store_rejects_invalid_website_url(): void
    {
        $data = $this->makeRequestData(['website' => 'not-a-url']);

        $response = $this->postJson('/api/v1/auth/register-request', $data);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['website']);
    }
}
