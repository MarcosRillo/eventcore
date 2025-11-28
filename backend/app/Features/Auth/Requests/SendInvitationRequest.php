<?php

namespace App\Features\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendInvitationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                'unique:users,email',
            ],
            'role_id' => [
                'required',
                'exists:user_roles,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'Debe proporcionar un email válido.',
            'email.unique' => 'Ya existe un usuario con este email.',
            'role_id.required' => 'Debe especificar un rol.',
            'role_id.exists' => 'El rol especificado no existe.',
        ];
    }
}
