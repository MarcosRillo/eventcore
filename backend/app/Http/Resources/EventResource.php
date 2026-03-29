<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Cache;

/**
 * Event Resource
 *
 * Transforms Event model data for API responses.
 * Updated for 3NF normalized schema (Nov 30, 2025).
 *
 * @property-read \App\Models\Event $resource
 */
class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'start_date' => $this->start_date->toISOString(),
            'end_date' => $this->end_date->toISOString(),

            // Display
            'featured_image' => $this->featured_image
                ? (str_starts_with($this->featured_image, 'http')
                    ? $this->featured_image
                    : config('app.url') . $this->featured_image)
                : null,
            'is_featured' => $this->is_featured,
            'logo_url' => $this->logo_url
                ? (str_starts_with($this->logo_url, 'http')
                    ? $this->logo_url
                    : config('app.url') . $this->logo_url)
                : null,
            'responsive_image_url' => $this->responsive_image_url
                ? (str_starts_with($this->responsive_image_url, 'http')
                    ? $this->responsive_image_url
                    : config('app.url') . $this->responsive_image_url)
                : null,

            // Event info
            'edition_number' => $this->edition_number,
            'maps_url' => $this->maps_url,
            'custom_location_name' => $this->custom_location_name,
            'previous_venue' => $this->previous_venue,
            'next_venue' => $this->next_venue,
            'event_website' => $this->event_website,

            // Attendance
            'local_attendance' => $this->local_attendance,
            'national_attendance' => $this->national_attendance,
            'international_attendance' => $this->international_attendance,
            'total_attendance' => $this->total_attendance,

            // Computed properties
            'duration_minutes' => $this->duration_in_minutes,
            'duration_hours' => $this->duration_in_hours,
            'is_happening' => $this->isHappening(),
            'has_ended' => $this->hasEnded(),
            'is_upcoming' => $this->isUpcoming(),
            'is_virtual' => $this->isVirtual(),
            'has_multiple_locations' => $this->hasMultipleLocations(),

            // Core relationships
            'status' => $this->whenLoaded('status', fn () => [
                'id' => $this->status->id,
                'status_code' => $this->status->status_code,
                'status_name' => $this->status->status_name,
                'description' => $this->status->description,
            ]),

            'format' => $this->whenLoaded('format', fn () => [
                'id' => $this->format->id,
                'code' => $this->format->format_code,
                'name' => $this->format->format_name,
            ]),

            'event_type' => $this->whenLoaded('eventType', fn () => [
                'id' => $this->eventType->id,
                'name' => $this->eventType->name,
                'color' => $this->eventType->color,
            ]),

            'event_subtype' => $this->whenLoaded('eventSubtype', fn () => [
                'id' => $this->eventSubtype->id,
                'name' => $this->eventSubtype->name,
            ]),

            'locations' => $this->whenLoaded('locations', fn () => $this->locations->map(fn ($location) => [
                'id' => $location->id,
                'name' => $location->name,
                'address' => $location->address,
                'city' => $location->city,
                'state' => $location->state,
                'country' => $location->country,
            ])),

            'entity' => $this->whenLoaded('entity', fn () => [
                'id' => $this->entity->id,
                'name' => $this->entity->name,
            ]),

            'organization' => $this->whenLoaded('organization', fn () => [
                'id' => $this->organization->id,
                'name' => $this->organization->name,
            ]),

            // Normalized relationships (Nov 30, 2025)
            'subtype' => $this->whenLoaded('subtype', fn () => [
                'id' => $this->subtype->id,
                'code' => $this->subtype->code,
                'name' => $this->subtype->name,
            ]),

            'origin' => $this->whenLoaded('origin', fn () => [
                'id' => $this->origin->id,
                'code' => $this->origin->code,
                'name' => $this->origin->name,
            ]),

            'theme' => $this->whenLoaded('theme', fn () => [
                'id' => $this->theme->id,
                'code' => $this->theme->code,
                'name' => $this->theme->name,
            ]),

            'frequency' => $this->whenLoaded('frequency', fn () => [
                'id' => $this->frequency->id,
                'code' => $this->frequency->code,
                'name' => $this->frequency->name,
            ]),

            'rotation_type' => $this->whenLoaded('rotationType', fn () => [
                'id' => $this->rotationType->id,
                'code' => $this->rotationType->code,
                'name' => $this->rotationType->name,
            ]),

            'producer' => $this->whenLoaded('producer', fn () => [
                'id' => $this->producer->id,
                'name' => $this->producer->name,
            ]),

            'services' => $this->whenLoaded('services', fn () => $this->services->map(fn ($service) => [
                'id' => $service->id,
                'code' => $service->code,
                'name' => $service->name,
                'is_included' => $service->pivot->is_included,
                'notes' => $service->pivot->notes,
            ])),

            'rooms' => $this->whenLoaded('rooms', fn () => $this->rooms->map(fn ($room) => [
                'id' => $room->id,
                'code' => $room->code,
                'name' => $room->name,
                'capacity' => $room->capacity,
            ])),

            'async_dates' => $this->whenLoaded('asyncDates', fn () => $this->asyncDates->map(fn ($date) => [
                'id' => $date->id,
                'date' => $date->date_value->toDateString(),
                'notes' => $date->notes,
            ])),

            // Foreign key IDs for public use (type/subtype)
            'event_type_id' => $this->event_type_id,
            'event_subtype_id' => $this->event_subtype_id,

            // Administrative fields - only for authenticated admin users
            $this->mergeWhen(
                $this->isAdminUser($request),
                [
                    // Foreign key IDs (for admin forms)
                    'status_id' => $this->status_id,
                    'format_id' => $this->format_id,
                    'entity_id' => $this->entity_id,
                    'organization_id' => $this->organization_id,
                    'origin_id' => $this->origin_id,
                    'theme_id' => $this->theme_id,
                    'frequency_id' => $this->frequency_id,
                    'rotation_type_id' => $this->rotation_type_id,
                    'producer_id' => $this->producer_id,

                    // Approval workflow (from normalized event_approvals table)
                    'approval_history' => $this->whenLoaded('approvals', fn () => $this->approvals->map(fn ($a) => [
                        'action' => $a->action,
                        'user_id' => $a->performed_by,
                        'comment' => $a->comments,
                        'timestamp' => $a->performed_at->toISOString(),
                    ])),
                    'created_by' => $this->created_by,
                ],
            ),

            // Public timestamps
            'published_at' => $this->published_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     * Only includes metadata for authenticated admin users.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        if (! $this->isAdminUser($request)) {
            return [];
        }

        return [
            'meta' => [
                'available_statuses' => Cache::rememberForever('event_statuses', fn () => \App\Models\EventStatus::all(['id', 'status_name', 'status_code']),
                ),
                'available_formats' => Cache::rememberForever('event_formats', fn () => \App\Models\EventFormat::all(['id', 'format_name', 'format_code']),
                ),
            ],
        ];
    }

    /**
     * Check if the current user has admin privileges.
     */
    private function isAdminUser(Request $request): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        return $user->isPlatformAdmin()
            || $user->isEntityAdmin()
            || $user->isEntityStaff();
    }
}
