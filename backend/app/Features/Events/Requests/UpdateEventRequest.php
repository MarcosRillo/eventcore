<?php

namespace App\Features\Events\Requests;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Services\HtmlSanitizer;

/**
 * Update Event Request
 *
 * Validation rules for updating existing events.
 * Updated for 3NF normalized schema (Nov 30, 2025).
 */
class UpdateEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware/policies
    }

    /**
     * CAPA 1: Sanitize description before validation (defense in depth layer 1).
     *
     * This method runs BEFORE validation, removing malicious HTML/JavaScript
     * from the description field. This is the first layer of defense.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('description') && ! empty($this->input('description'))) {
            $this->merge([
                'description' => HtmlSanitizer::clean($this->input('description')),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Core fields
            'title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'min:3',
            ],
            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'start_date' => [
                'sometimes',
                'required',
                'date',
            ],
            'end_date' => [
                'sometimes',
                'required',
                'date',
                'after:start_date',
            ],
            'format_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('event_formats', 'id'),
            ],

            // Locations
            'location_ids' => [
                'nullable',
                'array',
                'max:10',
            ],
            'location_ids.*' => [
                'integer',
                Rule::exists('locations', 'id')->where(function ($query) {
                    $user = $this->user();
                    if ($user) {
                        $organizationId = $user->organization_id;
                        if ($organizationId) {
                            $query->where('entity_id', $organizationId);
                        } else {
                            $query->where('id', null);
                        }
                    } else {
                        $query->where('id', null);
                    }
                }),
            ],

            // Basic information
            'edition_number' => 'nullable|string|max:100',

            // Event Type and Subtype (hierarchical categorization - Dec 2, 2025)
            'event_type_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('event_types', 'id'),
            ],
            'event_subtype_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('event_subtypes', 'id'),
            ],

            // Normalized FKs (Nov 30, 2025)
            'origin_id' => 'nullable|exists:event_origins,id',
            'theme_id' => 'nullable|exists:event_themes,id',
            'frequency_id' => 'nullable|exists:event_frequencies,id',
            'rotation_type_id' => 'nullable|exists:event_rotation_types,id',
            'producer_id' => 'nullable|exists:organizations,id',

            // Services and Rooms (many-to-many)
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:event_services,id',
            'room_ids' => 'nullable|array',
            'room_ids.*' => 'exists:event_rooms,id',

            // Location info
            'maps_url' => 'nullable|url|max:500',
            'previous_venue' => 'nullable|string|max:255',
            'next_venue' => 'nullable|string|max:255',

            // Async dates (normalized table)
            'async_dates' => 'nullable|array',
            'async_dates.*.date' => 'required_with:async_dates|date',
            'async_dates.*.notes' => 'nullable|string|max:500',

            // Attendance
            'local_attendance' => 'nullable|integer|min:0|max:10000000',
            'national_attendance' => 'nullable|integer|min:0|max:10000000',
            'international_attendance' => 'nullable|integer|min:0|max:10000000',
            'virtual_transmission' => 'nullable|boolean',

            // Additional info
            'event_website' => 'nullable|url|max:500',

            // Images
            'featured_image' => 'nullable|string|max:500',
            'logo_url' => 'nullable|string|max:500',
            'responsive_image_url' => 'nullable|string|max:500',
            'is_featured' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'El título del evento es obligatorio.',
            'title.min' => 'El título debe tener al menos 3 caracteres.',
            'title.max' => 'El título no puede exceder 255 caracteres.',
            'description.max' => 'La descripción no puede exceder 5000 caracteres.',
            'start_date.required' => 'La fecha de inicio es obligatoria.',
            'end_date.required' => 'La fecha de fin es obligatoria.',
            'end_date.after' => 'La fecha de fin debe ser posterior a la fecha de inicio.',
            'format_id.exists' => 'El formato de evento seleccionado no es válido.',
            'location_ids.array' => 'Las ubicaciones deben ser un array.',
            'location_ids.max' => 'No puede seleccionar más de 10 ubicaciones.',
            'location_ids.*.integer' => 'Los IDs de ubicación deben ser números enteros.',
            'location_ids.*.exists' => 'Una o más ubicaciones seleccionadas no existen.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $this->validateDateRange($validator);
            $this->validatePublishedEventChanges($validator);
        });
    }

    /**
     * Validate event date range constraints.
     */
    protected function validateDateRange($validator): void
    {
        $startDate = $this->input('start_date');
        $endDate = $this->input('end_date');

        // If only one date is provided, get the other from the existing event
        if (($startDate || $endDate) && $this->route('event')) {
            $event = $this->route('event');
            $startDate = $startDate ?? $event->start_date->format('Y-m-d H:i:s');
            $endDate = $endDate ?? $event->end_date->format('Y-m-d H:i:s');
        }

        if ($startDate && $endDate) {
            $start = new \DateTime($startDate);
            $end = new \DateTime($endDate);
            $diffInHours = $start->diff($end)->h + ($start->diff($end)->days * 24);

            // Events cannot be longer than 7 days
            if ($diffInHours > (7 * 24)) {
                $validator->errors()->add(
                    'end_date',
                    'Los eventos no pueden durar más de 7 días.',
                );
            }

            // Events must be at least 30 minutes long
            if ($diffInHours < 0.5) {
                $validator->errors()->add(
                    'end_date',
                    'Los eventos deben durar al menos 30 minutos.',
                );
            }
        }
    }

    /**
     * Validate changes to published events.
     */
    protected function validatePublishedEventChanges($validator): void
    {
        if ($this->route('event')) {
            $event = $this->route('event');

            // If event is published and has ended, prevent most changes
            if ($event->status?->status_code === 'published' && $event->hasEnded()) {
                $allowedFields = ['description'];
                $changedFields = array_keys($this->all());

                $restrictedChanges = array_diff($changedFields, $allowedFields);

                if (! empty($restrictedChanges)) {
                    $validator->errors()->add(
                        'status',
                        'No se pueden modificar eventos publicados que ya han finalizado, excepto la descripción.',
                    );
                }
            }
        }
    }
}
