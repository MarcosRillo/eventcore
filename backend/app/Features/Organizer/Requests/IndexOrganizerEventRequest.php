<?php

namespace App\Features\Organizer\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexOrganizerEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => 'sometimes|string|max:255',
            'status' => 'sometimes|string',
            'show_past' => 'sometimes|string|in:0,1',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ];
    }
}
