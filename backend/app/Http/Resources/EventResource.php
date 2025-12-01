<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'featured_image' => $this->featured_image,
            'is_featured' => $this->is_featured,
            'logo_url' => $this->logo_url,
            'responsive_image_url' => $this->responsive_image_url,

            // Event info
            'edition_number' => $this->edition_number,
            'maps_url' => $this->maps_url,
            'previous_venue' => $this->previous_venue,
            'next_venue' => $this->next_venue,
            'event_website' => $this->event_website,
            'virtual_transmission' => $this->virtual_transmission,

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
            'status' => $this->whenLoaded('status', fn() => [
                'id' => $this->status->id,
                'code' => $this->status->status_code,
                'name' => $this->status->status_name,
            ]),

            'type' => $this->whenLoaded('type', fn() => [
                'id' => $this->type->id,
                'code' => $this->type->type_code,
                'name' => $this->type->type_name,
            ]),

            'category' => $this->whenLoaded('category', fn() => new CategoryResource($this->category)),

            'locations' => $this->whenLoaded('locations', fn() => $this->locations->map(fn($location) => [
                'id' => $location->id,
                'name' => $location->name,
                'address' => $location->address,
                'city' => $location->city,
                'state' => $location->state,
                'country' => $location->country,
            ])),

            'entity' => $this->whenLoaded('entity', fn() => [
                'id' => $this->entity->id,
                'name' => $this->entity->name,
            ]),

            'organization' => $this->whenLoaded('organization', fn() => [
                'id' => $this->organization->id,
                'name' => $this->organization->name,
            ]),

            // Normalized relationships (Nov 30, 2025)
            'subtype' => $this->whenLoaded('subtype', fn() => [
                'id' => $this->subtype->id,
                'code' => $this->subtype->code,
                'name' => $this->subtype->name,
            ]),

            'origin' => $this->whenLoaded('origin', fn() => [
                'id' => $this->origin->id,
                'code' => $this->origin->code,
                'name' => $this->origin->name,
            ]),

            'theme' => $this->whenLoaded('theme', fn() => [
                'id' => $this->theme->id,
                'code' => $this->theme->code,
                'name' => $this->theme->name,
            ]),

            'frequency' => $this->whenLoaded('frequency', fn() => [
                'id' => $this->frequency->id,
                'code' => $this->frequency->code,
                'name' => $this->frequency->name,
            ]),

            'rotation_type' => $this->whenLoaded('rotationType', fn() => [
                'id' => $this->rotationType->id,
                'code' => $this->rotationType->code,
                'name' => $this->rotationType->name,
            ]),

            'producer' => $this->whenLoaded('producer', fn() => [
                'id' => $this->producer->id,
                'name' => $this->producer->name,
            ]),

            'services' => $this->whenLoaded('services', fn() => $this->services->map(fn($service) => [
                'id' => $service->id,
                'code' => $service->code,
                'name' => $service->name,
                'is_included' => $service->pivot->is_included,
                'notes' => $service->pivot->notes,
            ])),

            'rooms' => $this->whenLoaded('rooms', fn() => $this->rooms->map(fn($room) => [
                'id' => $room->id,
                'code' => $room->code,
                'name' => $room->name,
                'capacity' => $room->capacity,
            ])),

            'async_dates' => $this->whenLoaded('asyncDates', fn() => $this->asyncDates->map(fn($date) => [
                'id' => $date->id,
                'date' => $date->date_value->toDateString(),
                'notes' => $date->notes,
            ])),

            // Foreign key IDs (for forms)
            'status_id' => $this->status_id,
            'type_id' => $this->type_id,
            'category_id' => $this->category_id,
            'entity_id' => $this->entity_id,
            'organization_id' => $this->organization_id,
            'subtype_id' => $this->subtype_id,
            'origin_id' => $this->origin_id,
            'theme_id' => $this->theme_id,
            'frequency_id' => $this->frequency_id,
            'rotation_type_id' => $this->rotation_type_id,
            'producer_id' => $this->producer_id,

            // Approval workflow
            'approval_comments' => $this->approval_comments,
            'approval_history' => $this->approval_history,
            'created_by' => $this->created_by,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toISOString(),
            'published_at' => $this->published_at?->toISOString(),

            // Timestamps
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'available_statuses' => \App\Models\EventStatus::all(['id', 'status_name', 'status_code']),
                'available_types' => \App\Models\EventType::all(['id', 'type_name', 'type_code']),
            ],
        ];
    }
}
