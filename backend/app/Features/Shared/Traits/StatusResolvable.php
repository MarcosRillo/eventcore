<?php

namespace App\Features\Shared\Traits;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Trait for resolving event status IDs with caching.
 *
 * This trait provides a cached method for getting status IDs from the database.
 * Since the event_statuses table rarely changes, results are cached for 24 hours
 * to avoid unnecessary database queries.
 *
 * Usage:
 *   use StatusResolvable;
 *   $statusId = $this->getStatusId('draft');
 */
trait StatusResolvable
{
    /**
     * Cache TTL for status IDs (24 hours).
     * Event statuses rarely change, so long cache is safe.
     */
    protected const STATUS_CACHE_TTL = 86400;

    /**
     * Cache key prefix for status IDs.
     */
    protected const STATUS_CACHE_PREFIX = 'event_status.id.';

    /**
     * Get event status ID by status code with caching.
     *
     * @param string $statusCode The status code (e.g., 'draft', 'published')
     * @return int The status ID
     * @throws \RuntimeException If status code not found
     */
    protected function getStatusId(string $statusCode): int
    {
        return Cache::remember(
            self::STATUS_CACHE_PREFIX . $statusCode,
            self::STATUS_CACHE_TTL,
            fn() => $this->fetchStatusIdFromDb($statusCode)
        );
    }

    /**
     * Get all status IDs mapped by their codes.
     * Useful when you need multiple status IDs at once.
     *
     * @return array<string, int> Map of status_code => id
     */
    protected function getAllStatusIds(): array
    {
        return Cache::remember(
            'event_status.ids.all',
            self::STATUS_CACHE_TTL,
            fn() => DB::table('event_statuses')
                ->pluck('id', 'status_code')
                ->toArray()
        );
    }

    /**
     * Clear all status-related caches.
     * Call this if you ever modify the event_statuses table.
     */
    protected function clearStatusCache(): void
    {
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
            Cache::forget(self::STATUS_CACHE_PREFIX . $code);
        }
    }

    /**
     * Fetch status ID directly from database.
     *
     * @param string $statusCode The status code
     * @return int The status ID
     * @throws \RuntimeException If status not found
     */
    private function fetchStatusIdFromDb(string $statusCode): int
    {
        $statusId = DB::table('event_statuses')
            ->where('status_code', $statusCode)
            ->value('id');

        if (!$statusId) {
            throw new \RuntimeException("Event status '{$statusCode}' not found");
        }

        return $statusId;
    }
}
