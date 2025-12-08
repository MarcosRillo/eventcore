<?php

namespace Tests\Feature\InternalCalendar;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventType;
use App\Models\Location;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests for InternalCalendarService
 *
 * Tests the internal calendar scope and query logic.
 * Created: December 4, 2025 (Internal Calendar feature)
 */
class InternalCalendarServiceTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;
    private EventStatus $approvedInternalStatus;
    private EventStatus $pendingPublicApprovalStatus;
    private EventStatus $publishedStatus;
    private EventStatus $draftStatus;
    private EventStatus $rejectedStatus;
    private EventType $eventType;

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

        // Get event statuses
        $this->approvedInternalStatus = EventStatus::where('status_code', 'approved_internal')->first();
        $this->pendingPublicApprovalStatus = EventStatus::where('status_code', 'pending_public_approval')->first();
        $this->publishedStatus = EventStatus::where('status_code', 'published')->first();
        $this->draftStatus = EventStatus::where('status_code', 'draft')->first();
        $this->rejectedStatus = EventStatus::where('status_code', 'rejected')->first();

        // Create event type
        $this->eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'is_active' => true
        ]);
    }

    #[Test]
    public function internal_calendar_scope_returns_correct_statuses()
    {
        // Arrange: Create events with all different statuses
        $approvedEvent = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Approved Internal',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $pendingEvent = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->pendingPublicApprovalStatus->id,
            'title' => 'Pending Public',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $publishedEvent = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->publishedStatus->id,
            'title' => 'Published',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Create events that should NOT be included
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'Draft',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->rejectedStatus->id,
            'title' => 'Rejected',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Query using internalCalendar scope
        $events = Event::internalCalendar()->get();

        // Assert: Only approved_internal, pending_public_approval, and published are included
        $this->assertEquals(3, $events->count());

        $eventTitles = $events->pluck('title')->toArray();
        $this->assertContains('Approved Internal', $eventTitles);
        $this->assertContains('Pending Public', $eventTitles);
        $this->assertContains('Published', $eventTitles);

        // Assert: Draft and Rejected are excluded
        $this->assertNotContains('Draft', $eventTitles);
        $this->assertNotContains('Rejected', $eventTitles);

        // Verify status IDs
        $statusIds = $events->pluck('status_id')->toArray();
        $this->assertContains($this->approvedInternalStatus->id, $statusIds);
        $this->assertContains($this->pendingPublicApprovalStatus->id, $statusIds);
        $this->assertContains($this->publishedStatus->id, $statusIds);
        $this->assertNotContains($this->draftStatus->id, $statusIds);
        $this->assertNotContains($this->rejectedStatus->id, $statusIds);
    }

    #[Test]
    public function applies_status_filter_correctly()
    {
        // Arrange: Create events with different statuses
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Approved Internal',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->publishedStatus->id,
            'title' => 'Published',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Query with status filter
        $eventsFiltered = Event::internalCalendar()
            ->whereHas('status', function ($q) {
                $q->where('status_code', 'approved_internal');
            })
            ->get();

        // Assert: Only approved_internal events returned
        $this->assertEquals(1, $eventsFiltered->count());
        $this->assertEquals('Approved Internal', $eventsFiltered->first()->title);
        $this->assertEquals($this->approvedInternalStatus->id, $eventsFiltered->first()->status_id);

        // Act: Query for published status
        $publishedFiltered = Event::internalCalendar()
            ->whereHas('status', function ($q) {
                $q->where('status_code', 'published');
            })
            ->get();

        // Assert: Only published events returned
        $this->assertEquals(1, $publishedFiltered->count());
        $this->assertEquals('Published', $publishedFiltered->first()->title);
        $this->assertEquals($this->publishedStatus->id, $publishedFiltered->first()->status_id);
    }

    #[Test]
    public function applies_date_range_filter_correctly()
    {
        // Arrange: Create events with different dates
        $januaryEvent = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'January Event',
            'start_date' => '2026-01-15',
            'end_date' => '2026-01-16',
        ]);

        $februaryEvent = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->publishedStatus->id,
            'title' => 'February Event',
            'start_date' => '2026-02-15',
            'end_date' => '2026-02-16',
        ]);

        $marchEvent = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->pendingPublicApprovalStatus->id,
            'title' => 'March Event',
            'start_date' => '2026-03-15',
            'end_date' => '2026-03-16',
        ]);

        // Act: Query with date range filter (January 2026)
        $januaryEvents = Event::internalCalendar()
            ->whereBetween('start_date', ['2026-01-01', '2026-01-31'])
            ->get();

        // Assert: Only January events returned
        $this->assertEquals(1, $januaryEvents->count());
        $this->assertEquals('January Event', $januaryEvents->first()->title);

        // Verify date is within range
        $startDate = $januaryEvents->first()->start_date->format('Y-m-d');
        $this->assertGreaterThanOrEqual('2026-01-01', $startDate);
        $this->assertLessThanOrEqual('2026-01-31', $startDate);

        // Act: Query with broader date range (January-February 2026)
        $twoMonthsEvents = Event::internalCalendar()
            ->whereBetween('start_date', ['2026-01-01', '2026-02-28'])
            ->get();

        // Assert: Both January and February events returned
        $this->assertEquals(2, $twoMonthsEvents->count());
        $titles = $twoMonthsEvents->pluck('title')->toArray();
        $this->assertContains('January Event', $titles);
        $this->assertContains('February Event', $titles);
        $this->assertNotContains('March Event', $titles);
    }

    #[Test]
    public function eager_loads_required_relationships()
    {
        // Arrange: Create event with relationships
        $location = Location::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Test Location',
        ]);

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Event with Relationships',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $event->locations()->attach($location->id);

        // Act: Query with eager loading
        $events = Event::internalCalendar()
            ->with(['status', 'eventType', 'locations', 'organization'])
            ->get();

        // Assert: Relationships are loaded
        $this->assertEquals(1, $events->count());
        $loadedEvent = $events->first();

        // Verify status relationship is loaded
        $this->assertTrue($loadedEvent->relationLoaded('status'));
        $this->assertNotNull($loadedEvent->status);
        $this->assertEquals('approved_internal', $loadedEvent->status->status_code);

        // Verify eventType relationship is loaded
        $this->assertTrue($loadedEvent->relationLoaded('eventType'));
        $this->assertNotNull($loadedEvent->eventType);

        // Verify locations relationship is loaded
        $this->assertTrue($loadedEvent->relationLoaded('locations'));
        $this->assertEquals(1, $loadedEvent->locations->count());
        $this->assertEquals('Test Location', $loadedEvent->locations->first()->name);

        // Verify organization relationship is loaded
        $this->assertTrue($loadedEvent->relationLoaded('organization'));
        $this->assertNotNull($loadedEvent->organization);
    }

    #[Test]
    public function orders_events_by_start_date_ascending()
    {
        // Arrange: Create events in non-chronological order
        $event3 = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->approvedInternalStatus->id,
            'title' => 'Event in 5 days',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(6),
        ]);

        $event1 = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->publishedStatus->id,
            'title' => 'Event in 1 day',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        $event2 = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $this->eventType->id,
            'status_id' => $this->pendingPublicApprovalStatus->id,
            'title' => 'Event in 3 days',
            'start_date' => now()->addDays(3),
            'end_date' => now()->addDays(4),
        ]);

        // Act: Query with ordering by start_date
        $events = Event::internalCalendar()
            ->orderBy('start_date', 'asc')
            ->get();

        // Assert: Events are returned in chronological order
        $this->assertEquals(3, $events->count());
        $this->assertEquals('Event in 1 day', $events[0]->title);
        $this->assertEquals('Event in 3 days', $events[1]->title);
        $this->assertEquals('Event in 5 days', $events[2]->title);

        // Verify dates are in ascending order
        $previousDate = null;
        foreach ($events as $event) {
            $currentDate = $event->start_date;
            if ($previousDate !== null) {
                $this->assertGreaterThanOrEqual($previousDate, $currentDate);
            }
            $previousDate = $currentDate;
        }

        // Verify all have internal calendar statuses
        foreach ($events as $event) {
            $this->assertContains($event->status_id, [
                $this->approvedInternalStatus->id,
                $this->pendingPublicApprovalStatus->id,
                $this->publishedStatus->id,
            ]);
        }
    }
}
