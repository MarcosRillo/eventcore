<?php

namespace App\Http\Resources;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Location Resource
 *
 * Transforms Location model data for API responses.
 *
 * @property-read Location $resource
 */
class LocationResource extends JsonResource
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
            'name' => $this->name,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'country' => $this->country,
            'postal_code' => $this->postal_code,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'description' => $this->description,
            'phone' => $this->phone,
            'email' => $this->email,
            'additional_info' => $this->additional_info,
            'is_active' => $this->is_active,

            // Computed properties
            'full_address' => $this->full_address,
            'has_coordinates' => $this->hasCoordinates(),

            // Pivot data (when accessed through event relationship)
            'pivot' => $this->whenPivotLoaded('event_location', function () {
                return [
                    'location_specific_notes' => $this->pivot->location_specific_notes,
                    'max_attendees_for_location' => $this->pivot->max_attendees_for_location,
                    'location_metadata' => $this->pivot->location_metadata,
                ];
            }),

            // Timestamps
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
