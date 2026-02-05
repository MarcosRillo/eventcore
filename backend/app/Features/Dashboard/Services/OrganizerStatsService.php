<?php

namespace App\Features\Dashboard\Services;

use App\Features\Shared\Traits\StatusResolvable;
use App\Models\Event;
use App\Models\Scopes\TenantScope;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * OrganizerStatsService
 *
 * Handles statistics for organizer dashboard.
 * Returns event counts grouped by status (mutually exclusive states).
 */
class OrganizerStatsService
{
    use StatusResolvable;

    /**
     * Map database status codes to API response keys.
     */
    private const STATUS_KEY_MAP = [
        'draft' => 'draft',
        'pending_internal_approval' => 'pending_internal',
        'approved_internal' => 'approved_internal',
        'pending_public_approval' => 'pending_public',
        'published' => 'published',
        'requires_changes' => 'requires_changes',
        'rejected' => 'rejected',
    ];

    /**
     * Get statistics for organizer's events.
     *
     * @param  int  $organizationId  Organization ID
     * @return array Statistics including counts by status
     */
    public function getStats(int $organizationId): array
    {
        try {
            // Get all status IDs from cached trait method
            $allStatusIds = $this->getAllStatusIds();
            $statusIds = $this->mapStatusKeys($allStatusIds);

            // Use withoutGlobalScopes to avoid double-filtering from TenantScope
            $baseQuery = Event::withoutGlobalScope(TenantScope::class)
                ->where('organization_id', $organizationId);

            // Single efficient query with groupBy
            $statusCounts = (clone $baseQuery)
                ->select('status_id', DB::raw('count(*) as count'))
                ->groupBy('status_id')
                ->pluck('count', 'status_id');

            // Build stats array using dynamic status IDs
            $stats = [
                'total_events' => $statusCounts->sum(),
                'draft' => $statusCounts->get($statusIds['draft'] ?? 0, 0),
                'pending_internal' => $statusCounts->get($statusIds['pending_internal'] ?? 0, 0),
                'approved_internal' => $statusCounts->get($statusIds['approved_internal'] ?? 0, 0),
                'pending_public' => $statusCounts->get($statusIds['pending_public'] ?? 0, 0),
                'published' => $statusCounts->get($statusIds['published'] ?? 0, 0),
                'requires_changes' => $statusCounts->get($statusIds['requires_changes'] ?? 0, 0),
                'rejected' => $statusCounts->get($statusIds['rejected'] ?? 0, 0),
            ];

            // Add upcoming vs past breakdown
            $stats['upcoming_events'] = (clone $baseQuery)
                ->upcoming()
                ->count();

            $stats['past_events'] = (clone $baseQuery)
                ->past()
                ->count();

            Log::info('Organizer stats fetched successfully', [
                'organization_id' => $organizationId,
                'total_events' => $stats['total_events'],
                'upcoming_events' => $stats['upcoming_events'],
                'past_events' => $stats['past_events'],
            ]);

            return $stats;
        } catch (\Exception $e) {
            Log::error('Failed to fetch organizer stats', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Map database status codes to short API keys.
     *
     * @param  array<string, int>  $allStatusIds  Map of status_code => id from trait
     * @return array<string, int> Map of short_key => id
     */
    private function mapStatusKeys(array $allStatusIds): array
    {
        $mapped = [];
        foreach (self::STATUS_KEY_MAP as $dbCode => $apiKey) {
            if (isset($allStatusIds[$dbCode])) {
                $mapped[$apiKey] = $allStatusIds[$dbCode];
            }
        }

        return $mapped;
    }
}
