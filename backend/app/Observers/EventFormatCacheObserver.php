<?php

namespace App\Observers;

use App\Models\EventFormat;
use Illuminate\Support\Facades\Cache;

/**
 * Clears cached event format data when records are modified.
 *
 * Invalidates the collection cache used by EventResource meta.
 */
class EventFormatCacheObserver
{
    public function saved(EventFormat $format): void
    {
        Cache::forget('event_formats');
    }

    public function deleted(EventFormat $format): void
    {
        Cache::forget('event_formats');
    }
}
