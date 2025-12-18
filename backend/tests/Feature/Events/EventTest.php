<?php

namespace Tests\Feature\Events;

use App\Models\Event;
use App\Models\User;

use App\Models\EventType;
use App\Models\EventSubtype;
use App\Models\Location;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EventTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed only lookup tables
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);  // Seeds event_formats
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
    }

    private function authenticateUser(): User
    {
        $user = User::factory()->create();
        $organization = \App\Models\Organization::factory()->create();
        $user->organizations()->attach($organization->id);
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    /**
     * Get event status ID by status code
     */
    private function getStatusId(string $statusCode): int
    {
        return \DB::table('event_statuses')
            ->where('status_code', $statusCode)
            ->value('id') ?? 1;
    }

    /**
     * Helper: Get valid event_type_id and event_subtype_id
     */
    private function getValidEventTypeIds(): array
    {
        $eventType = EventType::first() ?? EventType::factory()->create();
        $eventSubtype = EventSubtype::where('event_type_id', $eventType->id)->first()
            ?? EventSubtype::factory()->create(['event_type_id' => $eventType->id]);

        return [
            'event_type_id' => $eventType->id,
            'event_subtype_id' => $eventSubtype->id,
        ];
    }

    #[Test]
    public function test_can_list_events(): void
    {
        $this->authenticateUser();

        $response = $this->getJson('/api/v1/events');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data',
                     'links',
                     'meta'
                 ]);

        // Verify data is array
        $this->assertTrue(is_array($response->json('data')));
    }

    #[Test]
    public function test_can_create_event(): void
    {
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        $location = Location::factory()->create(['entity_id' => $organization->id]);
        $eventTypeIds = $this->getValidEventTypeIds();

        $eventData = [
            'title' => 'Test Event Creation',
            'description' => 'Test event description for automated testing',
            'start_date' => now()->addDays(7)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(8)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
            'format_id' => \DB::table('event_formats')->first()->id,
            'status_id' => $this->getStatusId('draft'),
            'entity_id' => $organization->id,
            'is_featured' => false,
            'max_attendees' => 100
        ];

        $response = $this->postJson('/api/v1/events', $eventData);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'title' => 'Test Event Creation'
                 ]);

        // Verify event was created (description is sanitized with <p> tags by HTMLPurifier)
        $this->assertDatabaseHas('events', [
            'title' => 'Test Event Creation',
        ]);

        // Verify description contains the expected text (sanitized)
        $event = Event::where('title', 'Test Event Creation')->first();
        $this->assertStringContainsString('Test event description for automated testing', $event->description);
    }

    #[Test]
    public function test_can_update_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'title' => 'Original Event Title'
        ]);

        $updateData = [
            'title' => 'Updated Event Title',
            'description' => 'Updated event description'
        ];

        $response = $this->putJson("/api/v1/events/{$event->id}", $updateData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Event Title'
        ]);
    }

    #[Test]
    public function test_can_delete_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => $this->getStatusId('draft')
        ]);

        $response = $this->deleteJson("/api/v1/events/{$event->id}");

        $response->assertStatus(200);

        // With SoftDeletes, the record exists but has deleted_at set
        $this->assertSoftDeleted('events', [
            'id' => $event->id
        ]);
    }

    #[Test]
    public function test_can_get_event_statistics(): void
    {
        $this->authenticateUser();

        $response = $this->getJson('/api/v1/events/statistics');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'total',
                         'published',
                         'pending',
                         'draft'
                     ]
                 ]);

        // Verify statistics structure
        $data = $response->json('data');
        $this->assertIsArray($data);
    }

    #[Test]
    public function test_can_duplicate_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'title' => 'Original Event for Duplication'
        ]);

        $response = $this->postJson("/api/v1/events/{$event->id}/duplicate");

        $response->assertStatus(201);

        // Verify duplicate was created with (Copia) suffix
        $this->assertDatabaseHas('events', [
            'title' => 'Original Event for Duplication (Copia)'
        ]);
    }

    #[Test]
    public function test_can_toggle_featured_status(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'is_featured' => false
        ]);

        // Toggle to true
        $response = $this->patchJson("/api/v1/events/{$event->id}/toggle-featured");

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'is_featured' => true
        ]);

        // Toggle back to false
        $response = $this->patchJson("/api/v1/events/{$event->id}/toggle-featured");

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'is_featured' => false
        ]);
    }

    #[Test]
    public function test_can_get_single_event_detail(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'title' => 'Detailed Event Test'
        ]);

        $response = $this->getJson("/api/v1/events/{$event->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'title' => 'Detailed Event Test'
                 ])
                 ->assertJsonStructure([
                     'data' => [
                         'id',
                         'title',
                         'description',
                         'start_date',
                         'end_date'
                     ]
                 ]);
    }

    #[Test]
    public function test_upcoming_scope_filters_future_and_ongoing_events(): void
    {
        $this->authenticateUser();

        // Create events with different dates
        $pastEvent = Event::factory()->create([
            'title' => 'Past Event',
            'start_date' => now()->subDays(5),
            'end_date' => now()->subDays(4),
        ]);

        $ongoingEvent = Event::factory()->create([
            'title' => 'Ongoing Event',
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
        ]);

        $futureEvent = Event::factory()->create([
            'title' => 'Future Event',
            'start_date' => now()->addDays(3),
            'end_date' => now()->addDays(4),
        ]);

        // Apply upcoming scope
        $upcomingEvents = Event::upcoming()->get();

        // Assert only ongoing and future events are included
        $this->assertCount(2, $upcomingEvents);
        $this->assertTrue($upcomingEvents->contains('id', $ongoingEvent->id));
        $this->assertTrue($upcomingEvents->contains('id', $futureEvent->id));
        $this->assertFalse($upcomingEvents->contains('id', $pastEvent->id));
    }

    #[Test]
    public function test_upcoming_scope_excludes_past_events(): void
    {
        $this->authenticateUser();

        // Create only past events
        $pastEvent1 = Event::factory()->create([
            'title' => 'Past Event 1',
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(9),
        ]);

        $pastEvent2 = Event::factory()->create([
            'title' => 'Past Event 2',
            'start_date' => now()->subDays(3),
            'end_date' => now()->subDay(),
        ]);

        // Apply upcoming scope
        $upcomingEvents = Event::upcoming()->get();

        // Assert no events are returned
        $this->assertCount(0, $upcomingEvents);
        $this->assertFalse($upcomingEvents->contains('id', $pastEvent1->id));
        $this->assertFalse($upcomingEvents->contains('id', $pastEvent2->id));
    }

    #[Test]
    public function test_past_scope_filters_past_events(): void
    {
        $this->authenticateUser();

        // Create events with different dates
        $pastEvent = Event::factory()->create([
            'title' => 'Past Event',
            'start_date' => now()->subDays(5),
            'end_date' => now()->subDays(4),
        ]);

        $ongoingEvent = Event::factory()->create([
            'title' => 'Ongoing Event',
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
        ]);

        $futureEvent = Event::factory()->create([
            'title' => 'Future Event',
            'start_date' => now()->addDays(3),
            'end_date' => now()->addDays(4),
        ]);

        // Apply past scope
        $pastEvents = Event::past()->get();

        // Assert only past events are included
        $this->assertCount(1, $pastEvents);
        $this->assertTrue($pastEvents->contains('id', $pastEvent->id));
        $this->assertFalse($pastEvents->contains('id', $ongoingEvent->id));
        $this->assertFalse($pastEvents->contains('id', $futureEvent->id));
    }

    #[Test]
    public function test_past_scope_excludes_upcoming_events(): void
    {
        $this->authenticateUser();

        // Create only future/ongoing events
        $ongoingEvent = Event::factory()->create([
            'title' => 'Ongoing Event',
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
        ]);

        $futureEvent = Event::factory()->create([
            'title' => 'Future Event',
            'start_date' => now()->addDays(2),
            'end_date' => now()->addDays(3),
        ]);

        // Apply past scope
        $pastEvents = Event::past()->get();

        // Assert no events are returned
        $this->assertCount(0, $pastEvents);
        $this->assertFalse($pastEvents->contains('id', $ongoingEvent->id));
        $this->assertFalse($pastEvents->contains('id', $futureEvent->id));
    }

    // ========================================================================
    // NEW TESTS: Date Ordering and Past/Upcoming Events Filtering
    // ========================================================================

    #[Test]
    public function index_returns_upcoming_events_by_default(): void
    {
        $this->authenticateUser();

        // Create 3 upcoming events with different start dates
        $upcoming1 = Event::factory()->create([
            'title' => 'Upcoming Event 1',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(11),
        ]);
        $upcoming2 = Event::factory()->create([
            'title' => 'Upcoming Event 2',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(6),
        ]);
        $upcoming3 = Event::factory()->create([
            'title' => 'Upcoming Event 3',
            'start_date' => now()->addDays(15),
            'end_date' => now()->addDays(16),
        ]);

        // Create 2 past events (should not be returned)
        Event::factory()->create([
            'title' => 'Past Event 1',
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(9),
        ]);
        Event::factory()->create([
            'title' => 'Past Event 2',
            'start_date' => now()->subDays(5),
            'end_date' => now()->subDays(4),
        ]);

        // Act: GET /api/v1/events (without show_past parameter)
        $response = $this->getJson('/api/v1/events');

        // Assert: Returns 200 OK
        $response->assertOk();

        // Assert: Only upcoming events returned (3 total)
        $data = $response->json('data');
        $this->assertCount(3, $data);

        // Assert: Ordered by start_date ASC (closest first)
        // Expected order: upcoming2 (5 days), upcoming1 (10 days), upcoming3 (15 days)
        $this->assertEquals($upcoming2->id, $data[0]['id'], 'First event should be closest (5 days)');
        $this->assertEquals($upcoming1->id, $data[1]['id'], 'Second event should be 10 days away');
        $this->assertEquals($upcoming3->id, $data[2]['id'], 'Third event should be furthest (15 days)');

        // Assert: Verify start dates are in ascending order
        $startDate1 = \Carbon\Carbon::parse($data[0]['start_date']);
        $startDate2 = \Carbon\Carbon::parse($data[1]['start_date']);
        $startDate3 = \Carbon\Carbon::parse($data[2]['start_date']);
        $this->assertTrue($startDate1->lt($startDate2));
        $this->assertTrue($startDate2->lt($startDate3));
    }

    #[Test]
    public function index_returns_past_events_when_show_past_is_1(): void
    {
        $this->authenticateUser();

        // Create 3 past events with different end dates
        $past1 = Event::factory()->create([
            'title' => 'Past Event 1',
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(5),  // More recent
        ]);
        $past2 = Event::factory()->create([
            'title' => 'Past Event 2',
            'start_date' => now()->subDays(20),
            'end_date' => now()->subDays(15),  // Oldest
        ]);
        $past3 = Event::factory()->create([
            'title' => 'Past Event 3',
            'start_date' => now()->subDays(8),
            'end_date' => now()->subDays(2),  // Most recent
        ]);

        // Create 2 upcoming events (should not be returned)
        Event::factory()->create([
            'title' => 'Upcoming Event 1',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(6),
        ]);
        Event::factory()->create([
            'title' => 'Upcoming Event 2',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(11),
        ]);

        // Act: GET /api/v1/events?show_past=1
        $response = $this->getJson('/api/v1/events?show_past=1');

        // Assert: Returns 200 OK
        $response->assertOk();

        // Assert: Only past events returned (3 total)
        $data = $response->json('data');
        $this->assertCount(3, $data);

        // Assert: Ordered by end_date DESC (most recent first)
        // Expected order: past3 (2 days ago), past1 (5 days ago), past2 (15 days ago)
        $this->assertEquals($past3->id, $data[0]['id'], 'First should be most recent past event');
        $this->assertEquals($past1->id, $data[1]['id'], 'Second should be mid-recent past event');
        $this->assertEquals($past2->id, $data[2]['id'], 'Third should be oldest past event');

        // Assert: Verify end dates are in descending order
        $endDate1 = \Carbon\Carbon::parse($data[0]['end_date']);
        $endDate2 = \Carbon\Carbon::parse($data[1]['end_date']);
        $endDate3 = \Carbon\Carbon::parse($data[2]['end_date']);
        $this->assertTrue($endDate1->gt($endDate2));
        $this->assertTrue($endDate2->gt($endDate3));
    }

    #[Test]
    public function index_orders_upcoming_events_by_start_date_asc(): void
    {
        $this->authenticateUser();

        // Create upcoming events in random order
        $eventFar = Event::factory()->create([
            'start_date' => now()->addDays(30),
            'end_date' => now()->addDays(31),
        ]);
        $eventNear = Event::factory()->create([
            'start_date' => now()->addDays(2),
            'end_date' => now()->addDays(3),
        ]);
        $eventMid = Event::factory()->create([
            'start_date' => now()->addDays(15),
            'end_date' => now()->addDays(16),
        ]);

        // Act
        $response = $this->getJson('/api/v1/events');

        // Assert: Ordered chronologically (ASC)
        $data = $response->json('data');
        $this->assertEquals($eventNear->id, $data[0]['id']);
        $this->assertEquals($eventMid->id, $data[1]['id']);
        $this->assertEquals($eventFar->id, $data[2]['id']);
    }

    #[Test]
    public function index_orders_past_events_by_end_date_desc(): void
    {
        $this->authenticateUser();

        // Create past events in random order
        $eventOldest = Event::factory()->create([
            'start_date' => now()->subDays(30),
            'end_date' => now()->subDays(29),
        ]);
        $eventRecent = Event::factory()->create([
            'start_date' => now()->subDays(3),
            'end_date' => now()->subDays(2),
        ]);
        $eventMid = Event::factory()->create([
            'start_date' => now()->subDays(15),
            'end_date' => now()->subDays(14),
        ]);

        // Act
        $response = $this->getJson('/api/v1/events?show_past=1');

        // Assert: Ordered reverse chronologically (DESC)
        $data = $response->json('data');
        $this->assertEquals($eventRecent->id, $data[0]['id']);
        $this->assertEquals($eventMid->id, $data[1]['id']);
        $this->assertEquals($eventOldest->id, $data[2]['id']);
    }

    #[Test]
    public function index_filters_by_status_code(): void
    {
        $this->authenticateUser();

        $publishedStatusId = $this->getStatusId('published');
        $draftStatusId = $this->getStatusId('draft');

        // Create upcoming events with different statuses
        $publishedEvent = Event::factory()->create([
            'title' => 'Published Event',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(6),
            'status_id' => $publishedStatusId,
        ]);

        Event::factory()->create([
            'title' => 'Draft Event',
            'start_date' => now()->addDays(7),
            'end_date' => now()->addDays(8),
            'status_id' => $draftStatusId,
        ]);

        // Act: Filter by status code (string)
        $response = $this->getJson('/api/v1/events?status=published');

        // Assert: Returns only published event
        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals($publishedEvent->id, $data[0]['id']);
        $this->assertEquals('published', $data[0]['status']['status_code'] ?? $data[0]['status']['code']);
    }

    #[Test]
    public function index_filters_by_status_id(): void
    {
        $this->authenticateUser();

        $publishedStatusId = $this->getStatusId('published');
        $draftStatusId = $this->getStatusId('draft');

        // Create upcoming events with different statuses
        $publishedEvent = Event::factory()->create([
            'title' => 'Published Event',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(6),
            'status_id' => $publishedStatusId,
        ]);

        Event::factory()->create([
            'title' => 'Draft Event',
            'start_date' => now()->addDays(7),
            'end_date' => now()->addDays(8),
            'status_id' => $draftStatusId,
        ]);

        // Act: Filter by status_id (integer) - backward compatibility
        $response = $this->getJson("/api/v1/events?status_id={$publishedStatusId}");

        // Assert: Returns only published event
        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals($publishedEvent->id, $data[0]['id']);
    }

    #[Test]
    public function index_combines_show_past_with_status_filter(): void
    {
        $this->authenticateUser();

        $publishedStatusId = $this->getStatusId('published');
        $draftStatusId = $this->getStatusId('draft');

        // Create past published event
        $pastPublished = Event::factory()->create([
            'title' => 'Past Published Event',
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(9),
            'status_id' => $publishedStatusId,
        ]);

        // Create past draft event (should not be returned)
        Event::factory()->create([
            'title' => 'Past Draft Event',
            'start_date' => now()->subDays(8),
            'end_date' => now()->subDays(7),
            'status_id' => $draftStatusId,
        ]);

        // Create upcoming published event (should not be returned)
        Event::factory()->create([
            'title' => 'Upcoming Published Event',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(6),
            'status_id' => $publishedStatusId,
        ]);

        // Act: Combine show_past with status filter
        $response = $this->getJson('/api/v1/events?show_past=1&status=published');

        // Assert: Returns only past published event
        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals($pastPublished->id, $data[0]['id']);
        $this->assertEquals('published', $data[0]['status']['status_code'] ?? $data[0]['status']['code']);
    }
}
