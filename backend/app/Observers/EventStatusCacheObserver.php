<?php

namespace App\Observers;

use App\Models\EventStatus;
use Illuminate\Support\Facades\Cache;

/**
 * Clears cached event status data when records are modified.
 *
 * Invalidates both the collection cache (used by EventResource meta)
 * and individual status ID caches (used by scopePublished and StatusResolvable).
 */
class EventStatusCacheObserver
{
    public function saved(EventStatus $status): void
    {
        $this->clearCache();
    }

    public function deleted(EventStatus $status): void
    {
        $this->clearCache();
    }

    private function clearCache(): void
    {
        // Collection cache used by EventResource::with()
        Cache::forget('event_statuses');

        // Individual status caches used by scopePublished and StatusResolvable
        Cache::forget('event_status.ids.all');

        $statusCodes = [
            'draft',
            'pending_internal_approval',
            'approved_internal',
            'pending_public_approval',
            'published',
            'requires_changes',
            'rejected',
            'cancelled',
        ];

        foreach ($statusCodes as $code) {
            Cache::forget('event_status.id.'.$code);
        }
    }
}
