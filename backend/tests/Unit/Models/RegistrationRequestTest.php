<?php

namespace Tests\Unit\Models;

use App\Models\Organization;
use App\Models\RegistrationRequest;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * RegistrationRequest Model Tests
 *
 * Tests for RegistrationRequest model methods, scopes, and attributes.
 */
class RegistrationRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserRolesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
    }

    private function makeRequest(array $attributes = []): RegistrationRequest
    {
        return RegistrationRequest::create(array_merge([
            'dni' => '12345678',
            'first_name' => 'Juan',
            'last_name' => 'Pérez',
            'email' => 'juan.perez.'.uniqid().'@example.com',
            'whatsapp' => '+5493814567890',
            'organization_name' => 'Test Org',
            'organization_cuit' => '30-71234567-'.rand(0, 9),
            'organization_sector' => 'Eventos',
            'motivation' => 'Queremos publicar nuestros eventos en la plataforma para llegar a más turistas.',
            'status' => 'pending',
        ], $attributes));
    }

    // ================================================================
    // RELATIONSHIP TESTS
    // ================================================================

    #[Test]
    public function test_reviewer_relationship_returns_user(): void
    {
        $reviewer = User::factory()->create();
        $request = $this->makeRequest([
            'status' => 'rejected',
            'reviewed_by' => $reviewer->id,
        ]);

        $this->assertInstanceOf(User::class, $request->reviewer);
        $this->assertEquals($reviewer->id, $request->reviewer->id);
    }

    #[Test]
    public function test_user_relationship_returns_user(): void
    {
        $user = User::factory()->create();
        $request = $this->makeRequest(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $request->user);
        $this->assertEquals($user->id, $request->user->id);
    }

    #[Test]
    public function test_organization_relationship_returns_organization(): void
    {
        $org = Organization::factory()->create();
        $request = $this->makeRequest(['organization_id' => $org->id]);

        $this->assertInstanceOf(Organization::class, $request->organization);
        $this->assertEquals($org->id, $request->organization->id);
    }

    #[Test]
    public function test_reviewer_is_null_when_not_reviewed(): void
    {
        $request = $this->makeRequest(['status' => 'pending']);

        $this->assertNull($request->reviewer);
    }

    // ================================================================
    // STATUS CHECK METHODS
    // ================================================================

    #[Test]
    public function test_is_pending_returns_true_for_pending_status(): void
    {
        $request = $this->makeRequest(['status' => 'pending']);

        $this->assertTrue($request->isPending());
        $this->assertFalse($request->isApproved());
        $this->assertFalse($request->isRejected());
    }

    #[Test]
    public function test_is_approved_returns_true_for_approved_status(): void
    {
        $request = $this->makeRequest(['status' => 'approved']);

        $this->assertTrue($request->isApproved());
        $this->assertFalse($request->isPending());
        $this->assertFalse($request->isRejected());
    }

    #[Test]
    public function test_is_rejected_returns_true_for_rejected_status(): void
    {
        $request = $this->makeRequest(['status' => 'rejected']);

        $this->assertTrue($request->isRejected());
        $this->assertFalse($request->isPending());
        $this->assertFalse($request->isApproved());
    }

    // ================================================================
    // ACCESSOR TESTS
    // ================================================================

    #[Test]
    public function test_full_name_attribute_concatenates_first_and_last(): void
    {
        $request = $this->makeRequest([
            'first_name' => 'María',
            'last_name' => 'González',
        ]);

        $this->assertEquals('María González', $request->full_name);
    }

    #[Test]
    public function test_route_notification_for_mail_returns_email(): void
    {
        $request = $this->makeRequest(['email' => 'test@example.com']);

        $this->assertEquals('test@example.com', $request->routeNotificationForMail());
    }

    // ================================================================
    // SCOPE TESTS
    // ================================================================

    #[Test]
    public function test_scope_pending_returns_only_pending_requests(): void
    {
        $this->makeRequest(['status' => 'pending']);
        $this->makeRequest(['status' => 'pending', 'email' => 'pending2@example.com']);
        $this->makeRequest(['status' => 'approved', 'email' => 'approved@example.com']);
        $this->makeRequest(['status' => 'rejected', 'email' => 'rejected@example.com']);

        $pending = RegistrationRequest::pending()->get();

        $this->assertCount(2, $pending);
        foreach ($pending as $r) {
            $this->assertEquals('pending', $r->status);
        }
    }

    #[Test]
    public function test_scope_approved_returns_only_approved_requests(): void
    {
        $this->makeRequest(['status' => 'pending']);
        $this->makeRequest(['status' => 'approved', 'email' => 'approved@example.com']);
        $this->makeRequest(['status' => 'approved', 'email' => 'approved2@example.com']);
        $this->makeRequest(['status' => 'rejected', 'email' => 'rejected@example.com']);

        $approved = RegistrationRequest::approved()->get();

        $this->assertCount(2, $approved);
        foreach ($approved as $r) {
            $this->assertEquals('approved', $r->status);
        }
    }

    #[Test]
    public function test_scope_rejected_returns_only_rejected_requests(): void
    {
        $this->makeRequest(['status' => 'pending']);
        $this->makeRequest(['status' => 'approved', 'email' => 'approved@example.com']);
        $this->makeRequest(['status' => 'rejected', 'email' => 'rejected@example.com']);

        $rejected = RegistrationRequest::rejected()->get();

        $this->assertCount(1, $rejected);
        $this->assertEquals('rejected', $rejected->first()->status);
    }

    // ================================================================
    // NOTIFIABLE TESTS
    // ================================================================

    #[Test]
    public function test_uses_notifiable_trait(): void
    {
        $request = $this->makeRequest();

        // Verify it has the routeNotificationFor method from Notifiable trait
        $this->assertTrue(method_exists($request, 'notify'));
    }

    // ================================================================
    // CAST TESTS
    // ================================================================

    #[Test]
    public function test_reviewed_at_is_cast_to_carbon(): void
    {
        $request = $this->makeRequest([
            'status' => 'rejected',
            'reviewed_at' => now(),
        ]);

        $this->assertInstanceOf(Carbon::class, $request->reviewed_at);
    }

    #[Test]
    public function test_reviewed_at_is_null_when_not_reviewed(): void
    {
        $request = $this->makeRequest(['status' => 'pending']);

        $this->assertNull($request->reviewed_at);
    }

    // ================================================================
    // SOFT DELETE TESTS
    // ================================================================

    #[Test]
    public function test_registration_request_can_be_soft_deleted(): void
    {
        $request = $this->makeRequest();

        $request->delete();

        $this->assertSoftDeleted('registration_requests', ['id' => $request->id]);
        $this->assertNull(RegistrationRequest::find($request->id));
        $this->assertNotNull(RegistrationRequest::withTrashed()->find($request->id));
    }

    #[Test]
    public function test_soft_deleted_request_can_be_restored(): void
    {
        $request = $this->makeRequest();
        $request->delete();

        $request->restore();

        $this->assertNotNull(RegistrationRequest::find($request->id));
    }

    // ================================================================
    // FILLABLE TESTS
    // ================================================================

    #[Test]
    public function test_fillable_fields_are_defined(): void
    {
        $model = new RegistrationRequest;
        $fillable = $model->getFillable();

        $this->assertContains('dni', $fillable);
        $this->assertContains('first_name', $fillable);
        $this->assertContains('last_name', $fillable);
        $this->assertContains('email', $fillable);
        $this->assertContains('status', $fillable);
        $this->assertContains('reviewed_by', $fillable);
        $this->assertContains('reviewed_at', $fillable);
        $this->assertContains('rejection_reason', $fillable);
        $this->assertContains('user_id', $fillable);
        $this->assertContains('organization_id', $fillable);
    }
}
