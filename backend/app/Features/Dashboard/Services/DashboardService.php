<?php

namespace App\Features\Dashboard\Services;

use App\Features\Shared\Traits\CachesWithTags;
use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Dashboard Service
 *
 * Business logic for entity admin/staff dashboard functionality.
 * Handles event filtering, counting, and detailed information retrieval.
 * Delegates transformation to DashboardTransformer.
 */
class DashboardService
{
    use CachesWithTags;

    public function __construct(
        private DashboardTransformer $transformer,
    ) {}

    /**
     * Get events summary with counters for each dashboard tab
     * Uses a single query with conditional aggregation for performance.
     */
    public function getEventsSummary(): array
    {
        $user = Auth::user();
        $tenantSuffix = $user?->organization_id ?? 'global';
        $cacheKey = "dashboard.summary.{$tenantSuffix}";

        return $this->taggedRemember(['dashboard'], $cacheKey, 120, function () {
            $now = now();
            $bindings = ['now' => $now, 'now2' => $now, 'now3' => $now, 'now4' => $now];
            $tenantClause = $this->buildTenantClause($bindings);

            $sql = "
                SELECT
                    COUNT(*) FILTER (WHERE es.status_code IN ('pending_internal_approval', 'pending_public_approval', 'requires_changes') AND e.end_date >= :now) AS requiere_accion,
                    COUNT(*) FILTER (WHERE es.status_code IN ('approved_internal', 'draft') AND e.end_date >= :now2) AS pendientes,
                    COUNT(*) FILTER (WHERE es.status_code = 'published' AND e.end_date >= :now3) AS publicados,
                    COUNT(*) FILTER (WHERE es.status_code IN ('rejected', 'cancelled') OR e.end_date < :now4) AS historico
                FROM events e
                JOIN event_statuses es ON es.id = e.status_id
                WHERE e.deleted_at IS NULL
                {$tenantClause}
            ";

            $row = DB::selectOne($sql, $bindings);

            return [
                'requiere_accion' => (int) $row->requiere_accion,
                'pendientes'      => (int) $row->pendientes,
                'publicados'      => (int) $row->publicados,
                'historico'       => (int) $row->historico,
            ];
        });
    }

    /**
     * Build the tenant WHERE clause fragment and register its bindings.
     *
     * Safety note: this method interpolates only static SQL keywords
     * (e.g. `AND e.entity_id = :tenant_id`). All user-supplied values
     * are passed as named PDO parameters via the $bindings array and
     * never concatenated into the query string, so there is no SQL
     * injection risk.
     */
    private function buildTenantClause(array &$bindings): string
    {
        if (! Auth::check()) {
            return '';
        }

        $user = Auth::user();

        if ($user->isPlatformAdmin()) {
            return '';
        }

        if ($user->isEntityAdmin() || $user->isEntityStaff()) {
            $organizationId = $user->organization_id;

            if ($organizationId) {
                $bindings['tenant_id'] = $organizationId;

                return 'AND e.entity_id = :tenant_id';
            }

            return '';
        }

        if ($user->isOrganizerAdmin()) {
            $organizationId = $user->organization_id;

            if ($organizationId) {
                $bindings['tenant_id'] = $organizationId;

                return 'AND e.organization_id = :tenant_id';
            }
        }

        return '';
    }

    /**
     * Get filtered and paginated events for a specific dashboard tab
     */
    public function getFilteredEvents(string $tab, int $page, string $search, int $perPage): array
    {
        $query = Event::with(['status', 'format', 'entity', 'eventType', 'eventSubtype', 'locations']);

        // Apply tab-specific filtering
        $this->applyTabFilter($query, $tab);

        // Apply search if provided
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhereHas('entity', fn ($orgQuery) => $orgQuery->where('name', 'ilike', "%{$search}%"),
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
        $eventsData = $events->map(fn ($event) => $this->transformer->transformForList($event));

        return [
            'data' => $eventsData->toArray(),
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage),
                'from' => $offset + 1,
                'to' => min($offset + $perPage, $total),
            ],
        ];
    }

    /**
     * Get detailed event information for modal view.
     */
    public function getEventDetail(int $eventId): ?array
    {
        $event = Event::with([
            'status',
            'format',
            'entity',
            'eventType',
            'eventSubtype',
            'locations',
            'creator',
            'approver',
            'approvals',
        ])->find($eventId);

        if (! $event) {
            return null;
        }

        return $this->transformer->transformForDetail($event);
    }

    /**
     * Apply tab-specific filters to event query
     */
    private function applyTabFilter($query, string $tab): void
    {
        switch ($tab) {
            case 'requires-action':
                $query->whereHas('status', fn ($q) => $q->whereIn('status_code', ['pending_internal_approval', 'pending_public_approval', 'requires_changes']),
                );
                // Only include non-past events
                $query->where('end_date', '>=', Carbon::now());
                break;

            case 'pending':
                $query->whereHas('status', fn ($q) => $q->whereIn('status_code', ['approved_internal', 'draft']),
                );
                // Only include non-past events
                $query->where('end_date', '>=', Carbon::now());
                break;

            case 'published':
                $query->whereHas('status', fn ($q) => $q->where('status_code', 'published'),
                );
                // Only include non-past events
                $query->where('end_date', '>=', Carbon::now());
                break;

            case 'historic':
                $query->where(function ($q) {
                    // Past events regardless of status
                    $q->where('end_date', '<', Carbon::now())
                      // OR rejected/cancelled events regardless of date
                        ->orWhereHas('status', fn ($statusQuery) => $statusQuery->whereIn('status_code', ['rejected', 'cancelled']),
                        );
                });
                break;
        }
    }

    /**
     * Apply ordering to event query
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
