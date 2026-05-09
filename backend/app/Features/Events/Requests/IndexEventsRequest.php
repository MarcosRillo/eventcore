<?php

namespace App\Features\Events\Requests;

use App\Features\Shared\Requests\PaginationRequest;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Request validation for listing events with filters.
 */
class IndexEventsRequest extends PaginationRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'event_type_id' => 'sometimes|integer|exists:event_types,id',
            'status_id' => 'sometimes|integer|exists:event_statuses,id',
            'status' => 'sometimes|string|max:50',
            'is_featured' => 'sometimes|boolean',
            'show_past' => 'sometimes|string|in:1',
        ]);
    }
}
