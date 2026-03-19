<?php

namespace App\Features\Dashboard\Services;

use App\Models\Event;
use Carbon\Carbon;

/**
 * Dashboard Transformer
 *
 * Handles data transformation for dashboard views.
 * Converts Event models to arrays suitable for frontend consumption.
 */
class DashboardTransformer
{
    /**
     * Transform event for dashboard list display.
     */
    public function transformForList(Event $event): array
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
            'format' => [
                'id' => $event->format->id,
                'format_code' => $event->format->format_code,
                'format_name' => $event->format->format_name,
            ],
            'entity' => [
                'id' => $event->entity->id,
                'name' => $event->entity->name,
            ],
            'event_type' => $event->eventType ? [
                'id' => $event->eventType->id,
                'name' => $event->eventType->name,
            ] : null,
            'event_subtype' => $event->eventSubtype ? [
                'id' => $event->eventSubtype->id,
                'name' => $event->eventSubtype->name,
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
     * Transform event for detail modal view.
     */
    public function transformForDetail(Event $event): array
    {
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
            'format' => [
                'id' => $event->format->id,
                'format_code' => $event->format->format_code,
                'format_name' => $event->format->format_name,
            ],
            'entity' => [
                'id' => $event->entity->id,
                'name' => $event->entity->name,
                'email' => $event->entity->email,
                'phone' => $event->entity->phone,
            ],
            'event_type' => $event->eventType ? [
                'id' => $event->eventType->id,
                'name' => $event->eventType->name,
            ] : null,
            'event_subtype' => $event->eventSubtype ? [
                'id' => $event->eventSubtype->id,
                'name' => $event->eventSubtype->name,
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
            'approval_history' => $event->relationLoaded('approvals')
                ? $event->approvals->map(fn ($a) => [
                    'action' => $a->action,
                    'user_id' => $a->performed_by,
                    'comment' => $a->comments,
                    'timestamp' => $a->performed_at->toISOString(),
                ])->toArray()
                : [],
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
     * Calculate how long the event has been in its current state.
     */
    public function calculateCurrentStateDuration(Event $event): array
    {
        $now = Carbon::now();
        $lastUpdate = $event->updated_at;

        $diffInHours = $lastUpdate->diffInHours($now);
        $diffInDays = $lastUpdate->diffInDays($now);

        if ($diffInDays > 0) {
            return [
                'value' => $diffInDays,
                'unit' => $diffInDays === 1 ? 'día' : 'días',
                'formatted' => $diffInDays.($diffInDays === 1 ? ' día' : ' días'),
            ];
        } elseif ($diffInHours > 0) {
            return [
                'value' => $diffInHours,
                'unit' => $diffInHours === 1 ? 'hora' : 'horas',
                'formatted' => $diffInHours.($diffInHours === 1 ? ' hora' : ' horas'),
            ];
        } else {
            $diffInMinutes = $lastUpdate->diffInMinutes($now);

            return [
                'value' => max(1, $diffInMinutes),
                'unit' => $diffInMinutes <= 1 ? 'minuto' : 'minutos',
                'formatted' => max(1, $diffInMinutes).($diffInMinutes <= 1 ? ' minuto' : ' minutos'),
            ];
        }
    }
}
