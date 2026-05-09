<?php

namespace App\Features\PublicEvents\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Search Public Events Request
 *
 * Validation for searching public events.
 */
class SearchPublicEventsRequest extends FormRequest
{
    public const DEFAULT_LIMIT = 15;

    public const MAX_LIMIT = 50;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get validation rules
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'q' => 'required|string|max:255',
            'event_type_id' => 'sometimes|exists:event_types,id',
            'limit' => 'sometimes|integer|min:1|max:'.self::MAX_LIMIT,
        ];
    }

    /**
     * Get custom validation messages
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'q.required' => 'El término de búsqueda es requerido',
            'q.max' => 'El término de búsqueda no puede exceder 255 caracteres',
            'event_type_id.exists' => 'El tipo de evento seleccionado no existe',
            'limit.min' => 'El límite debe ser al menos 1',
            'limit.max' => 'El límite no puede exceder '.self::MAX_LIMIT,
        ];
    }

    /**
     * Get the limit value with fallback to default.
     */
    public function getLimit(): int
    {
        return $this->validated('limit', self::DEFAULT_LIMIT) ?? self::DEFAULT_LIMIT;
    }
}
