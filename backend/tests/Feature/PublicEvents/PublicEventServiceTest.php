<?php

namespace Tests\Feature\PublicEvents;

use App\Features\PublicEvents\Services\PublicEventService;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventStatus;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PublicEventServiceTest extends TestCase
{
    use RefreshDatabase;

    private PublicEventService $service;
    private Organization $organization;
    private Category $category;
    private Location $location;
    private EventStatus $publishedStatus;
    private EventStatus $draftStatus;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);

        $this->service = app(PublicEventService::class);

        // Create organization
        $this->organization = Organization::factory()->create();

        // Create user
        $this->user = User::factory()->create();
        $this->user->organizations()->attach($this->organization->id);

        // Create category
        $this->category = Category::factory()->create([
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ]);

        // Create location
        $this->location = Location::factory()->create([
            'entity_id' => $this->organization->id,
        ]);

        // Get statuses
        $this->publishedStatus = EventStatus::where('status_code', 'published')->first();
        $this->draftStatus = EventStatus::where('status_code', 'draft')->first();

        // Clear cache before each test
        Cache::flush();
    }

    private function createPublishedEvent(array $overrides = []): Event
    {
        $defaults = [
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
            'category_id' => $this->category->id,
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(5)->addHours(2),
            'created_by' => $this->user->id,
        ];

        return Event::factory()->create(array_merge($defaults, $overrides));
    }

    private function createDraftEvent(array $overrides = []): Event
    {
        return $this->createPublishedEvent(array_merge(['status_id' => $this->draftStatus->id], $overrides));
    }

    // ==================== GET PUBLISHED EVENTS TESTS ====================

    #[Test]
    public function test_get_published_events_returns_only_published_status(): void
    {
        // Create published events
        $published1 = $this->createPublishedEvent(['title' => 'Published Event 1']);
        $published2 = $this->createPublishedEvent(['title' => 'Published Event 2']);

        // Create draft event (should NOT appear)
        $this->createDraftEvent(['title' => 'Draft Event']);

        $result = $this->service->getPublishedEvents();

        $this->assertEquals(2, $result->total());
        $titles = collect($result->items())->pluck('title')->toArray();
        $this->assertContains('Published Event 1', $titles);
        $this->assertContains('Published Event 2', $titles);
        $this->assertNotContains('Draft Event', $titles);
    }

    #[Test]
    public function test_get_published_events_applies_category_filter(): void
    {
        $category2 = Category::factory()->create([
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ]);

        $this->createPublishedEvent(['category_id' => $this->category->id, 'title' => 'Category 1 Event']);
        $this->createPublishedEvent(['category_id' => $category2->id, 'title' => 'Category 2 Event']);

        $result = $this->service->getPublishedEvents(['category_id' => $this->category->id]);

        $this->assertEquals(1, $result->total());
        $this->assertEquals('Category 1 Event', $result->items()[0]->title);
    }

    #[Test]
    public function test_get_published_events_applies_date_filters(): void
    {
        $this->createPublishedEvent([
            'title' => 'Past Event',
            'start_date' => now()->subDays(10),
        ]);

        $this->createPublishedEvent([
            'title' => 'Future Event',
            'start_date' => now()->addDays(20),
        ]);

        $this->createPublishedEvent([
            'title' => 'In Range Event',
            'start_date' => now()->addDays(5),
        ]);

        $result = $this->service->getPublishedEvents([
            'date_from' => now()->addDay()->format('Y-m-d'),
            'date_to' => now()->addDays(10)->format('Y-m-d'),
        ]);

        $this->assertEquals(1, $result->total());
        $this->assertEquals('In Range Event', $result->items()[0]->title);
    }

    #[Test]
    public function test_get_published_events_applies_search_filter(): void
    {
        $this->createPublishedEvent(['title' => 'Marketing Conference']);
        $this->createPublishedEvent(['title' => 'Sales Workshop']);
        $this->createPublishedEvent(['description' => 'Learn marketing strategies']);

        $result = $this->service->getPublishedEvents(['search' => 'marketing']);

        $this->assertEquals(2, $result->total());
    }

    #[Test]
    public function test_get_published_events_loads_relationships(): void
    {
        $event = $this->createPublishedEvent();
        $event->locations()->attach($this->location->id);

        $result = $this->service->getPublishedEvents();

        $this->assertTrue($result->items()[0]->relationLoaded('category'));
        $this->assertTrue($result->items()[0]->relationLoaded('locations'));
    }

    // ==================== GET PUBLISHED EVENT BY ID TESTS ====================

    #[Test]
    public function test_get_published_event_by_id_returns_event(): void
    {
        $event = $this->createPublishedEvent(['title' => 'Test Event']);
        $event->locations()->attach($this->location->id);

        $result = $this->service->getPublishedEventById($event->id);

        $this->assertEquals($event->id, $result->id);
        $this->assertEquals('Test Event', $result->title);
        $this->assertTrue($result->relationLoaded('category'));
        $this->assertTrue($result->relationLoaded('locations'));
        $this->assertTrue($result->relationLoaded('creator'));
    }

    #[Test]
    public function test_get_published_event_by_id_throws_for_draft_event(): void
    {
        $draftEvent = $this->createDraftEvent(['title' => 'Draft Event']);

        $this->expectException(ModelNotFoundException::class);
        $this->expectExceptionMessage('Event not found or not published');

        $this->service->getPublishedEventById($draftEvent->id);
    }

    #[Test]
    public function test_get_published_event_by_id_throws_for_nonexistent_event(): void
    {
        $this->expectException(ModelNotFoundException::class);

        $this->service->getPublishedEventById(99999);
    }

    // ==================== GET PUBLIC CATEGORIES TESTS ====================

    #[Test]
    public function test_get_public_categories_returns_categories_with_event_counts(): void
    {
        // Create events for the category
        $this->createPublishedEvent(['category_id' => $this->category->id]);
        $this->createPublishedEvent(['category_id' => $this->category->id]);

        $result = $this->service->getPublicCategories();

        $this->assertCount(1, $result);
        $this->assertEquals($this->category->id, $result[0]['id']);
        $this->assertEquals($this->category->name, $result[0]['name']);
        $this->assertEquals(2, $result[0]['event_count']);
        $this->assertArrayHasKey('slug', $result[0]);
        $this->assertArrayHasKey('color', $result[0]);
    }

    #[Test]
    public function test_get_public_categories_excludes_categories_without_published_events(): void
    {
        $emptyCategory = Category::factory()->create([
            'entity_id' => $this->organization->id,
            'is_active' => true,
            'name' => 'Empty Category',
        ]);

        // Create event only for the main category
        $this->createPublishedEvent(['category_id' => $this->category->id]);

        // Create draft event for empty category (should not count)
        $this->createDraftEvent(['category_id' => $emptyCategory->id]);

        $result = $this->service->getPublicCategories();

        $this->assertCount(1, $result);
        $categoryIds = $result->pluck('id')->toArray();
        $this->assertContains($this->category->id, $categoryIds);
        $this->assertNotContains($emptyCategory->id, $categoryIds);
    }

    #[Test]
    public function test_get_public_categories_uses_cache(): void
    {
        $this->createPublishedEvent(['category_id' => $this->category->id]);

        // First call - should hit database
        $result1 = $this->service->getPublicCategories();

        // Verify cache was set
        $this->assertTrue(Cache::has('public.categories'));

        // Second call - should use cache
        $result2 = $this->service->getPublicCategories();

        $this->assertEquals($result1->toArray(), $result2->toArray());
    }

    // ==================== GET CALENDAR MONTH TESTS ====================

    #[Test]
    public function test_get_calendar_month_returns_correct_structure(): void
    {
        $year = now()->year;
        $month = now()->month;

        $this->createPublishedEvent([
            'start_date' => now()->startOfMonth()->addDays(5),
            'is_featured' => true,
        ]);

        $result = $this->service->getCalendarMonth($year, $month);

        $this->assertArrayHasKey('events', $result);
        $this->assertArrayHasKey('calendar', $result);
        $this->assertArrayHasKey('month_info', $result);

        // Verify month info structure
        $this->assertEquals($year, $result['month_info']['year']);
        $this->assertEquals($month, $result['month_info']['month']);
        $this->assertArrayHasKey('month_name', $result['month_info']);
        $this->assertEquals(1, $result['month_info']['total_events']);
        $this->assertEquals(1, $result['month_info']['featured_events']);
    }

    #[Test]
    public function test_get_calendar_month_builds_calendar_days(): void
    {
        $year = 2025;
        $month = 12; // December has 31 days

        $result = $this->service->getCalendarMonth($year, $month);

        $this->assertCount(31, $result['calendar']);
        $this->assertEquals('2025-12-01', $result['calendar'][0]['date']);
        $this->assertEquals('2025-12-31', $result['calendar'][30]['date']);

        // Each day should have required keys
        foreach ($result['calendar'] as $day) {
            $this->assertArrayHasKey('date', $day);
            $this->assertArrayHasKey('event_count', $day);
            $this->assertArrayHasKey('has_featured', $day);
        }
    }

    #[Test]
    public function test_get_calendar_month_throws_for_invalid_year(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Year must be between 2020 and 2030');

        $this->service->getCalendarMonth(2019, 6);
    }

    #[Test]
    public function test_get_calendar_month_throws_for_invalid_month(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Month must be between 1 and 12');

        $this->service->getCalendarMonth(2025, 13);
    }

    // ==================== GET EVENTS BY DATE RANGE TESTS ====================

    #[Test]
    public function test_get_events_by_date_range_filters_correctly(): void
    {
        $this->createPublishedEvent([
            'title' => 'Before Range',
            'start_date' => '2025-01-01 10:00:00',
        ]);

        $this->createPublishedEvent([
            'title' => 'In Range',
            'start_date' => '2025-01-15 10:00:00',
        ]);

        $this->createPublishedEvent([
            'title' => 'After Range',
            'start_date' => '2025-02-01 10:00:00',
        ]);

        $result = $this->service->getEventsByDateRange('2025-01-10', '2025-01-20');

        $this->assertCount(1, $result);
        $this->assertEquals('In Range', $result->first()->title);
    }

    #[Test]
    public function test_get_events_by_date_range_orders_by_start_date(): void
    {
        $this->createPublishedEvent([
            'title' => 'Later Event',
            'start_date' => '2025-01-20 10:00:00',
        ]);

        $this->createPublishedEvent([
            'title' => 'Earlier Event',
            'start_date' => '2025-01-10 10:00:00',
        ]);

        $result = $this->service->getEventsByDateRange('2025-01-01', '2025-01-31');

        $this->assertEquals('Earlier Event', $result[0]->title);
        $this->assertEquals('Later Event', $result[1]->title);
    }

    // ==================== GET UPCOMING EVENTS TESTS ====================

    #[Test]
    public function test_get_upcoming_events_returns_future_events_only(): void
    {
        $this->createPublishedEvent([
            'title' => 'Past Event',
            'start_date' => now()->subDays(5),
        ]);

        $this->createPublishedEvent([
            'title' => 'Future Event',
            'start_date' => now()->addDays(5),
        ]);

        $result = $this->service->getUpcomingEvents();

        $this->assertCount(1, $result);
        $this->assertEquals('Future Event', $result->first()->title);
    }

    #[Test]
    public function test_get_upcoming_events_orders_by_start_date(): void
    {
        $this->createPublishedEvent([
            'title' => 'Later',
            'start_date' => now()->addDays(10),
        ]);

        $this->createPublishedEvent([
            'title' => 'Sooner',
            'start_date' => now()->addDays(2),
        ]);

        $result = $this->service->getUpcomingEvents();

        $this->assertEquals('Sooner', $result[0]->title);
        $this->assertEquals('Later', $result[1]->title);
    }

    #[Test]
    public function test_get_upcoming_events_respects_limit(): void
    {
        for ($i = 1; $i <= 15; $i++) {
            $this->createPublishedEvent([
                'title' => "Event {$i}",
                'start_date' => now()->addDays($i),
            ]);
        }

        $result = $this->service->getUpcomingEvents(5);

        $this->assertCount(5, $result);
    }

    #[Test]
    public function test_get_upcoming_events_caps_limit_at_50(): void
    {
        // Request 100, should be capped at 50
        $result = $this->service->getUpcomingEvents(100);

        // Just verify it doesn't throw and respects max
        $this->assertLessThanOrEqual(50, $result->count());
    }

    // ==================== GET FEATURED EVENTS TESTS ====================

    #[Test]
    public function test_get_featured_events_returns_only_featured(): void
    {
        $this->createPublishedEvent([
            'title' => 'Featured Event',
            'is_featured' => true,
            'start_date' => now()->addDays(5),
        ]);

        $this->createPublishedEvent([
            'title' => 'Normal Event',
            'is_featured' => false,
            'start_date' => now()->addDays(5),
        ]);

        $result = $this->service->getFeaturedEvents();

        $this->assertCount(1, $result);
        $this->assertEquals('Featured Event', $result->first()->title);
    }

    #[Test]
    public function test_get_featured_events_excludes_past_events(): void
    {
        $this->createPublishedEvent([
            'title' => 'Past Featured',
            'is_featured' => true,
            'start_date' => now()->subDays(5),
        ]);

        $this->createPublishedEvent([
            'title' => 'Future Featured',
            'is_featured' => true,
            'start_date' => now()->addDays(5),
        ]);

        $result = $this->service->getFeaturedEvents();

        $this->assertCount(1, $result);
        $this->assertEquals('Future Featured', $result->first()->title);
    }

    // ==================== SEARCH EVENTS TESTS ====================

    #[Test]
    public function test_search_events_finds_by_title(): void
    {
        $this->createPublishedEvent(['title' => 'Marketing Conference 2025']);
        $this->createPublishedEvent(['title' => 'Sales Workshop']);

        $result = $this->service->searchEvents('Marketing');

        $this->assertEquals(1, $result['total_results']);
        $this->assertEquals('Marketing Conference 2025', $result['events']->first()->title);
        $this->assertEquals('Marketing', $result['search_query']);
    }

    #[Test]
    public function test_search_events_finds_by_description(): void
    {
        $this->createPublishedEvent([
            'title' => 'Tech Event',
            'description' => 'Learn about artificial intelligence',
        ]);

        $result = $this->service->searchEvents('artificial intelligence');

        $this->assertEquals(1, $result['total_results']);
    }

    #[Test]
    public function test_search_events_applies_category_filter(): void
    {
        $category2 = Category::factory()->create([
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ]);

        $this->createPublishedEvent([
            'title' => 'Tech Conference',
            'category_id' => $this->category->id,
        ]);

        $this->createPublishedEvent([
            'title' => 'Tech Workshop',
            'category_id' => $category2->id,
        ]);

        $result = $this->service->searchEvents('Tech', $this->category->id);

        $this->assertEquals(1, $result['total_results']);
        $this->assertEquals('Tech Conference', $result['events']->first()->title);
    }

    // ==================== GET EVENTS BY CATEGORY TESTS ====================

    #[Test]
    public function test_get_events_by_category_returns_category_and_events(): void
    {
        $this->createPublishedEvent(['category_id' => $this->category->id]);
        $this->createPublishedEvent(['category_id' => $this->category->id]);

        $result = $this->service->getEventsByCategory($this->category->id);

        $this->assertArrayHasKey('category', $result);
        $this->assertArrayHasKey('events', $result);
        $this->assertEquals($this->category->id, $result['category']->id);
        $this->assertEquals(2, $result['events']->total());
    }

    #[Test]
    public function test_get_events_by_category_throws_for_inactive_category(): void
    {
        $inactiveCategory = Category::factory()->create([
            'entity_id' => $this->organization->id,
            'is_active' => false,
        ]);

        $this->expectException(ModelNotFoundException::class);
        $this->expectExceptionMessage('Category not found or inactive');

        $this->service->getEventsByCategory($inactiveCategory->id);
    }

    #[Test]
    public function test_get_events_by_category_throws_for_nonexistent_category(): void
    {
        $this->expectException(ModelNotFoundException::class);

        $this->service->getEventsByCategory(99999);
    }

    #[Test]
    public function test_get_events_by_category_paginates_results(): void
    {
        for ($i = 1; $i <= 20; $i++) {
            $this->createPublishedEvent([
                'title' => "Event {$i}",
                'category_id' => $this->category->id,
            ]);
        }

        $result = $this->service->getEventsByCategory($this->category->id, 5);

        $this->assertEquals(20, $result['events']->total());
        $this->assertCount(5, $result['events']->items());
    }
}
