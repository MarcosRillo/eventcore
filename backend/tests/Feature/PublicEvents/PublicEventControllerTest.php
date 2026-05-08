<?php

namespace Tests\Feature\PublicEvents;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Location;
use App\Models\Organization;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests for PublicEventController
 *
 * Tests public endpoints for event types that don't require authentication.
 * Created: December 2, 2025 (Category → EventType migration)
 */
class PublicEventControllerTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;

    private EventStatus $publishedStatus;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed required data
        $this->seed(UserRolesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
        $this->seed(EventStatusesSeeder::class);
        $this->seed(EventTypesSeeder::class);

        // Create test organization
        $this->organization = Organization::factory()->create();

        // Get published status
        $this->publishedStatus = EventStatus::where('status_code', 'published')->first();
    }

    #[Test]
    public function it_returns_active_event_types()
    {
        // Arrange: Create active and inactive event types
        EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Cultural',
            'is_active' => true,
        ]);

        EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Business',
            'is_active' => false,  // Inactive - should NOT appear
        ]);

        EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Deportivo',
            'is_active' => true,
        ]);

        // Act: Call the public event-types endpoint
        $response = $this->getJson('/api/v1/public/event-types');

        // Assert: Only active event types returned
        $response->assertOk();
        $response->assertJsonCount(2, 'data');  // Only 2 active types
        $response->assertJsonFragment(['name' => 'Cultural']);
        $response->assertJsonFragment(['name' => 'Deportivo']);
        $response->assertJsonMissing(['name' => 'Business']);  // Inactive excluded
    }

    #[Test]
    public function it_returns_empty_array_when_no_active_event_types()
    {
        // Arrange: Create only inactive event types
        EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Inactive Type',
            'is_active' => false,
        ]);

        // Act
        $response = $this->getJson('/api/v1/public/event-types');

        // Assert: Empty array returned
        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    }

    #[Test]
    public function it_returns_event_types_sorted_alphabetically()
    {
        // Arrange: Create types in non-alphabetical order
        EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Zebra Event',
            'is_active' => true,
        ]);

        EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Apple Event',
            'is_active' => true,
        ]);

        EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Banana Event',
            'is_active' => true,
        ]);

        // Act
        $response = $this->getJson('/api/v1/public/event-types');

        // Assert: Returned in alphabetical order
        $response->assertOk();
        $data = $response->json('data');
        $this->assertEquals('Apple Event', $data[0]['name']);
        $this->assertEquals('Banana Event', $data[1]['name']);
        $this->assertEquals('Zebra Event', $data[2]['name']);
    }

    #[Test]
    public function it_returns_subtypes_for_specific_event_type()
    {
        // Arrange: Create event type with subtypes
        $eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Cultural',
            'is_active' => true,
        ]);

        EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Music Festival',
            'is_active' => true,
        ]);

        EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Art Exhibition',
            'is_active' => false,  // Inactive - should NOT appear
        ]);

        EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Theatre Performance',
            'is_active' => true,
        ]);

        // Act: Call the subtypes endpoint
        $response = $this->getJson("/api/v1/public/event-types/{$eventType->id}/subtypes");

        // Assert: Only active subtypes returned
        $response->assertOk();
        $response->assertJsonCount(2, 'data');  // Only 2 active subtypes
        $response->assertJsonFragment(['name' => 'Music Festival']);
        $response->assertJsonFragment(['name' => 'Theatre Performance']);
        $response->assertJsonMissing(['name' => 'Art Exhibition']);  // Inactive excluded
    }

    #[Test]
    public function it_returns_empty_array_for_event_type_with_no_active_subtypes()
    {
        // Arrange: Create event type with only inactive subtypes
        $eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Cultural',
            'is_active' => true,
        ]);

        EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Inactive Subtype',
            'is_active' => false,
        ]);

        // Act
        $response = $this->getJson("/api/v1/public/event-types/{$eventType->id}/subtypes");

        // Assert: Empty array returned
        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    }

    #[Test]
    public function it_returns_subtypes_sorted_alphabetically()
    {
        // Arrange: Create subtypes in non-alphabetical order
        $eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Cultural',
            'is_active' => true,
        ]);

        EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Zebra Show',
            'is_active' => true,
        ]);

        EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Apple Concert',
            'is_active' => true,
        ]);

        // Act
        $response = $this->getJson("/api/v1/public/event-types/{$eventType->id}/subtypes");

        // Assert: Returned in alphabetical order
        $response->assertOk();
        $data = $response->json('data');
        $this->assertEquals('Apple Concert', $data[0]['name']);
        $this->assertEquals('Zebra Show', $data[1]['name']);
    }

    #[Test]
    public function it_returns_404_for_nonexistent_event_type()
    {
        // Act: Request subtypes for non-existent event type
        $response = $this->getJson('/api/v1/public/event-types/99999/subtypes');

        // Assert: 404 error returned
        $response->assertNotFound();
    }

    #[Test]
    public function it_does_not_return_subtypes_from_different_event_types()
    {
        // Arrange: Create two event types with their own subtypes
        $culturalType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Cultural',
            'is_active' => true,
        ]);

        $businessType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Business',
            'is_active' => true,
        ]);

        EventSubtype::factory()->create([
            'event_type_id' => $culturalType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Music Festival',
            'is_active' => true,
        ]);

        EventSubtype::factory()->create([
            'event_type_id' => $businessType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Conference',
            'is_active' => true,
        ]);

        // Act: Request subtypes for Cultural type only
        $response = $this->getJson("/api/v1/public/event-types/{$culturalType->id}/subtypes");

        // Assert: Only Cultural subtypes returned
        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonFragment(['name' => 'Music Festival']);
        $response->assertJsonMissing(['name' => 'Conference']);  // From different type
    }

    #[Test]
    public function event_types_endpoint_returns_correct_json_structure()
    {
        // Arrange
        EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Test Type',
            'is_active' => true,
        ]);

        // Act
        $response = $this->getJson('/api/v1/public/event-types');

        // Assert: Correct structure
        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name'],
            ],
        ]);
    }

    #[Test]
    public function subtypes_endpoint_returns_correct_json_structure()
    {
        // Arrange
        $eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ]);

        EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Test Subtype',
            'is_active' => true,
        ]);

        // Act
        $response = $this->getJson("/api/v1/public/event-types/{$eventType->id}/subtypes");

        // Assert: Correct structure
        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'event_type_id'],
            ],
        ]);
    }

    #[Test]
    public function test_featured_respects_limit_parameter()
    {
        // Arrange: Create 10 featured events
        $events = [];
        for ($i = 0; $i < 10; $i++) {
            $events[] = Event::factory()->create([
                'entity_id' => $this->organization->id,
                'is_featured' => true,
                'start_date' => now()->addDays($i + 1),
                'end_date' => now()->addDays($i + 2),
                'status_id' => $this->publishedStatus->id,
            ]);
        }

        // Act: Request with default limit (6)
        $responseDefault = $this->getJson('/api/v1/public/events/featured');

        // Assert: Returns exactly 6 events
        $responseDefault->assertOk();
        $responseDefault->assertJsonCount(6, 'data');

        // Act: Request with custom limit (4)
        $responseCustom = $this->getJson('/api/v1/public/events/featured?limit=4');

        // Assert: Returns exactly 4 events
        $responseCustom->assertOk();
        $responseCustom->assertJsonCount(4, 'data');

        // Act: Request with limit exceeding max (25 > 20 max)
        $responseCapped = $this->getJson('/api/v1/public/events/featured?limit=25');

        // Assert: Returns 422 with validation error for exceeding max
        $responseCapped->assertUnprocessable();
        $responseCapped->assertJsonValidationErrors(['limit']);
    }

    #[Test]
    public function test_featured_excludes_past_events()
    {
        // Arrange: Create featured events in the past
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'is_featured' => true,
            'start_date' => now()->subDays(5),
            'end_date' => now()->subDays(4),
            'status_id' => $this->publishedStatus->id,
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'is_featured' => true,
            'start_date' => now()->subDays(1),
            'end_date' => now()->addHours(1),
            'status_id' => $this->publishedStatus->id,
        ]);

        // Arrange: Create featured events in the future
        $futureEvent1 = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Future Event 1',
            'is_featured' => true,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
            'status_id' => $this->publishedStatus->id,
        ]);

        $futureEvent2 = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Future Event 2',
            'is_featured' => true,
            'start_date' => now()->addDays(3),
            'end_date' => now()->addDays(4),
            'status_id' => $this->publishedStatus->id,
        ]);

        // Act: Request featured events
        $response = $this->getJson('/api/v1/public/events/featured');

        // Assert: Only future events returned
        $response->assertOk();
        $response->assertJsonCount(2, 'data');
        $response->assertJsonFragment(['title' => 'Future Event 1']);
        $response->assertJsonFragment(['title' => 'Future Event 2']);

        // Assert: Past events excluded
        $data = $response->json('data');
        foreach ($data as $event) {
            $this->assertGreaterThanOrEqual(now()->toDateString(), date('Y-m-d', strtotime($event['start_date'])));
        }
    }

    #[Test]
    public function test_featured_orders_by_start_date()
    {
        // Arrange: Create featured events in non-chronological order
        $event1 = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Event in 5 days',
            'is_featured' => true,
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(6),
            'status_id' => $this->publishedStatus->id,
        ]);

        $event2 = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Event in 1 day',
            'is_featured' => true,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
            'status_id' => $this->publishedStatus->id,
        ]);

        $event3 = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Event in 3 days',
            'is_featured' => true,
            'start_date' => now()->addDays(3),
            'end_date' => now()->addDays(4),
            'status_id' => $this->publishedStatus->id,
        ]);

        // Act: Request featured events
        $response = $this->getJson('/api/v1/public/events/featured');

        // Assert: Returned in chronological order (ascending by start_date)
        $response->assertOk();
        $data = $response->json('data');

        $this->assertEquals('Event in 1 day', $data[0]['title']);
        $this->assertEquals('Event in 3 days', $data[1]['title']);
        $this->assertEquals('Event in 5 days', $data[2]['title']);

        // Verify dates are in ascending order
        $previousDate = null;
        foreach ($data as $event) {
            $currentDate = strtotime($event['start_date']);
            if ($previousDate !== null) {
                $this->assertGreaterThanOrEqual($previousDate, $currentDate);
            }
            $previousDate = $currentDate;
        }
    }

    #[Test]
    public function test_featured_loads_relationships()
    {
        // Arrange: Create event with relationships
        $eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Cultural Event',
            'is_active' => true,
        ]);

        $eventSubtype = EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Music Festival',
            'is_active' => true,
        ]);

        $location = Location::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Teatro San Martín',
            'city' => 'Demo City',
        ]);

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $eventType->id,
            'event_subtype_id' => $eventSubtype->id,
            'is_featured' => true,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
            'status_id' => $this->publishedStatus->id,
        ]);

        $event->locations()->attach($location->id);

        // Act: Request featured events
        $response = $this->getJson('/api/v1/public/events/featured');

        // Assert: Relationships are loaded
        $response->assertOk();
        $response->assertJsonFragment(['name' => 'Cultural Event']);
        $response->assertJsonFragment(['name' => 'Music Festival']);
        $response->assertJsonFragment(['name' => 'Teatro San Martín']);

        // Verify relationship structure
        $data = $response->json('data')[0];
        $this->assertArrayHasKey('event_type', $data);
        $this->assertArrayHasKey('event_subtype', $data);
        $this->assertArrayHasKey('locations', $data);
        $this->assertIsArray($data['locations']);
        $this->assertGreaterThan(0, count($data['locations']));
    }

    #[Test]
    public function test_index_pagination_works_correctly()
    {
        // Arrange: Create 25 published events
        for ($i = 0; $i < 25; $i++) {
            Event::factory()->create([
                'entity_id' => $this->organization->id,
                'status_id' => $this->publishedStatus->id,
                'start_date' => now()->addDays($i + 1),
                'end_date' => now()->addDays($i + 2),
            ]);
        }

        // Act: Request first page with default per_page (15)
        $responsePage1 = $this->getJson('/api/v1/public/events');

        // Assert: Returns 15 events with pagination metadata
        $responsePage1->assertOk();
        $this->assertEquals(15, count($responsePage1->json('data')));
        $this->assertEquals(25, $responsePage1->json('meta.total'));
        $this->assertEquals(1, $responsePage1->json('meta.current_page'));

        // Act: Request with custom per_page (10)
        $responseCustom = $this->getJson('/api/v1/public/events?per_page=10');

        // Assert: Returns 10 events
        $responseCustom->assertOk();
        $this->assertEquals(10, count($responseCustom->json('data')));
        $this->assertEquals(25, $responseCustom->json('meta.total'));

        // Act: Request second page
        $responsePage2 = $this->getJson('/api/v1/public/events?page=2&per_page=10');

        // Assert: Returns 10 events from second page
        $responsePage2->assertOk();
        $this->assertEquals(10, count($responsePage2->json('data')));
        $this->assertEquals(2, $responsePage2->json('meta.current_page'));
    }

    #[Test]
    public function test_index_filters_by_event_type_id()
    {
        // Arrange: Create two event types
        $culturalType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Cultural',
            'is_active' => true,
        ]);

        $businessType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Business',
            'is_active' => true,
        ]);

        // Create events with different types
        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $culturalType->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $businessType->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Filter by Cultural type
        $response = $this->getJson("/api/v1/public/events?event_type_id={$culturalType->id}");

        // Assert: Only Cultural events returned
        $response->assertOk();
        $this->assertEquals(3, count($response->json('data')));
        $this->assertEquals(3, $response->json('meta.total'));

        // Verify all events have the correct type
        foreach ($response->json('data') as $event) {
            $this->assertEquals($culturalType->id, $event['event_type_id']);
        }
    }

    #[Test]
    public function test_index_filters_by_search_query()
    {
        // Arrange: Create events with specific unique titles
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'SEARCHTEST Festival de Arte',
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Concierto de Rock',
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'SEARCHTEST Muestra Cultural',
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Search for unique term "SEARCHTEST"
        $response = $this->getJson('/api/v1/public/events?search=SEARCHTEST');

        // Assert: Only events with "SEARCHTEST" in title returned
        $response->assertOk();
        $data = $response->json('data');
        $this->assertEquals(2, count($data), 'Expected exactly 2 events with SEARCHTEST in title');

        // Verify both matching titles are present
        $titles = array_column($data, 'title');
        $this->assertContains('SEARCHTEST Festival de Arte', $titles);
        $this->assertContains('SEARCHTEST Muestra Cultural', $titles);
    }

    #[Test]
    public function test_index_returns_only_published_events()
    {
        // Arrange: Get draft status
        $draftStatus = EventStatus::where('status_code', 'draft')->first();

        // Create published events
        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
            'title' => 'Published Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Create draft events (should NOT appear)
        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $draftStatus->id,
            'title' => 'Draft Event',
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Request all events
        $response = $this->getJson('/api/v1/public/events');

        // Assert: Only published events returned
        $response->assertOk();
        $this->assertEquals(3, count($response->json('data')));

        // Verify all returned events have published status
        foreach ($response->json('data') as $event) {
            $this->assertStringContainsString('Published Event', $event['title']);
            $this->assertEquals('published', $event['status']['status_code']);
        }

        // Verify draft events are NOT in response
        $response->assertJsonMissing(['title' => 'Draft Event']);
    }

    #[Test]
    public function test_index_filters_combined()
    {
        // Arrange: Create two event types
        $culturalType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Cultural',
            'is_active' => true,
        ]);

        $businessType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Business',
            'is_active' => true,
        ]);

        // Create matching event (Cultural + contains "Unique")
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Unique Cultural Festival',
            'event_type_id' => $culturalType->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Create non-matching events
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Unique Business Conference',
            'event_type_id' => $businessType->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Generic Cultural Event',
            'event_type_id' => $culturalType->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Apply multiple filters (Cultural type + search for "Unique")
        $response = $this->getJson("/api/v1/public/events?event_type_id={$culturalType->id}&search=Unique");

        // Assert: Only matching event returned
        $response->assertOk();
        $this->assertEquals(1, count($response->json('data')));
        $response->assertJsonFragment(['title' => 'Unique Cultural Festival']);
        $response->assertJsonMissing(['title' => 'Unique Business Conference']);
        $response->assertJsonMissing(['title' => 'Generic Cultural Event']);
    }

    #[Test]
    public function test_index_rejects_invalid_event_type_id()
    {
        // Act: Request with non-existent event_type_id
        $response = $this->getJson('/api/v1/public/events?event_type_id=99999');

        // Assert: Validation error returned
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('event_type_id');
    }

    #[Test]
    public function test_index_rejects_per_page_exceeding_max()
    {
        // Arrange: Create some published events
        for ($i = 0; $i < 10; $i++) {
            Event::factory()->create([
                'entity_id' => $this->organization->id,
                'status_id' => $this->publishedStatus->id,
                'start_date' => now()->addDays($i + 1),
                'end_date' => now()->addDays($i + 2),
            ]);
        }

        // Act: Request with per_page exceeding max (101 > 100)
        $response = $this->getJson('/api/v1/public/events?per_page=101');

        // Assert: Validation error returned
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('per_page');

        // Act: Request with per_page at max (100) - should work
        $responseValid = $this->getJson('/api/v1/public/events?per_page=100');

        // Assert: Returns OK with up to 100 events
        $responseValid->assertOk();
        $this->assertLessThanOrEqual(100, count($responseValid->json('data')));
    }

    #[Test]
    public function test_index_loads_relationships()
    {
        // Arrange: Create event with relationships
        $eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Cultural',
            'is_active' => true,
        ]);

        $eventSubtype = EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
            'name' => 'Theatre',
            'is_active' => true,
        ]);

        $location = Location::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Teatro Nacional',
        ]);

        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'event_type_id' => $eventType->id,
            'event_subtype_id' => $eventSubtype->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);
        $event->locations()->attach($location->id);

        // Act: Request events
        $response = $this->getJson('/api/v1/public/events');

        // Assert: Relationships are loaded
        $response->assertOk();
        $data = $response->json('data')[0];
        $this->assertArrayHasKey('event_type', $data);
        $this->assertArrayHasKey('event_subtype', $data);
        $this->assertArrayHasKey('locations', $data);
        $this->assertIsArray($data['locations']);
        $this->assertEquals('Cultural', $data['event_type']['name']);
        $this->assertEquals('Theatre', $data['event_subtype']['name']);
        $this->assertEquals('Teatro Nacional', $data['locations'][0]['name']);
    }

    #[Test]
    public function test_show_returns_published_event_by_id()
    {
        // Arrange: Create a published event
        $event = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Festival Cultural 2025',
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Request the event by ID
        $response = $this->getJson("/api/v1/public/events/{$event->id}");

        // Assert: Returns 200 with event data
        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'id',
                'title',
                'description',
                'start_date',
                'end_date',
            ],
        ]);
        // Verify sensitive admin fields are NOT exposed to public
        $response->assertJsonMissing(['approval_history']);
        $this->assertArrayNotHasKey('status_id', $response->json('data'));
        $this->assertArrayNotHasKey('created_by', $response->json('data'));
        $this->assertArrayNotHasKey('approved_by', $response->json('data'));
        $response->assertJsonFragment([
            'id' => $event->id,
            'title' => 'Festival Cultural 2025',
        ]);
    }

    #[Test]
    public function test_show_returns_404_for_nonexistent_or_unpublished_event()
    {
        // Arrange: Create a draft event
        $draftStatus = EventStatus::where('status_code', 'draft')->first();
        $draftEvent = Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $draftStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Request draft event (should return 404)
        $responseDraft = $this->getJson("/api/v1/public/events/{$draftEvent->id}");

        // Assert: Returns 404 for draft event
        $responseDraft->assertNotFound();
        $responseDraft->assertJsonFragment(['message' => 'Event not found or not published']);

        // Act: Request non-existent event
        $responseNonexistent = $this->getJson('/api/v1/public/events/99999');

        // Assert: Returns 404 for non-existent event
        $responseNonexistent->assertNotFound();
        $responseNonexistent->assertJsonFragment(['message' => 'Event not found or not published']);
    }

    #[Test]
    public function test_calendar_month_returns_events_for_valid_month()
    {
        // Arrange: Create events in January 2026
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => '2026-01-15',
            'end_date' => '2026-01-16',
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => '2026-01-20',
            'end_date' => '2026-01-21',
        ]);

        // Act: Request calendar for January 2026
        $response = $this->getJson('/api/v1/public/events/calendar/2026/1');

        // Assert: Returns correct structure with events
        $response->assertOk();
        $response->assertJsonStructure([
            'events',
            'calendar',
            'month_info',
        ]);
        $this->assertIsArray($response->json('events'));
        $this->assertEquals(2, count($response->json('events')));
    }

    #[Test]
    public function test_calendar_month_returns_400_for_invalid_parameters()
    {
        // Act: Request with invalid year
        $responseInvalidYear = $this->getJson('/api/v1/public/events/calendar/2050/1');

        // Assert: Returns 400 for out-of-range year
        $responseInvalidYear->assertStatus(400);

        // Act: Request with invalid month
        $responseInvalidMonth = $this->getJson('/api/v1/public/events/calendar/2025/13');

        // Assert: Returns 400 for invalid month
        $responseInvalidMonth->assertStatus(400);
    }

    #[Test]
    public function test_upcoming_returns_future_published_events()
    {
        // Arrange: Create past, present, and future events
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Past Event',
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->subDays(1),
            'end_date' => now(),
        ]);

        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'title' => 'Upcoming Event',
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Request upcoming events
        $response = $this->getJson('/api/v1/public/events/upcoming');

        // Assert: Only future events returned
        $response->assertOk();
        $response->assertJsonStructure(['data']);
        $data = $response->json('data');
        $this->assertEquals(3, count($data));

        // Verify all returned events are in the future
        foreach ($data as $event) {
            $this->assertGreaterThanOrEqual(now()->toDateString(), date('Y-m-d', strtotime($event['start_date'])));
        }
    }

    #[Test]
    public function test_upcoming_respects_limit_parameter()
    {
        // Arrange: Create multiple upcoming events
        Event::factory()->count(15)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Request with custom limit
        $responseCustom = $this->getJson('/api/v1/public/events/upcoming?limit=5');

        // Assert: Returns exactly 5 events
        $responseCustom->assertOk();
        $responseCustom->assertJsonCount(5, 'data');

        // Act: Request with limit exceeding max (55 > 50 max)
        $responseCapped = $this->getJson('/api/v1/public/events/upcoming?limit=55');

        // Assert: Returns 422 with validation error for exceeding max
        $responseCapped->assertUnprocessable();
        $responseCapped->assertJsonValidationErrors(['limit']);
    }

    #[Test]
    public function test_search_returns_matching_events()
    {
        // Arrange: Create events with searchable content
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Festival Internacional de Jazz',
            'description' => 'Gran evento musical',
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Concierto de Rock',
            'description' => 'Evento de rock nacional',
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Festival de Folklore',
            'description' => 'Celebración cultural',
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Search for "Festival"
        $response = $this->getJson('/api/v1/public/events/search?q=Festival');

        // Assert: Returns matching events with metadata
        $response->assertOk();
        $response->assertJsonStructure([
            'data',
            'search_query',
            'total_results',
        ]);
        $this->assertEquals('Festival', $response->json('search_query'));
        $this->assertEquals(2, $response->json('total_results'));
    }

    #[Test]
    public function test_search_requires_query_parameter()
    {
        // Act: Request search without 'q' parameter
        $response = $this->getJson('/api/v1/public/events/search');

        // Assert: Returns 422 validation error
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('q');
    }

    #[Test]
    public function test_search_filters_by_event_type()
    {
        // Arrange: Create event type
        $culturalType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Cultural',
            'is_active' => true,
        ]);

        $businessType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Business',
            'is_active' => true,
        ]);

        // Create events with "Meeting" in title
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Cultural Meeting',
            'event_type_id' => $culturalType->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'title' => 'Business Meeting',
            'event_type_id' => $businessType->id,
            'status_id' => $this->publishedStatus->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
        ]);

        // Act: Search for "Meeting" filtered by Cultural type
        $response = $this->getJson("/api/v1/public/events/search?q=Meeting&event_type_id={$culturalType->id}");

        // Assert: Only Cultural events returned
        $response->assertOk();
        $this->assertEquals(1, $response->json('total_results'));
        $response->assertJsonFragment(['title' => 'Cultural Meeting']);
    }

    #[Test]
    public function stats_endpoint_returns_correct_structure()
    {
        // Arrange: No specific setup needed

        // Act
        $response = $this->getJson('/api/v1/public/stats');

        // Assert
        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'total_events',
                'total_event_types',
                'events_this_month',
            ],
        ]);
    }

    #[Test]
    public function stats_endpoint_returns_valid_numbers()
    {
        // Act
        $response = $this->getJson('/api/v1/public/stats');

        // Assert: All values should be integers >= 0
        $response->assertOk();
        $data = $response->json('data');

        $this->assertIsInt($data['total_events']);
        $this->assertGreaterThanOrEqual(0, $data['total_events']);

        $this->assertIsInt($data['total_event_types']);
        $this->assertGreaterThanOrEqual(0, $data['total_event_types']);

        $this->assertIsInt($data['events_this_month']);
        $this->assertGreaterThanOrEqual(0, $data['events_this_month']);
    }
}
