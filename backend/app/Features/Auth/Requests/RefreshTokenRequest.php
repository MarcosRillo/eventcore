<?php

namespace App\Features\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RefreshTokenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Nullable because token can come from httpOnly cookie instead of request body
            'refresh_token' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'refresh_token.string' => 'Refresh token must be a string',
        ];
    }
}
