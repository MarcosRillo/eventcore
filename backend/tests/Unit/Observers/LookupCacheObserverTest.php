<?php

namespace Tests\Unit\Observers;

use App\Models\EventFormat;
use App\Models\EventStatus;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests that lookup table cache observers correctly invalidate
 * cached data when EventStatus or EventFormat records change.
 */
class LookupCacheObserverTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(EventStatusesSeeder::class);
        $this->seed(EventTypesSeeder::class);
    }

    #[Test]
    public function event_status_change_clears_statuses_cache(): void
    {
        // Arrange — warm the cache
        Cache::put('event_statuses', EventStatus::all(['id', 'status_name', 'status_code']), 86400);
        $this->assertTrue(Cache::has('event_statuses'));

        // Act — update a status
        $status = EventStatus::first();
        $status->update(['description' => 'Updated description']);

        // Assert — cache was cleared
        $this->assertFalse(Cache::has('event_statuses'));
    }

    #[Test]
    public function event_status_change_clears_individual_status_cache(): void
    {
        // Arrange — warm cache for published status (used by scopePublished)
        Cache::put('event_status.id.published', 1, 86400);
        $this->assertTrue(Cache::has('event_status.id.published'));

        // Act — update any status
        $status = EventStatus::where('status_code', 'published')->first();
        $status->update(['description' => 'Updated']);

        // Assert — individual status cache was also cleared
        $this->assertFalse(Cache::has('event_status.id.published'));
    }

    #[Test]
    public function event_format_change_clears_formats_cache(): void
    {
        // Arrange — warm the cache
        Cache::put('event_formats', EventFormat::all(['id', 'format_name', 'format_code']), 86400);
        $this->assertTrue(Cache::has('event_formats'));

        // Act — update a format
        $format = EventFormat::first();
        $format->update(['description' => 'Updated description']);

        // Assert — cache was cleared
        $this->assertFalse(Cache::has('event_formats'));
    }

    #[Test]
    public function event_status_deletion_clears_cache(): void
    {
        // Arrange — create a temporary status and warm cache
        $tempStatus = EventStatus::create([
            'status_code' => 'temp_test',
            'status_name' => 'Temp Test',
            'description' => 'Test',
            'is_public' => false,
            'workflow_order' => 99,
        ]);
        Cache::put('event_statuses', 'cached_value', 86400);

        // Act
        $tempStatus->delete();

        // Assert
        $this->assertFalse(Cache::has('event_statuses'));
    }
}
