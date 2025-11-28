<?php

namespace App\Features\Appearance\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppearanceRequest extends FormRequest
{
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
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'banner_url' => ['nullable', 'url', 'max:2048'],
            'color_primary' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'color_secondary' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'color_background' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'color_text' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'logo_url.url' => 'La URL del logo debe ser válida.',
            'logo_url.max' => 'La URL del logo no puede exceder 2048 caracteres.',
            'banner_url.url' => 'La URL del banner debe ser válida.',
            'banner_url.max' => 'La URL del banner no puede exceder 2048 caracteres.',
            'color_primary.regex' => 'El color primario debe ser un color hexadecimal válido (ej: #FF0000).',
            'color_secondary.regex' => 'El color secundario debe ser un color hexadecimal válido (ej: #FF0000).',
            'color_background.regex' => 'El color de fondo debe ser un color hexadecimal válido (ej: #FF0000).',
            'color_text.regex' => 'El color de texto debe ser un color hexadecimal válido (ej: #FF0000).',
        ];
    }
}
