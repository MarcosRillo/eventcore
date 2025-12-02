<?php

namespace App\Features\Organizer\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request for updating organizer events.
 * Updated for 3NF normalized schema (Nov 30, 2025).
 * Validates all required and optional fields for event updates.
 */
class UpdateOrganizerEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Required fields
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category_id' => 'nullable|exists:categories,id',

            // Event Type and Subtype (hierarchical categorization - Dec 2, 2025)
            'event_type_id' => 'required|exists:event_types,id',
            'event_subtype_id' => 'required|exists:event_subtypes,id',

            // Location: require either existing locations OR custom location
            'location_ids' => 'nullable|array',
            'location_ids.*' => 'exists:locations,id',
            'custom_location_name' => 'nullable|string|max:255|required_without:location_ids',

            // Basic information
            'edition_number' => 'nullable|string|max:100',
            'format_id' => 'nullable|exists:event_formats,id',

            // Normalized FKs (Nov 30, 2025)
            'subtype_id' => 'nullable|exists:event_subtypes,id',
            'origin_id' => 'nullable|exists:event_origins,id',
            'theme_id' => 'nullable|exists:event_themes,id',
            'frequency_id' => 'nullable|exists:event_frequencies,id',
            'rotation_type_id' => 'nullable|exists:event_rotation_types,id',
            'producer_id' => 'nullable|exists:organizations,id',

            // Services (array of service IDs)
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:event_services,id',

            // Rooms (array of room IDs)
            'room_ids' => 'nullable|array',
            'room_ids.*' => 'exists:event_rooms,id',

            // Location info
            'maps_url' => 'nullable|string',
            'previous_venue' => 'nullable|string|max:255',
            'next_venue' => 'nullable|string|max:255',

            // Asynchronous dates (normalized to separate table)
            'async_dates' => 'nullable|array',
            'async_dates.*.date' => 'required_with:async_dates|date',
            'async_dates.*.notes' => 'nullable|string|max:500',

            // Attendance
            'local_attendance' => 'nullable|integer|min:0',
            'national_attendance' => 'nullable|integer|min:0',
            'international_attendance' => 'nullable|integer|min:0',
            'virtual_transmission' => 'nullable|boolean',

            // Additional information
            'event_website' => 'nullable|url|max:500',

            // Images
            'logo_url' => 'nullable|string|max:500',
            'featured_image' => 'nullable|string|max:500',
            'responsive_image_url' => 'nullable|string|max:500',
        ];
    }
}
