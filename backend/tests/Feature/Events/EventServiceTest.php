<?php

namespace Tests\Feature\Events;

use App\Features\Events\Services\EventService;
use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EventServiceTest extends TestCase
{
    use RefreshDatabase;

    private EventService $service;

    private User $user;

    private Organization $organization;

    private EventType $eventType;

    private EventSubtype $eventSubtype;

    private Location $location;

    private EventStatus $draftStatus;

    private EventStatus $publishedStatus;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);

        $this->service = new EventService;

        // Create organization
        $this->organization = Organization::factory()->create();

        // Create user and attach to organization
        $this->user = User::factory()->create();
        $this->user->organizations()->attach($this->organization->id);

        // Create event type and subtype
        $this->eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ]);

        $this->eventSubtype = EventSubtype::factory()->create([
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ]);

        // Create location
        $this->location = Location::factory()->create([
            'entity_id' => $this->organization->id,
        ]);

        // Get statuses
        $this->draftStatus = EventStatus::where('status_code', 'draft')->first();
        $this->publishedStatus = EventStatus::where('status_code', 'published')->first();
    }

    // ==================== getAllEvents TESTS ====================

    #[Test]
    public function test_get_all_events_returns_paginated_results(): void
    {
        Event::factory()->count(5)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
        ]);

        $result = $this->service->getAllEvents();

        $this->assertInstanceOf(\Illuminate\Contracts\Pagination\LengthAwarePaginator::class, $result);
        $this->assertGreaterThanOrEqual(5, $result->total());
        $this->assertTrue($result->hasPages() || $result->total() <= $result->perPage());
    }

    #[Test]
    public function test_get_all_events_filters_by_search_term(): void
    {
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'Festival de Jazz Tucumán',
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'Feria de Artesanías',
        ]);

        $result = $this->service->getAllEvents(['search' => 'Jazz']);

        $this->assertEquals(1, $result->total());
        $this->assertEquals('Festival de Jazz Tucumán', $result->items()[0]->title);
    }

    #[Test]
    public function test_get_all_events_filters_by_event_type_id(): void
    {
        // Create another event type for comparison
        $otherEventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ]);

        // Events with main event type
        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'event_type_id' => $this->eventType->id,
        ]);

        // Events with other event type (should not be returned)
        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'event_type_id' => $otherEventType->id,
        ]);

        $result = $this->service->getAllEvents(['event_type_id' => $this->eventType->id]);

        $this->assertEquals(3, $result->total());
        foreach ($result->items() as $event) {
            $this->assertEquals($this->eventType->id, $event->event_type_id);
        }
    }

    #[Test]
    public function test_get_all_events_filters_by_status_id(): void
    {
        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
        ]);

        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
        ]);

        $result = $this->service->getAllEvents(['status_id' => $this->publishedStatus->id]);

        $this->assertEquals(3, $result->total());
        foreach ($result->items() as $event) {
            $this->assertEquals($this->publishedStatus->id, $event->status_id);
        }
    }

    #[Test]
    public function test_get_all_events_filters_by_date_range(): void
    {
        // Event in the past
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'start_date' => now()->subDays(30),
            'end_date' => now()->subDays(25),
        ]);

        // Event in target range
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'Target Event',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(7),
        ]);

        // Event in the future
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'start_date' => now()->addDays(60),
            'end_date' => now()->addDays(65),
        ]);

        $result = $this->service->getAllEvents([
            'start_date' => now()->format('Y-m-d'),
            'end_date' => now()->addDays(30)->format('Y-m-d'),
        ]);

        $this->assertEquals(1, $result->total());
        $this->assertEquals('Target Event', $result->items()[0]->title);
    }

    #[Test]
    public function test_get_all_events_combines_multiple_filters(): void
    {
        // Event matching all filters (unique title to avoid factory interference)
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
            'title' => 'XYZZY123 Festival Published',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(7),
        ]);

        // Event with different status
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'XYZZY123 Festival Draft',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(7),
        ]);

        // Event with different title
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
            'title' => 'Other Festival Published',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(7),
        ]);

        $result = $this->service->getAllEvents([
            'search' => 'XYZZY123',
            'status_id' => $this->publishedStatus->id,
        ]);

        $this->assertEquals(1, $result->total());
        $this->assertEquals('XYZZY123 Festival Published', $result->items()[0]->title);
    }

    // ==================== getEventsByStatus TESTS ====================

    #[Test]
    public function test_get_events_by_status_returns_correct_events(): void
    {
        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
        ]);

        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
        ]);

        $result = $this->service->getEventsByStatus('published');

        $this->assertEquals(3, $result->total());
        foreach ($result->items() as $event) {
            $this->assertEquals('published', $event->status->status_code);
        }
    }

    #[Test]
    public function test_get_events_by_status_returns_empty_for_no_matches(): void
    {
        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
        ]);

        $result = $this->service->getEventsByStatus('published');

        $this->assertEquals(0, $result->total());
        $this->assertEmpty($result->items());
    }

    // ==================== getUpcomingEvents TESTS ====================

    #[Test]
    public function test_get_upcoming_events_returns_future_events_only(): void
    {
        // Past event
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(5),
        ]);

        // Future events
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'Future Event 1',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(7),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'Future Event 2',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(12),
        ]);

        $result = $this->service->getUpcomingEvents();

        $this->assertEquals(2, $result->total());
        foreach ($result->items() as $event) {
            $this->assertTrue($event->start_date >= now()->startOfDay());
        }
    }

    #[Test]
    public function test_get_upcoming_events_orders_by_start_date_ascending(): void
    {
        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'Later Event',
            'start_date' => now()->addDays(20),
            'end_date' => now()->addDays(22),
        ]);

        Event::factory()->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'Sooner Event',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(7),
        ]);

        $result = $this->service->getUpcomingEvents();

        $items = $result->items();
        $this->assertEquals('Sooner Event', $items[0]->title);
        $this->assertEquals('Later Event', $items[1]->title);
        $this->assertTrue($items[0]->start_date < $items[1]->start_date);
    }

    // ==================== getFeaturedEvents TESTS ====================

    #[Test]
    public function test_get_featured_events_returns_only_featured(): void
    {
        // Non-featured events
        Event::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'is_featured' => false,
        ]);

        // Featured events
        Event::factory()->count(2)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'is_featured' => true,
        ]);

        $result = $this->service->getFeaturedEvents();

        $this->assertEquals(2, $result->total());
        foreach ($result->items() as $event) {
            $this->assertTrue($event->is_featured);
        }
    }

    #[Test]
    public function test_get_featured_events_respects_pagination(): void
    {
        Event::factory()->count(20)->create([
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'is_featured' => true,
        ]);

        $result = $this->service->getFeaturedEvents(['per_page' => 5]);

        $this->assertEquals(20, $result->total());
        $this->assertCount(5, $result->items());
        $this->assertEquals(4, $result->lastPage());
    }
}
