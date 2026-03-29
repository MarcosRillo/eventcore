<?php

namespace App\Features\Approval\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PublishEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only entity_admin, entity_staff and platform_admin can publish events
        $userRole = $this->user()?->getRoleCode();

        return in_array($userRole, ['entity_admin', 'entity_staff', 'platform_admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'scheduled_at' => ['nullable', 'date', 'after:now'],
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
            'scheduled_at.date' => 'La fecha programada debe ser una fecha válida.',
            'scheduled_at.after' => 'La fecha programada debe ser futura.',
        ];
    }
}
