<?php

namespace App\Features\Organizer\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request for creating organizer events.
 * Validates all required and optional fields for event creation.
 */
class StoreOrganizerEventRequest extends FormRequest
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
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category_id' => 'required|exists:categories,id',
            'location_ids' => 'required|array|min:1',
            'location_ids.*' => 'exists:locations,id',

            // Basic information
            'edition_number' => 'nullable|string|max:100',
            'event_type' => 'nullable|string|max:100',
            'event_subtype' => 'nullable|string|max:100',
            'origin' => 'nullable|string|max:100',
            'theme' => 'nullable|string|max:100',
            'frequency' => 'nullable|string|max:100',
            'rotation_type' => 'nullable|string|max:100',

            // Catering services
            'coffee_break' => 'nullable|boolean',
            'lunch_catering' => 'nullable|boolean',
            'dinner_catering' => 'nullable|boolean',
            'pre_event_package' => 'nullable|boolean',
            'post_event_package' => 'nullable|boolean',

            // Location
            'venue' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'rooms_used' => 'nullable|string|max:255',
            'maps_url' => 'nullable|string',
            'previous_venue' => 'nullable|string|max:255',
            'next_venue' => 'nullable|string|max:255',

            // Asynchronous dates
            'asynchronous_dates' => 'nullable|array',
            'asynchronous_dates.*.date' => 'required_with:asynchronous_dates|date',
            'asynchronous_dates.*.start_time' => 'required_with:asynchronous_dates|date_format:H:i',
            'asynchronous_dates.*.end_time' => 'required_with:asynchronous_dates|date_format:H:i',

            // Attendance
            'local_attendance' => 'nullable|integer|min:0',
            'national_attendance' => 'nullable|integer|min:0',
            'international_attendance' => 'nullable|integer|min:0',
            'virtual_transmission' => 'nullable|boolean',

            // Additional information
            'producer' => 'nullable|string|max:255',
            'event_website' => 'nullable|url|max:500',

            // Images
            'logo_url' => 'nullable|string|max:500',
            'featured_image' => 'nullable|string|max:500',
            'responsive_image_url' => 'nullable|string|max:500',

            // Legacy fields
            'type_id' => 'nullable|exists:event_types,id',
            'max_attendees' => 'nullable|integer|min:1',
            'virtual_link' => 'nullable|url',
            'cta_link' => 'nullable|url',
            'cta_text' => 'nullable|string|max:255',
        ];
    }

}
