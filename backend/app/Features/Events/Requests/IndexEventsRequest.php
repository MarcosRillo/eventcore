<?php

namespace App\Features\Events\Requests;

use App\Features\Shared\Requests\PaginationRequest;

/**
 * Request validation for listing events with filters.
 */
class IndexEventsRequest extends PaginationRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'category_id' => 'sometimes|integer|exists:categories,id',
            'status_id' => 'sometimes|integer|exists:event_statuses,id',
            'status' => 'sometimes|string|max:50',
            'is_featured' => 'sometimes|boolean',
            'show_past' => 'sometimes|string|in:1',
        ]);
    }
}
