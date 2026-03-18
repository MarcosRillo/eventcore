<?php

namespace App\Features\PublicEvents\Requests;

use App\Features\Shared\Requests\PaginationRequest;

/**
 * Index Public Events Request
 *
 * Validation for listing public events with filters.
 * Extends PaginationRequest for common pagination logic.
 */
class IndexPublicEventsRequest extends PaginationRequest
{
    public const DEFAULT_PER_PAGE = 15;

    public const MAX_PER_PAGE = 100;

    /**
     * Get validation rules
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'event_type_id' => 'sometimes|exists:event_types,id',
            'event_subtype_id' => 'sometimes|exists:event_subtypes,id',
            'location_id' => 'sometimes|exists:locations,id',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'per_page' => 'sometimes|integer|min:1|max:'.self::MAX_PER_PAGE,
        ]);
    }

    /**
     * Get custom validation messages
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'event_type_id.exists' => 'El tipo de evento seleccionado no existe',
            'event_subtype_id.exists' => 'El subtipo de evento seleccionado no existe',
            'location_id.exists' => 'La ubicación seleccionada no existe',
            'end_date.after_or_equal' => 'La fecha de fin debe ser igual o posterior a la fecha de inicio',
        ]);
    }

    /**
     * Get validated per_page value with fallback to default.
     */
    public function getPerPage(): int
    {
        return $this->validated('per_page', self::DEFAULT_PER_PAGE) ?? self::DEFAULT_PER_PAGE;
    }

    /**
     * Get the filter parameters for the query.
     *
     * @return array<string, mixed>
     */
    public function getFilters(): array
    {
        return $this->only(['event_type_id', 'event_subtype_id', 'location_id', 'start_date', 'end_date', 'search']);
    }
}
