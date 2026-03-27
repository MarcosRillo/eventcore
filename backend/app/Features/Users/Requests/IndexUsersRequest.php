<?php

namespace App\Features\Users\Requests;

use App\Features\Shared\Requests\PaginationRequest;

/**
 * Request validation for listing users with filters.
 */
class IndexUsersRequest extends PaginationRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'status' => 'sometimes|string|in:active,suspended',
        ]);
    }

    /**
     * Custom error messages for validation failures.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'status.in' => 'El estado debe ser active o suspended.',
        ]);
    }
}
