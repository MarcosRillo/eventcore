<?php

namespace Tests\Unit\Models;

use App\Models\Event;
use App\Models\EventStatus;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests for Event::scopePublished() caching behavior.
 *
 * Verifies that the published scope caches the status ID
 * instead of querying event_statuses on every invocation.
 */
class ScopePublishedTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserRolesSeeder::class);
        $this->seed(EventStatusesSeeder::class);
        $this->seed(EventTypesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
    }

    #[Test]
    public function scope_published_returns_only_published_events(): void
    {
        // Arrange
        $publishedStatus = EventStatus::where('status_code', 'published')->first();
        $draftStatus = EventStatus::where('status_code', 'draft')->first();

        $publishedEvent = Event::factory()->create(['status_id' => $publishedStatus->id]);
        $draftEvent = Event::factory()->create(['status_id' => $draftStatus->id]);

        // Act
        $results = Event::withoutGlobalScopes()->published()->get();

        // Assert
        $this->assertTrue($results->contains('id', $publishedEvent->id));
        $this->assertFalse($results->contains('id', $draftEvent->id));
    }

    #[Test]
    public function scope_published_caches_status_id(): void
    {
        // Arrange — clear any existing cache
        Cache::forget('event_status.id.published');

        // Act — call the scope twice
        Event::withoutGlobalScopes()->published()->toSql();
        Event::withoutGlobalScopes()->published()->toSql();

        // Assert — the status ID should be cached
        $this->assertTrue(Cache::has('event_status.id.published'));
    }

    #[Test]
    public function scope_published_does_not_query_db_on_cache_hit(): void
    {
        // Arrange — warm the cache
        $publishedStatus = EventStatus::where('status_code', 'published')->first();
        Cache::put('event_status.id.published', $publishedStatus->id, 86400);

        // Act — count queries during scope execution
        $queryCount = 0;
        DB::listen(function () use (&$queryCount) {
            $queryCount++;
        });

        Event::withoutGlobalScopes()->published()->toSql();

        // Assert — no queries to event_statuses (scope used cached value)
        $this->assertEquals(0, $queryCount);
    }
}
