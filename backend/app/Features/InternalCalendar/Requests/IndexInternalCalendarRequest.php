<?php

namespace App\Features\InternalCalendar\Requests;

use App\Features\Shared\Requests\PaginationRequest;

/**
 * Index Internal Calendar Events Request
 *
 * Validation for filtering internal calendar events.
 * Extends PaginationRequest for common pagination logic.
 *
 * Created: December 10, 2025 (Post-audit improvements)
 */
class IndexInternalCalendarRequest extends PaginationRequest
{
    /**
     * Get validation rules
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'status' => 'sometimes|string|in:approved_internal,pending_public_approval,published',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'event_type_id' => 'sometimes|exists:event_types,id',
        ]);
    }

    /**
     * Get custom validation messages
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'status.in' => 'Status must be one of: approved_internal, pending_public_approval, published',
            'end_date.after_or_equal' => 'End date must be equal or after start date',
            'event_type_id.exists' => 'The selected event type does not exist',
        ]);
    }
}
