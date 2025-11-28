<?php

namespace App\Features\Events\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventType;

/**
 * Store Event Request
 *
 * Validation rules for creating new events.
 * Handles complex validation including location consistency and date validation.
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
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
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
            'type_id' => [
                'required',
                'integer',
                Rule::exists('event_types', 'id'),
            ],
            'virtual_link' => [
                'nullable',
                'url',
                'max:500',
            ],
            'cta_link' => [
                'nullable',
                'url',
                'max:500',
            ],
            'cta_text' => [
                'nullable',
                'string',
                'max:100',
                'required_with:cta_link',
            ],
            'metadata' => [
                'nullable',
                'array',
            ],
            'featured_image' => [
                'nullable',
                'string',
                'max:500',
            ],
            'is_featured' => [
                'nullable',
                'boolean',
            ],
            'max_attendees' => [
                'nullable',
                'integer',
                'min:1',
                'max:100000',
            ],
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->where(function ($query) {
                    $user = $this->user();
                    if ($user) {
                        // Get the user's organization ID using the same logic as TenantScope
                        $organization = $user->organizations()->first();
                        if ($organization) {
                            $query->where('entity_id', $organization->id);
                        } else {
                            // If user has no organizations, make validation fail
                            $query->where('id', null);
                        }
                    } else {
                        // If no user, make validation fail
                        $query->where('id', null);
                    }
                }),
            ],
            'location_text' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'location_ids' => [
                'nullable',
                'array',
                'max:10', // Maximum 10 locations per event
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
            'type_id.required' => 'El tipo de evento es obligatorio.',
            'type_id.exists' => 'El tipo de evento seleccionado no es válido.',
            'virtual_link.url' => 'El enlace virtual debe ser una URL válida.',
            'cta_link.url' => 'El enlace de call-to-action debe ser una URL válida.',
            'cta_text.required_with' => 'El texto del call-to-action es obligatorio cuando se proporciona un enlace.',
            'max_attendees.min' => 'El número máximo de asistentes debe ser al menos 1.',
            'max_attendees.max' => 'El número máximo de asistentes no puede exceder 100,000.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'location_text.string' => 'La ubicación debe ser texto.',
            'location_text.max' => 'La ubicación no puede exceder 1000 caracteres.',
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
            $this->validateLocationConsistency($validator);
            $this->validateDateRange($validator);
        });
    }

    /**
     * Validate that event type is consistent with location data.
     */
    protected function validateLocationConsistency($validator): void
    {
        $typeId = $this->input('type_id');
        $eventType = EventType::find($typeId);
        $typeCode = $eventType?->type_code;
        $locationText = $this->input('location_text');
        $locationIds = $this->input('location_ids');

        // At least one location method must be provided
        if (empty($locationText) && empty($locationIds)) {
            $validator->errors()->add(
                'location_text',
                'Debe proporcionar al menos una ubicación (texto libre o ubicaciones estructuradas).'
            );
            $validator->errors()->add(
                'location_ids',
                'Debe proporcionar al menos una ubicación (texto libre o ubicaciones estructuradas).'
            );
            return;
        }

        // Cannot use both methods simultaneously
        if (!empty($locationText) && !empty($locationIds)) {
            $validator->errors()->add(
                'location_text',
                'No puede usar ubicación de texto libre y ubicaciones estructuradas al mismo tiempo.'
            );
            $validator->errors()->add(
                'location_ids',
                'No puede usar ubicación de texto libre y ubicaciones estructuradas al mismo tiempo.'
            );
            return;
        }

        // Validate consistency with event type
        if ($typeCode === 'sede_unica' && !empty($locationIds) && count($locationIds) > 1) {
            $validator->errors()->add(
                'location_ids',
                'Los eventos de sede única solo pueden tener una ubicación estructurada.'
            );
        }

        if ($typeCode === 'multi_sede' && !empty($locationIds) && count($locationIds) === 1) {
            $validator->errors()->add(
                'type_id',
                'Los eventos multi-sede requieren múltiples ubicaciones o usar texto libre.'
            );
        }
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
