<?php

namespace App\Features\Dashboard\Services;

use App\Models\Event;
use App\Models\EventStatus;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Dashboard Service
 * 
 * Business logic for entity admin/staff dashboard functionality
 * Handles event filtering, counting, and detailed information retrieval
 */
class DashboardService
{
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
        $eventsData = $events->map(function ($event) {
            return $this->transformEventForDashboard($event);
        });

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
     * Get detailed event information for modal view
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

        return [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'start_date' => $event->start_date->format('Y-m-d H:i:s'),
            'end_date' => $event->end_date->format('Y-m-d H:i:s'),
            'status' => [
                'id' => $event->status->id,
                'status_code' => $event->status->status_code,
                'status_name' => $event->status->status_name,
                'description' => $event->status->description,
            ],
            'type' => [
                'id' => $event->type->id,
                'type_code' => $event->type->type_code,
                'type_name' => $event->type->type_name,
            ],
            'entity' => [
                'id' => $event->entity->id,
                'name' => $event->entity->name,
                'email' => $event->entity->email,
                'phone' => $event->entity->phone,
            ],
            'category' => $event->category ? [
                'id' => $event->category->id,
                'name' => $event->category->name,
                'color' => $event->category->color,
            ] : null,
            'locations' => $event->locations->map(function ($location) {
                return [
                    'id' => $location->id,
                    'name' => $location->name,
                    'address' => $location->address,
                    'city' => $location->city,
                    'location_specific_notes' => $location->pivot->location_specific_notes,
                    'max_attendees_for_location' => $location->pivot->max_attendees_for_location,
                ];
            })->toArray(),
            'virtual_link' => $event->virtual_link,
            'cta_link' => $event->cta_link,
            'cta_text' => $event->cta_text,
            'featured_image' => $event->featured_image,
            'is_featured' => $event->is_featured,
            'max_attendees' => $event->max_attendees,
            'metadata' => $event->metadata,
            'approval_comments' => $event->approval_comments,
            'approval_history' => $event->approval_history,
            'creator' => $event->creator ? [
                'id' => $event->creator->id,
                'name' => $event->creator->name,
                'email' => $event->creator->email,
            ] : null,
            'approver' => $event->approver ? [
                'id' => $event->approver->id,
                'name' => $event->approver->name,
                'email' => $event->approver->email,
            ] : null,
            'approved_at' => $event->approved_at?->format('Y-m-d H:i:s'),
            'created_at' => $event->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $event->updated_at->format('Y-m-d H:i:s'),
            'current_state_duration' => $this->calculateCurrentStateDuration($event),
            'is_happening' => $event->isHappening(),
            'has_ended' => $event->hasEnded(),
            'is_upcoming' => $event->isUpcoming(),
            'is_virtual' => $event->isVirtual(),
            'has_multiple_locations' => $event->hasMultipleLocations(),
            'has_cta' => $event->hasCTA(),
            'is_in_approval_workflow' => $event->isInApprovalWorkflow(),
        ];
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

    /**
     * Transform event for dashboard display
     * 
     * @param Event $event
     * @return array
     */
    private function transformEventForDashboard(Event $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'start_date' => $event->start_date->format('Y-m-d H:i:s'),
            'end_date' => $event->end_date->format('Y-m-d H:i:s'),
            'status' => [
                'id' => $event->status->id,
                'status_code' => $event->status->status_code,
                'status_name' => $event->status->status_name,
            ],
            'type' => [
                'id' => $event->type->id,
                'type_code' => $event->type->type_code,
                'type_name' => $event->type->type_name,
            ],
            'entity' => [
                'id' => $event->entity->id,
                'name' => $event->entity->name,
            ],
            'category' => $event->category ? [
                'id' => $event->category->id,
                'name' => $event->category->name,
                'color' => $event->category->color,
            ] : null,
            'is_featured' => $event->is_featured,
            'featured_image' => $event->featured_image,
            'current_state_duration' => $this->calculateCurrentStateDuration($event),
            'is_happening' => $event->isHappening(),
            'has_ended' => $event->hasEnded(),
            'is_upcoming' => $event->isUpcoming(),
            'created_at' => $event->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $event->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Calculate how long the event has been in its current state
     * 
     * @param Event $event
     * @return array
     */
    private function calculateCurrentStateDuration(Event $event): array
    {
        $now = Carbon::now();
        $lastUpdate = $event->updated_at;
        
        $diffInHours = $lastUpdate->diffInHours($now);
        $diffInDays = $lastUpdate->diffInDays($now);

        if ($diffInDays > 0) {
            return [
                'value' => $diffInDays,
                'unit' => $diffInDays === 1 ? 'día' : 'días',
                'formatted' => $diffInDays . ($diffInDays === 1 ? ' día' : ' días'),
            ];
        } elseif ($diffInHours > 0) {
            return [
                'value' => $diffInHours,
                'unit' => $diffInHours === 1 ? 'hora' : 'horas',
                'formatted' => $diffInHours . ($diffInHours === 1 ? ' hora' : ' horas'),
            ];
        } else {
            $diffInMinutes = $lastUpdate->diffInMinutes($now);
            return [
                'value' => max(1, $diffInMinutes),
                'unit' => $diffInMinutes <= 1 ? 'minuto' : 'minutos',
                'formatted' => max(1, $diffInMinutes) . ($diffInMinutes <= 1 ? ' minuto' : ' minutos'),
            ];
        }
    }
}