<?php

namespace Tests\Feature\InternalCalendar;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventType;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class InternalCalendarStatsControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $entityAdmin;

    private Organization $organization;

    private EventType $eventType;

    private EventStatus $approvedInternalStatus;

    private EventStatus $publishedStatus;

    private EventStatus $draftStatus;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed required data
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);

        // Create test organization
        $this->organization = Organization::factory()->create();

        // Get entity admin role
        $entityAdminRole = UserRole::where('role_code', 'entity_admin')->first();

        // Create entity admin user
        $this->entityAdmin = User::factory()->create([
            'password' => Hash::make('password123'),
            'status' => 'active',
            'role_id' => $entityAdminRole->id,
        ]);
        $this->entityAdmin->organizations()->attach($this->organization->id);

        // Get event statuses from seeders
        $this->approvedInternalStatus = EventStatus::where('status_code', 'approved_internal')->first();
        $this->publishedStatus = EventStatus::where('status_code', 'published')->first();
        $this->draftStatus = EventStatus::where('status_code', 'draft')->first();

        // Create event type
        $this->eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ]);
    }

    #[Test]
    public function it_returns_stats_with_correct_counts()
    {
        // Arrange: Create events with different statuses
        // 3 approved_internal events
        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // 2 published events
        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(3),
            'end_date' => now()->addDays(4),
        ]);

        // 1 draft event (should NOT be counted)
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->draftStatus->id,
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(6),
        ]);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/stats');

        // Assert
        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'total_events',
                'total_event_types',
                'events_this_month',
            ],
        ]);

        $data = $response->json('data');
        $this->assertEquals(5, $data['total_events']); // 3 approved_internal + 2 published
        $this->assertEquals(1, $data['total_event_types']); // 1 event type used
    }

    #[Test]
    public function it_filters_only_approved_internal_and_published_events()
    {
        // Arrange: Create events with all possible statuses
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(3),
            'end_date' => now()->addDays(4),
        ]);

        // Create draft event (should NOT be counted)
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->draftStatus->id,
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(6),
        ]);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/stats');

        // Assert
        $response->assertOk();
        $data = $response->json('data');
        $this->assertEquals(2, $data['total_events']); // Only approved_internal + published
    }

    #[Test]
    public function it_calculates_events_this_month_correctly()
    {
        // Fix date to middle of month for deterministic test
        Carbon::setTestNow(Carbon::create(2025, 6, 15, 12, 0, 0));

        // Arrange: Create events in current month and other months
        // 2 events this month (June 2025)
        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => Carbon::create(2025, 6, 10),
            'end_date' => Carbon::create(2025, 6, 11),
        ]);

        // 1 event next month (July - should NOT be counted)
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => Carbon::create(2025, 7, 1),
            'end_date' => Carbon::create(2025, 7, 2),
        ]);

        // 1 event last month (May - should NOT be counted)
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => Carbon::create(2025, 5, 1),
            'end_date' => Carbon::create(2025, 5, 2),
        ]);

        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/stats');

        // Assert
        $response->assertOk();
        $data = $response->json('data');
        $this->assertEquals(2, $data['events_this_month']); // Only current month (June)

        // Reset Carbon time
        Carbon::setTestNow();
    }

    #[Test]
    public function it_requires_authentication()
    {
        // Act: Request without authentication
        $response = $this->getJson('/api/v1/internal-calendar/stats');

        // Assert
        $response->assertUnauthorized();
    }

    #[Test]
    public function it_handles_empty_database_gracefully()
    {
        // Arrange: No events created
        $token = $this->entityAdmin->createToken('test-token')->plainTextToken;

        // Act
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/internal-calendar/stats');

        // Assert
        $response->assertOk();
        $data = $response->json('data');
        $this->assertEquals(0, $data['total_events']);
        $this->assertEquals(0, $data['total_event_types']);
        $this->assertEquals(0, $data['events_this_month']);
    }
}
