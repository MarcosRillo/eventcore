<?php

namespace Tests\Feature\Auth;

use App\Models\Organization;
use App\Models\RegistrationRequest;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * RegistrationRequestService Feature Tests
 *
 * Tests for the extended endpoints: suspend, unsuspend, delete (destroy),
 * index with filters, and show. Tests the service logic via HTTP endpoints.
 */
class RegistrationRequestServiceTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
        Storage::fake('public');

        $this->admin = $this->createUserWithRole('platform_admin');
        $this->actingAs($this->admin, 'sanctum');
    }

    private function createUserWithRole(string $roleCode): User
    {
        $role = UserRole::where('role_code', $roleCode)->first();
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
            'status' => 'pending',
        ], $override);
    }

    /**
     * Create an approved RegistrationRequest with associated active user and organization.
     */
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
            ]
        ));
    }

    /**
     * Create a pending RegistrationRequest without user/organization.
     */
    private function createPendingRequest(): RegistrationRequest
    {
        return RegistrationRequest::create($this->makeRequestData([
            'status' => 'pending',
            'user_id' => null,
            'organization_id' => null,
        ]));
    }

    // ================================================================
    // INDEX — GET /api/v1/registration-requests
    // ================================================================

    #[Test]
    public function test_index_returns_all_requests_without_filter(): void
    {
        $this->createApprovedRequest();
        $this->createPendingRequest();

        $response = $this->getJson('/api/v1/registration-requests');

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data',
        ]);
        $response->assertJsonPath('success', true);
    }

    #[Test]
    public function test_index_returns_data_array(): void
    {
        $this->createApprovedRequest();

        $response = $this->getJson('/api/v1/registration-requests');

        $response->assertOk();
        $this->assertIsArray($response->json('data'));
    }

    #[Test]
    public function test_index_with_pending_status_filter_returns_only_pending(): void
    {
        $this->createApprovedRequest();
        $this->createPendingRequest();

        $response = $this->getJson('/api/v1/registration-requests?status=pending');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertIsArray($data);
        foreach ($data as $item) {
            $this->assertEquals('pending', $item['status']);
        }
    }

    #[Test]
    public function test_index_with_approved_status_filter_returns_only_approved(): void
    {
        $this->createApprovedRequest();
        $this->createPendingRequest();

        $response = $this->getJson('/api/v1/registration-requests?status=approved');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertIsArray($data);
        foreach ($data as $item) {
            $this->assertEquals('approved', $item['status']);
        }
    }

    // ================================================================
    // SHOW — GET /api/v1/registration-requests/{id}
    // ================================================================

    #[Test]
    public function test_show_returns_single_request(): void
    {
        $request = $this->createApprovedRequest();

        $response = $this->getJson("/api/v1/registration-requests/{$request->id}");

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.id', $request->id);
    }

    #[Test]
    public function test_show_returns_404_for_nonexistent_request(): void
    {
        $response = $this->getJson('/api/v1/registration-requests/999999');

        $response->assertNotFound();
    }

    #[Test]
    public function test_show_includes_status_in_response(): void
    {
        $request = $this->createApprovedRequest();

        $response = $this->getJson("/api/v1/registration-requests/{$request->id}");

        $response->assertOk();
        $this->assertNotNull($response->json('data.status'));
        $this->assertEquals('approved', $response->json('data.status'));
    }

    // ================================================================
    // SUSPEND — POST /api/v1/registration-requests/{id}/suspend
    // ================================================================

    #[Test]
    public function test_suspend_approved_request_succeeds(): void
    {
        $request = $this->createApprovedRequest();

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/suspend");

        $response->assertOk();
        $response->assertJsonPath('success', true);
    }

    #[Test]
    public function test_suspend_sets_user_status_to_suspended(): void
    {
        $request = $this->createApprovedRequest();
        $userId = $request->user_id;

        $this->postJson("/api/v1/registration-requests/{$request->id}/suspend");

        $this->assertDatabaseHas('users', [
            'id' => $userId,
            'status' => 'suspended',
        ]);
    }

    #[Test]
    public function test_suspend_sets_organization_status_to_suspended(): void
    {
        $request = $this->createApprovedRequest();
        $organizationId = $request->organization_id;

        $this->postJson("/api/v1/registration-requests/{$request->id}/suspend");

        $suspendedStatusId = \DB::table('organization_statuses')
            ->where('status_code', 'suspended')
            ->value('id');

        $this->assertDatabaseHas('organizations', [
            'id' => $organizationId,
            'status_id' => $suspendedStatusId,
        ]);
    }

    #[Test]
    public function test_suspend_pending_request_returns_422(): void
    {
        $request = $this->createPendingRequest();

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/suspend");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    #[Test]
    public function test_suspend_already_suspended_user_returns_422(): void
    {
        $request = $this->createApprovedRequest(['status' => 'suspended']);

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/suspend");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    #[Test]
    public function test_suspend_nonexistent_request_returns_404(): void
    {
        $response = $this->postJson('/api/v1/registration-requests/999999/suspend');

        $response->assertNotFound();
    }

    // ================================================================
    // UNSUSPEND — POST /api/v1/registration-requests/{id}/unsuspend
    // ================================================================

    #[Test]
    public function test_unsuspend_suspended_request_succeeds(): void
    {
        $request = $this->createApprovedRequest(['status' => 'suspended']);

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/unsuspend");

        $response->assertOk();
        $response->assertJsonPath('success', true);
    }

    #[Test]
    public function test_unsuspend_sets_user_status_to_active(): void
    {
        $request = $this->createApprovedRequest(['status' => 'suspended']);
        $userId = $request->user_id;

        $this->postJson("/api/v1/registration-requests/{$request->id}/unsuspend");

        $this->assertDatabaseHas('users', [
            'id' => $userId,
            'status' => 'active',
        ]);
    }

    #[Test]
    public function test_unsuspend_sets_organization_status_to_active(): void
    {
        $request = $this->createApprovedRequest(['status' => 'suspended']);
        $organizationId = $request->organization_id;

        $this->postJson("/api/v1/registration-requests/{$request->id}/unsuspend");

        $activeStatusId = \DB::table('organization_statuses')
            ->where('status_code', 'active')
            ->value('id');

        $this->assertDatabaseHas('organizations', [
            'id' => $organizationId,
            'status_id' => $activeStatusId,
        ]);
    }

    #[Test]
    public function test_unsuspend_pending_request_returns_422(): void
    {
        $request = $this->createPendingRequest();

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/unsuspend");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    #[Test]
    public function test_unsuspend_already_active_user_returns_422(): void
    {
        $request = $this->createApprovedRequest(['status' => 'active']);

        $response = $this->postJson("/api/v1/registration-requests/{$request->id}/unsuspend");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    #[Test]
    public function test_unsuspend_nonexistent_request_returns_404(): void
    {
        $response = $this->postJson('/api/v1/registration-requests/999999/unsuspend');

        $response->assertNotFound();
    }

    // ================================================================
    // DELETE (DESTROY) — DELETE /api/v1/registration-requests/{id}
    // ================================================================

    #[Test]
    public function test_delete_suspended_request_succeeds(): void
    {
        $request = $this->createApprovedRequest(['status' => 'suspended']);

        $response = $this->deleteJson("/api/v1/registration-requests/{$request->id}");

        $response->assertOk();
        $response->assertJsonPath('success', true);
    }

    #[Test]
    public function test_delete_soft_deletes_the_user(): void
    {
        $request = $this->createApprovedRequest(['status' => 'suspended']);
        $userId = $request->user_id;

        $this->deleteJson("/api/v1/registration-requests/{$request->id}");

        $this->assertSoftDeleted('users', ['id' => $userId]);
    }

    #[Test]
    public function test_delete_soft_deletes_the_organization(): void
    {
        $request = $this->createApprovedRequest(['status' => 'suspended']);
        $organizationId = $request->organization_id;

        $this->deleteJson("/api/v1/registration-requests/{$request->id}");

        $this->assertSoftDeleted('organizations', ['id' => $organizationId]);
    }

    #[Test]
    public function test_delete_non_suspended_approved_request_returns_422(): void
    {
        $request = $this->createApprovedRequest(['status' => 'active']);

        $response = $this->deleteJson("/api/v1/registration-requests/{$request->id}");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    #[Test]
    public function test_delete_pending_request_returns_422(): void
    {
        $request = $this->createPendingRequest();

        $response = $this->deleteJson("/api/v1/registration-requests/{$request->id}");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['request']);
    }

    #[Test]
    public function test_delete_nonexistent_request_returns_404(): void
    {
        $response = $this->deleteJson('/api/v1/registration-requests/999999');

        $response->assertNotFound();
    }

    #[Test]
    public function test_delete_preserves_registration_request_record_for_traceability(): void
    {
        $request = $this->createApprovedRequest(['status' => 'suspended']);

        $this->deleteJson("/api/v1/registration-requests/{$request->id}");

        // The registration request itself should still exist (for traceability)
        $this->assertDatabaseHas('registration_requests', ['id' => $request->id]);
    }
}
