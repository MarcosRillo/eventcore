<?php

namespace App\Features\Events\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Event;
use App\Models\EventStatus;
use Mews\Purifier\Facades\Purifier;

/**
 * Store Event Request
 *
 * Validation rules for creating new events.
 * Updated for 3NF normalized schema (Nov 30, 2025).
 */
class StoreEventRequest extends FormRequest
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
        if ($this->has('description') && !empty($this->input('description'))) {
            $this->merge([
                'description' => Purifier::clean($this->input('description'))
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
            // Core required fields
            'title' => [
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
                'required',
                'date',
                'after:now',
            ],
            'end_date' => [
                'required',
                'date',
                'after:start_date',
            ],
            'status_id' => [
                'required',
                'integer',
                Rule::exists('event_statuses', 'id'),
            ],
            'format_id' => [
                'required',
                'integer',
                Rule::exists('event_formats', 'id'),
            ],

            // Locations (required at least one)
            'location_ids' => [
                'required',
                'array',
                'min:1',
                'max:10',
            ],
            'location_ids.*' => [
                'integer',
                Rule::exists('locations', 'id')->where(function ($query) {
                    $user = $this->user();
                    if ($user) {
                        $organization = $user->organizations()->first();
                        if ($organization) {
                            $query->where('entity_id', $organization->id);
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
                'required',
                'integer',
                Rule::exists('event_types', 'id'),
            ],
            'event_subtype_id' => [
                'required',
                'integer',
                Rule::exists('event_subtypes', 'id'),
            ],

            // Normalized FKs (Nov 30, 2025)
            'subtype_id' => 'nullable|exists:event_subtypes,id',
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
            'maps_url' => 'nullable|string',
            'previous_venue' => 'nullable|string|max:255',
            'next_venue' => 'nullable|string|max:255',

            // Async dates (normalized table)
            'async_dates' => 'nullable|array',
            'async_dates.*.date' => 'required_with:async_dates|date',
            'async_dates.*.notes' => 'nullable|string|max:500',

            // Attendance
            'local_attendance' => 'nullable|integer|min:0',
            'national_attendance' => 'nullable|integer|min:0',
            'international_attendance' => 'nullable|integer|min:0',
            'virtual_transmission' => 'nullable|boolean',

            // Additional info
            'event_website' => 'nullable|url|max:500',

            // Images
            'featured_image' => 'nullable|string|max:500',
            'logo_url' => 'nullable|string|max:500',
            'responsive_image_url' => 'nullable|string|max:500',
            'is_featured' => 'nullable|boolean',

            // Entity/Organization
            'entity_id' => [
                'required',
                'integer',
                Rule::exists('organizations', 'id'),
            ],
            'organization_id' => [
                'nullable',
                'integer',
                Rule::exists('organizations', 'id'),
            ],
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
            'start_date.after' => 'La fecha de inicio debe ser posterior a la fecha actual.',
            'end_date.required' => 'La fecha de fin es obligatoria.',
            'end_date.after' => 'La fecha de fin debe ser posterior a la fecha de inicio.',
            'status_id.required' => 'El estado del evento es obligatorio.',
            'status_id.exists' => 'El estado seleccionado no es válido.',
            'format_id.required' => 'El formato de evento es obligatorio.',
            'format_id.exists' => 'El formato de evento seleccionado no es válido.',
            'location_ids.required' => 'Debe seleccionar al menos una ubicación.',
            'location_ids.array' => 'Las ubicaciones deben ser un array.',
            'location_ids.min' => 'Debe seleccionar al menos una ubicación.',
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
        });
    }

    /**
     * Validate event date range constraints.
     */
    protected function validateDateRange($validator): void
    {
        $startDate = $this->input('start_date');
        $endDate = $this->input('end_date');

        if ($startDate && $endDate) {
            $start = new \DateTime($startDate);
            $end = new \DateTime($endDate);
            $diffInHours = $start->diff($end)->h + ($start->diff($end)->days * 24);

            // Events cannot be longer than 7 days
            if ($diffInHours > (7 * 24)) {
                $validator->errors()->add(
                    'end_date',
                    'Los eventos no pueden durar más de 7 días.'
                );
            }

            // Events must be at least 30 minutes long
            if ($diffInHours < 0.5) {
                $validator->errors()->add(
                    'end_date',
                    'Los eventos deben durar al menos 30 minutos.'
                );
            }
        }
    }

    /**
     * Get validated data with computed entity_id.
     */
    public function getValidatedDataWithEntity(): array
    {
        $data = $this->validated();

        // Get entity_id from user's organization (same logic as TenantScope)
        $user = $this->user();
        if ($user) {
            $organization = $user->organizations()->first();
            if ($organization) {
                $data['entity_id'] = $organization->id;
            }
        }

        return $data;
    }
}
