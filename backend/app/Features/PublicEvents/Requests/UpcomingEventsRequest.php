<?php

namespace App\Features\PublicEvents\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Upcoming Events Request
 *
 * Validation for fetching upcoming public events.
 */
class UpcomingEventsRequest extends FormRequest
{
    public const DEFAULT_LIMIT = 10;

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
            'limit.integer' => 'El límite debe ser un número entero',
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
