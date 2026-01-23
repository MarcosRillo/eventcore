<?php

namespace App\Features\Dashboard\Requests;

use App\Features\Shared\Requests\PaginationRequest;

/**
 * Index Dashboard Events Request
 *
 * Validation for listing dashboard events with filters.
 * Extends PaginationRequest for common pagination logic.
 */
class IndexDashboardEventsRequest extends PaginationRequest
{
    public const DEFAULT_PER_PAGE = 20;

    /**
     * Valid tab values for dashboard filtering
     */
    public const VALID_TABS = [
        'requires-action',
        'pending',
        'approved',
        'rejected',
        'published',
        'all',
    ];

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
        return array_merge(parent::rules(), [
            'tab' => 'sometimes|string|in:'.implode(',', self::VALID_TABS),
        ]);
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

    /**
     * Get custom validation messages
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'tab.in' => 'La pestaña debe ser una de: '.implode(', ', self::VALID_TABS),
        ]);
    }

    /**
     * Get the tab value with fallback to default.
     */
    public function getTab(): string
    {
        return $this->validated('tab', 'requires-action') ?? 'requires-action';
    }

    /**
     * Get validated per_page value with fallback to default.
     */
    public function getPerPage(): int
    {
        return $this->validated('per_page', self::DEFAULT_PER_PAGE) ?? self::DEFAULT_PER_PAGE;
    }

    /**
     * Get the search term if provided.
     */
    public function getSearch(): string
    {
        return $this->validated('search', '') ?? '';
    }
}
