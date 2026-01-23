<?php

namespace App\Features\Dashboard\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Events Summary Request
 *
 * Validation and authorization for dashboard events summary endpoint.
 */
class EventsSummaryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->isEntityAdmin() || $user->isEntityStaff());
    }

    /**
     * Get validation rules
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
    }

    /**
     * Get the error message for failed authorization.
     */
    protected function failedAuthorization(): void
    {
        throw new \Illuminate\Auth\Access\AuthorizationException(
            'Access denied. Dashboard is only available for entity admin and entity staff users.',
        );
    }
}
