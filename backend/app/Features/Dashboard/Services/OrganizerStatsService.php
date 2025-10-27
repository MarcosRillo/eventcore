<?php

namespace App\Features\Dashboard\Services;

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
    /**
     * Get statistics for organizer's events.
     *
     * @param int $userId User ID (created_by)
     * @return array Statistics including counts by status
     */
    public function getStats(int $userId): array
    {
        try {
            // Get status IDs dynamically from database
            $statusIds = $this->getStatusIds();

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
     * Get status IDs dynamically from database by status code.
     * Maps long status codes to short keys for cleaner API responses.
     *
     * @return array Map of short_key => status_id
     */
    private function getStatusIds(): array
    {
        return DB::table('event_statuses')
            ->whereIn('status_code', [
                'pending_internal_approval',
                'approved_internal',
                'pending_public_approval',
                'published',
                'requires_changes',
                'rejected'
            ])
            ->pluck('id', 'status_code')
            ->mapWithKeys(function ($id, $code) {
                // Map database codes to API response keys
                $keyMap = [
                    'pending_internal_approval' => 'pending_internal',
                    'approved_internal' => 'approved_internal',
                    'pending_public_approval' => 'pending_public',
                    'published' => 'published',
                    'requires_changes' => 'requires_changes',
                    'rejected' => 'rejected',
                ];
                return [$keyMap[$code] => $id];
            })
            ->toArray();
    }
}
