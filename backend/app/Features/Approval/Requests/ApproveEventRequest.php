<?php

namespace App\Features\Approval\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ApproveEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only entity_admin, entity_staff and platform_admin can approve events
        $userRole = $this->user()?->getRoleCode();

        return in_array($userRole, ['entity_admin', 'entity_staff', 'platform_admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'comments' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'comments.max' => 'Los comentarios no pueden exceder 1000 caracteres.',
        ];
    }
}
