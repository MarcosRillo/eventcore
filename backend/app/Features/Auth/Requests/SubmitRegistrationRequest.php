<?php

namespace App\Features\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $fields = ['first_name', 'last_name', 'organization_name', 'organization_sector', 'motivation'];

        $sanitized = [];
        foreach ($fields as $field) {
            if ($this->has($field) && ! empty($this->input($field))) {
                $sanitized[$field] = strip_tags($this->input($field));
            }
        }

        if (! empty($sanitized)) {
            $this->merge($sanitized);
        }
    }

    public function rules(): array
    {
        return [
            'dni' => ['required', 'string', 'max:20'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                'email',
                'unique:users,email',
                'unique:registration_requests,email,NULL,id,status,pending',
            ],
            'whatsapp' => ['required', 'string', 'max:20'],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
            'organization_name' => ['required', 'string', 'max:255'],
            'organization_cuit' => [
                'required',
                'string',
                'regex:/^\d{2}-\d{8}-\d$/',
                'unique:organizations,cuit',
                'unique:registration_requests,organization_cuit,NULL,id,status,pending',
            ],
            'organization_sector' => ['required', 'string', 'max:100'],
            'organization_logo' => ['nullable', 'image', 'max:2048'],
            'website' => ['nullable', 'url', 'max:255'],
            'motivation' => ['required', 'string', 'min:50', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'dni.required' => 'El DNI es obligatorio.',
            'first_name.required' => 'El nombre es obligatorio.',
            'last_name.required' => 'El apellido es obligatorio.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'Debe proporcionar un email válido.',
            'email.unique' => 'Ya existe un usuario o solicitud pendiente con este email.',
            'whatsapp.required' => 'El WhatsApp es obligatorio.',
            'profile_photo.image' => 'La foto de perfil debe ser una imagen.',
            'profile_photo.max' => 'La foto de perfil no debe superar 2MB.',
            'organization_name.required' => 'El nombre de la organización es obligatorio.',
            'organization_cuit.required' => 'El CUIT de la organización es obligatorio.',
            'organization_cuit.regex' => 'El CUIT debe tener el formato XX-XXXXXXXX-X.',
            'organization_cuit.unique' => 'Ya existe una organización o solicitud pendiente con este CUIT.',
            'organization_sector.required' => 'El rubro es obligatorio.',
            'organization_logo.image' => 'El logo debe ser una imagen.',
            'organization_logo.max' => 'El logo no debe superar 2MB.',
            'website.url' => 'El sitio web debe ser una URL válida.',
            'motivation.required' => 'La motivación es obligatoria.',
            'motivation.min' => 'La motivación debe tener al menos 50 caracteres.',
            'motivation.max' => 'La motivación no debe superar 1000 caracteres.',
        ];
    }
}
