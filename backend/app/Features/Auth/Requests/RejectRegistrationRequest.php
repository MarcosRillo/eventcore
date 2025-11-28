<?php

namespace App\Features\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejectRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:10', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Debe proporcionar una razón para el rechazo.',
            'reason.min' => 'La razón debe tener al menos 10 caracteres.',
            'reason.max' => 'La razón no debe superar 500 caracteres.',
        ];
    }
}
