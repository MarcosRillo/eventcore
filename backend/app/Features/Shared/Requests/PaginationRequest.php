<?php

namespace App\Features\Shared\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Base request class for paginated endpoints.
 * Validates common pagination and filter parameters.
 */
class PaginationRequest extends FormRequest
{
    public const DEFAULT_PER_PAGE = 15;
    public const MAX_PER_PAGE = 100;

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
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:' . self::MAX_PER_PAGE,
            'search' => 'sometimes|string|max:255',
        ];
    }

    /**
     * Get validated per_page value with fallback to default.
     */
    public function getPerPage(): int
    {
        return $this->validated('per_page', self::DEFAULT_PER_PAGE) ?? self::DEFAULT_PER_PAGE;
    }

    /**
     * Custom error messages for validation failures.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'page.min' => 'La página debe ser mayor o igual a 1',
            'per_page.min' => 'Los elementos por página deben ser al menos 1',
            'per_page.max' => 'Los elementos por página no pueden exceder ' . self::MAX_PER_PAGE,
            'search.max' => 'El término de búsqueda no puede exceder 255 caracteres',
        ];
    }
}
