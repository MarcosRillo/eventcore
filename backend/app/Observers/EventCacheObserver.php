<?php

namespace App\Observers;

use App\Features\Shared\Traits\CachesWithTags;
use App\Models\Event;

/**
 * Clears application caches when events are created, updated, or deleted.
 *
 * Tags flushed: public-stats, dashboard, calendar.
 * With Redis these flush instantly; with database driver, entries expire by TTL.
 */
class EventCacheObserver
{
    use CachesWithTags;

    public function saved(Event $event): void
    {
        $this->flushTags(['public-stats', 'dashboard', 'calendar']);
    }

    public function deleted(Event $event): void
    {
        $this->flushTags(['public-stats', 'dashboard', 'calendar']);
    }
}
