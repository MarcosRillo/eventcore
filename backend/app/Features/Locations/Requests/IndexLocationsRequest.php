<?php

namespace App\Features\Locations\Requests;

use App\Features\Shared\Requests\PaginationRequest;

/**
 * Request validation for listing locations with filters.
 */
class IndexLocationsRequest extends PaginationRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'active' => 'sometimes|boolean',
        ]);
    }
}
