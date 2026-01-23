<?php

namespace App\Features\PublicEvents\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Date Range Request
 *
 * Validation for fetching events within a date range.
 */
class DateRangeRequest extends FormRequest
{
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
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
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
            'start.required' => 'La fecha de inicio es requerida',
            'start.date' => 'La fecha de inicio debe ser una fecha válida',
            'end.required' => 'La fecha de fin es requerida',
            'end.date' => 'La fecha de fin debe ser una fecha válida',
            'end.after_or_equal' => 'La fecha de fin debe ser igual o posterior a la fecha de inicio',
        ];
    }
}
