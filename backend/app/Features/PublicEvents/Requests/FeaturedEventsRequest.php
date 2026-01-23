<?php

namespace App\Features\PublicEvents\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Featured Events Request
 *
 * Validation for fetching featured public events.
 */
class FeaturedEventsRequest extends FormRequest
{
    public const DEFAULT_LIMIT = 6;

    public const MAX_LIMIT = 20;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
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
