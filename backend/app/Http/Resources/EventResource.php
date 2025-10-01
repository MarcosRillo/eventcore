<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Event Resource
 * 
 * Transforms Event model data for API responses.
 * Follows Laravel Resource pattern for consistent API output.
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
            'status' => $this->status,
            'type' => $this->type,
            'location_text' => $this->location_text,
            'virtual_link' => $this->virtual_link,
            'cta_link' => $this->cta_link,
            'cta_text' => $this->cta_text,
            'metadata' => $this->metadata,
            'featured_image' => $this->featured_image,
            'is_featured' => $this->is_featured,
            'max_attendees' => $this->max_attendees,
            
            // Computed properties
            'duration_minutes' => $this->duration_in_minutes,
            'duration_hours' => $this->duration_in_hours,
            'is_happening' => $this->isHappening(),
            'has_ended' => $this->hasEnded(),
            'is_upcoming' => $this->isUpcoming(),
            'is_virtual' => $this->isVirtual(),
            'has_multiple_locations' => $this->hasMultipleLocations(),
            'has_cta' => $this->hasCTA(),
            
            // Relationships
            'category' => $this->whenLoaded('category', function () {
                return new CategoryResource($this->category);
            }),
            
            'locations' => $this->whenLoaded('locations', function () {
                return $this->locations->map(function ($location) {
                    return [
                        'id' => $location->id,
                        'name' => $location->name,
                        'address' => $location->address,
                        'city' => $location->city,
                        'state' => $location->state,
                        'country' => $location->country,
                    ];
                });
            }),
            
            'entity' => $this->whenLoaded('entity', function () {
                return [
                    'id' => $this->entity->id,
                    'name' => $this->entity->name,
                ];
            }),

            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                    'type' => $this->organization->type,
                ];
            }),

            // Direct field access for organization_id
            'organization_id' => $this->organization_id,
            
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
