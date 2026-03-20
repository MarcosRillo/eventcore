<?php

namespace App\Observers;

use App\Features\Shared\Traits\CachesWithTags;
use App\Models\EventType;

/**
 * Clears application caches when event types are created, updated, or deleted.
 *
 * Tags flushed: event-types, event-subtypes, public-stats.
 */
class EventTypeCacheObserver
{
    use CachesWithTags;

    public function saved(EventType $eventType): void
    {
        $this->flushTags(['event-types', 'event-subtypes', 'public-stats']);
    }

    public function deleted(EventType $eventType): void
    {
        $this->flushTags(['event-types', 'event-subtypes', 'public-stats']);
    }
}
