<?php

namespace Tests\Feature\InternalCalendar;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventType;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests for InternalCalendarController
 *
 * Tests internal calendar endpoints for authenticated users.
 * Created: December 4, 2025 (Internal Calendar feature)
 */
class InternalCalendarControllerTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;

    private Organization $otherOrganization;

    private User $entityAdmin;

    private User $entityStaff;

    private User $organizerAdmin;

    private EventStatus $approvedInternalStatus;

    private EventStatus $pendingPublicApprovalStatus;

    private EventStatus $publishedStatus;

    private EventStatus $draftStatus;

    private EventStatus $rejectedStatus;

    private EventStatus $requiresChangesStatus;

    private EventType $eventType;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed required data
        $this->seed(UserRolesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
        $this->seed(EventStatusesSeeder::class);
        $this->seed(EventTypesSeeder::class);

        // Create test organizations
        $this->organization = Organization::factory()->create();
        $this->otherOrganization = Organization::factory()->create();

        // Get user roles
        $entityAdminRole = UserRole::where('role_code', 'entity_admin')->first();
        $entityStaffRole = UserRole::where('role_code', 'entity_staff')->first();
        $organizerAdminRole = UserRole::where('role_code', 'organizer_admin')->first();

        // Create users with different roles
        $this->entityAdmin = User::factory()->create([
            'password' => Hash::make('password123'),
            'status' => 'active',
            'role_id' => $entityAdminRole->id,
        ]);
        $this->entityAdmin->organizations()->attach($this->organization->id);

        $this->entityStaff = User::factory()->create([
            'password' => Hash::make('password123'),
            'status' => 'active',
            'role_id' => $entityStaffRole->id,
        ]);
        $this->entityStaff->organizations()->attach($this->organization->id);

        $this->organizerAdmin = User::factory()->create([
            'password' => Hash::make('password123'),
            'status' => 'active',
            'role_id' => $organizerAdminRole->id,
        ]);
        $this->organizerAdmin->organizations()->attach($this->organization->id);

        // Get event statuses
        $this->approvedInternalStatus = EventStatus::where('status_code', 'approved_internal')->first();
        $this->pendingPublicApprovalStatus = EventStatus::where('status_code', 'pending_public_approval')->first();
        $this->publishedStatus = EventStatus::where('status_code', 'published')->first();
        $this->draftStatus = EventStatus::where('status_code', 'draft')->first();
        $this->rejectedStatus = EventStatus::where('status_code', 'rejected')->first();
        $this->requiresChangesStatus = EventStatus::where('status_code', 'requires_changes')->first();

        // Create event type
        $this->eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ]);
    }

    #[Test]
    public function it_allows_entity_admin_to_get_internal_calendar_events()
    {
        // Arrange: Create approved internal event
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act: Request internal calendar events
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/events');

        // Assert: Returns 200 with events data
        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'title', 'start_date', 'end_date', 'status_id'],
            ],
        ]);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    #[Test]
    public function it_allows_entity_staff_to_get_internal_calendar_events()
    {
        // Arrange: Create approved internal event
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $token = $this->entityStaff->createToken('test-token')->plainTextToken;

        // Act: Request internal calendar events
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/events');

        // Assert: Returns 200 with events data
        $response->assertOk();
        $response->assertJsonStructure(['data']);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    #[Test]
    public function it_allows_organizer_admin_to_get_internal_calendar_events()
    {
        // Arrange: Create approved internal event
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $token = $this->organizerAdmin->createToken('test-token')->plainTextToken;

        // Act: Request internal calendar events
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/events');

        // Assert: Returns 200 with events data
        $response->assertOk();
        $response->assertJsonStructure(['data']);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    #[Test]
    public function it_denies_guest_access_to_internal_calendar_events()
    {
        // Arrange: Create approved internal event
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Request without authentication token
        $response = $this->getJson('/api/v1/internal-calendar/events');

        // Assert: Returns 401 Unauthorized
        $response->assertStatus(401);
        $response->assertJsonFragment(['message' => 'Unauthenticated']);
    }

    #[Test]
    public function it_can_filter_by_status_code()
    {
        // Arrange: Create events with different statuses
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Approved Internal Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->publishedStatus->id,
            'title' => 'Published Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act: Filter by approved_internal status
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/events?status=approved_internal');

        // Assert: Only approved_internal events returned
        $response->assertOk();
        $data = $response->json('data');
        $this->assertEquals(1, count($data));
        $this->assertEquals('Approved Internal Event', $data[0]['title']);
        $this->assertEquals($this->approvedInternalStatus->id, $data[0]['status_id']);
    }

    #[Test]
    public function it_can_filter_by_date_range()
    {
        // Arrange: Create events with different dates
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Event in January',
            'start_date' => '2026-01-15',
            'end_date' => '2026-01-16',
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->publishedStatus->id,
            'title' => 'Event in February',
            'start_date' => '2026-02-15',
            'end_date' => '2026-02-16',
        ]);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act: Filter by date range (January 2026)
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/events?start_date=2026-01-01&end_date=2026-01-31');

        // Assert: Only January events returned
        $response->assertOk();
        $data = $response->json('data');
        $this->assertEquals(1, count($data));
        $this->assertEquals('Event in January', $data[0]['title']);

        // Verify date is within range
        $startDate = date('Y-m-d', strtotime($data[0]['start_date']));
        $this->assertGreaterThanOrEqual('2026-01-01', $startDate);
        $this->assertLessThanOrEqual('2026-01-31', $startDate);
    }

    #[Test]
    public function it_can_filter_by_event_type()
    {
        // Arrange: Create second event type
        $otherEventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Other Type',
            'is_active' => true,
        ]);

        // Create events with different types
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Event Type 1',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $otherEventType->id,
            'status_id' => $this->publishedStatus->id,
            'title' => 'Event Type 2',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act: Filter by first event type
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/internal-calendar/events?event_type_id={$this->eventType->id}");

        // Assert: Only events of first type returned
        $response->assertOk();
        $data = $response->json('data');
        $this->assertEquals(1, count($data));
        $this->assertEquals('Event Type 1', $data[0]['title']);
        $this->assertEquals($this->eventType->id, $data[0]['event_type_id']);
    }

    #[Test]
    public function it_includes_approved_internal_events()
    {
        // Arrange: Create approved internal event
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Approved Internal Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act: Request internal calendar events
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/events');

        // Assert: Approved internal event is included
        $response->assertOk();
        $response->assertJsonFragment(['title' => 'Approved Internal Event']);
        $data = $response->json('data');
        $foundEvent = collect($data)->firstWhere('title', 'Approved Internal Event');
        $this->assertNotNull($foundEvent);
        $this->assertEquals($this->approvedInternalStatus->id, $foundEvent['status_id']);
    }

    #[Test]
    public function it_excludes_pending_public_approval_events()
    {
        // Arrange: Create pending public approval event (should NOT appear by default)
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->pendingPublicApprovalStatus->id,
            'title' => 'Pending Public Approval Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act: Request internal calendar events (without status filter)
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/events');

        // Assert: Pending public approval event is NOT included by default (public calendar view)
        $response->assertOk();
        $data = $response->json('data');
        $foundEvent = collect($data)->firstWhere('title', 'Pending Public Approval Event');
        $this->assertNull($foundEvent, 'pending_public_approval events should NOT be included by default');
    }

    #[Test]
    public function it_excludes_draft_events()
    {
        // Arrange: Create draft event (should NOT appear)
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'Draft Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Create approved internal event (should appear)
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Approved Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act: Request internal calendar events
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/events');

        // Assert: Draft event is NOT included
        $response->assertOk();
        $response->assertJsonMissing(['title' => 'Draft Event']);

        // Verify approved event is present but draft is not
        $data = $response->json('data');
        $titles = array_column($data, 'title');
        $this->assertContains('Approved Event', $titles);
        $this->assertNotContains('Draft Event', $titles);
    }

    #[Test]
    public function it_excludes_rejected_events()
    {
        // Arrange: Create rejected event (should NOT appear)
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->rejectedStatus->id,
            'title' => 'Rejected Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Create approved internal event (should appear)
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Approved Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act: Request internal calendar events
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/events');

        // Assert: Rejected event is NOT included
        $response->assertOk();
        $response->assertJsonMissing(['title' => 'Rejected Event']);

        // Verify approved event is present but rejected is not
        $data = $response->json('data');
        $titles = array_column($data, 'title');
        $this->assertContains('Approved Event', $titles);
        $this->assertNotContains('Rejected Event', $titles);
    }

    #[Test]
    public function it_excludes_requires_changes_events()
    {
        // Arrange: Create requires_changes event (should NOT appear)
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->requiresChangesStatus->id,
            'title' => 'Requires Changes Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Create approved internal event (should appear)
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Approved Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act: Request internal calendar events
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/events');

        // Assert: Requires changes event is NOT included
        $response->assertOk();
        $response->assertJsonMissing(['title' => 'Requires Changes Event']);

        // Verify approved event is present but requires_changes is not
        $data = $response->json('data');
        $titles = array_column($data, 'title');
        $this->assertContains('Approved Event', $titles);
        $this->assertNotContains('Requires Changes Event', $titles);
    }

    #[Test]
    public function it_shows_all_organizations_events_for_organizers()
    {
        // Arrange: Create event in organizer's organization
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Organizer Own Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Create event in other organization (SHOULD appear - internal calendar shows all)
        $otherEventType = EventType::factory()->create([
            'entity_id' => $this->otherOrganization->id,
            'is_active' => true,
        ]);

        Event::factory()->create([
            'entity_id' => $this->otherOrganization->id,
            'organization_id' => $this->otherOrganization->id,
            'event_type_id' => $otherEventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Other Organization Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $token = $this->organizerAdmin->createToken('test-token')->plainTextToken;

        // Act: Request internal calendar events as organizer
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/events');

        // Assert: ALL organization events returned (internal calendar is for planning/coordination)
        $response->assertOk();
        $data = $response->json('data');
        $titles = array_column($data, 'title');

        // Should see own event
        $this->assertContains('Organizer Own Event', $titles);

        // Should ALSO see other organization's event (this is the purpose of internal calendar)
        $this->assertContains('Other Organization Event', $titles);
    }
}
