<?php

namespace App\Features\Locations\Requests;

use App\Services\HtmlSanitizer;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validation for creating a new location.
 */
class StoreLocationRequest extends FormRequest
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
            'name'        => 'required|string|max:255',
            'address'     => 'required|string|max:500',
            'city'        => 'required|string|max:100',
            'state'       => 'nullable|string|max:100',
            'country'     => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'is_active'   => 'nullable|boolean',
        ];
    }
}
