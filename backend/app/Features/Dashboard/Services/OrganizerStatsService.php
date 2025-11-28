<?php

namespace App\Features\Dashboard\Services;

use App\Features\Shared\Traits\StatusResolvable;
use App\Models\Event;
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
     * @param int $userId User ID (created_by)
     * @return array Statistics including counts by status
     */
    public function getStats(int $userId): array
    {
        try {
            // Get all status IDs from cached trait method
            $allStatusIds = $this->getAllStatusIds();
            $statusIds = $this->mapStatusKeys($allStatusIds);

            // Single efficient query with groupBy
            $statusCounts = Event::where('created_by', $userId)
                ->select('status_id', DB::raw('count(*) as count'))
                ->groupBy('status_id')
                ->pluck('count', 'status_id');

            // Build stats array using dynamic status IDs
            $stats = [
                'total_events' => $statusCounts->sum(),
                'pending_internal' => $statusCounts->get($statusIds['pending_internal'] ?? 0, 0),
                'approved_internal' => $statusCounts->get($statusIds['approved_internal'] ?? 0, 0),
                'pending_public' => $statusCounts->get($statusIds['pending_public'] ?? 0, 0),
                'published' => $statusCounts->get($statusIds['published'] ?? 0, 0),
                'requires_changes' => $statusCounts->get($statusIds['requires_changes'] ?? 0, 0),
                'rejected' => $statusCounts->get($statusIds['rejected'] ?? 0, 0),
            ];

            Log::info('Organizer stats fetched successfully', [
                'user_id' => $userId,
                'total_events' => $stats['total_events']
            ]);

            return $stats;
        } catch (\Exception $e) {
            Log::error('Failed to fetch organizer stats', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Map database status codes to short API keys.
     *
     * @param array<string, int> $allStatusIds Map of status_code => id from trait
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
