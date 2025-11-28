<?php

namespace App\Features\Dashboard\Services;

use App\Models\Event;
use Carbon\Carbon;

/**
 * Dashboard Service
 *
 * Business logic for entity admin/staff dashboard functionality.
 * Handles event filtering, counting, and detailed information retrieval.
 * Delegates transformation to DashboardTransformer.
 */
class DashboardService
{
    public function __construct(
        private DashboardTransformer $transformer
    ) {}
    /**
     * Get events summary with counters for each dashboard tab
     * 
     * @return array
     */
    public function getEventsSummary(): array
    {
        // Get all events with status information
        $events = Event::with(['status', 'type'])
            ->get()
            ->groupBy(function ($event) {
                return $this->categorizeEventForTab($event);
            });

        return [
            'requiere_accion' => $events->get('requires-action', collect())->count(),
            'pendientes' => $events->get('pending', collect())->count(),
            'publicados' => $events->get('published', collect())->count(),
            'historico' => $events->get('historic', collect())->count(),
        ];
    }

    /**
     * Get filtered and paginated events for a specific dashboard tab
     * 
     * @param string $tab
     * @param int $page
     * @param string $search
     * @param int $perPage
     * @return array
     */
    public function getFilteredEvents(string $tab, int $page, string $search, int $perPage): array
    {
        $query = Event::with(['status', 'type', 'entity', 'category', 'locations']);

        // Apply tab-specific filtering
        $this->applyTabFilter($query, $tab);

        // Apply search if provided
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhereHas('entity', fn($orgQuery) => 
                      $orgQuery->where('name', 'ilike', "%{$search}%")
                  );
            });
        }

        // Apply ordering: upcoming events first, then by updated_at
        $this->applyOrdering($query, $tab);

        // Paginate results
        $offset = ($page - 1) * $perPage;
        $total = $query->count();
        $events = $query->offset($offset)->limit($perPage)->get();

        // Transform events for frontend consumption
        $eventsData = $events->map(fn($event) => $this->transformer->transformForList($event));

        return [
            'data' => $eventsData->toArray(),
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage),
                'from' => $offset + 1,
                'to' => min($offset + $perPage, $total),
            ]
        ];
    }

    /**
     * Get detailed event information for modal view.
     *
     * @param int $eventId
     * @return array|null
     */
    public function getEventDetail(int $eventId): ?array
    {
        $event = Event::with([
            'status',
            'type',
            'entity',
            'category',
            'locations',
            'creator',
            'approver'
        ])->find($eventId);

        if (!$event) {
            return null;
        }

        return $this->transformer->transformForDetail($event);
    }

    /**
     * Categorize event for appropriate dashboard tab
     * 
     * @param Event $event
     * @return string
     */
    private function categorizeEventForTab(Event $event): string
    {
        $statusCode = $event->status?->status_code;

        // Check if event has ended (past events go to historic)
        if ($event->hasEnded()) {
            return 'historic';
        }

        return match ($statusCode) {
            'pending_internal_approval', 'pending_public_approval', 'requires_changes' => 'requires-action',
            'approved_internal', 'draft' => 'pending',
            'published' => 'published',
            'rejected', 'cancelled' => 'historic',
            default => 'pending'
        };
    }

    /**
     * Apply tab-specific filters to event query
     * 
     * @param $query
     * @param string $tab
     * @return void
     */
    private function applyTabFilter($query, string $tab): void
    {
        switch ($tab) {
            case 'requires-action':
                $query->whereHas('status', fn($q) => 
                    $q->whereIn('status_code', ['pending_internal_approval', 'pending_public_approval', 'requires_changes'])
                );
                // Only include non-past events
                $query->where('end_date', '>=', Carbon::now());
                break;

            case 'pending':
                $query->whereHas('status', fn($q) => 
                    $q->whereIn('status_code', ['approved_internal', 'draft'])
                );
                // Only include non-past events
                $query->where('end_date', '>=', Carbon::now());
                break;

            case 'published':
                $query->whereHas('status', fn($q) => 
                    $q->where('status_code', 'published')
                );
                // Only include non-past events
                $query->where('end_date', '>=', Carbon::now());
                break;

            case 'historic':
                $query->where(function ($q) {
                    // Past events regardless of status
                    $q->where('end_date', '<', Carbon::now())
                      // OR rejected/cancelled events regardless of date
                      ->orWhereHas('status', fn($statusQuery) => 
                          $statusQuery->whereIn('status_code', ['rejected', 'cancelled'])
                      );
                });
                break;
        }
    }

    /**
     * Apply ordering to event query
     * 
     * @param $query
     * @param string $tab
     * @return void
     */
    private function applyOrdering($query, string $tab): void
    {
        if ($tab === 'historic') {
            // For historic events, show most recently updated first
            $query->orderBy('updated_at', 'desc');
        } else {
            // For active events, show upcoming events first, then by updated_at ASC for older first
            $query->orderBy('start_date', 'asc')
                  ->orderBy('updated_at', 'asc');
        }
    }

}