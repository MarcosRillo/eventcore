<?php

namespace App\Features\Events\Services;

/**
 * ValidationResult - Value object for validation results
 *
 * Holds validation errors with field names as keys.
 */
class ValidationResult
{
    private array $errors;

    public function __construct(array $errors = [])
    {
        $this->errors = $errors;
    }

    public function isValid(): bool
    {
        return empty($this->errors);
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function addError(string $field, string $message): void
    {
        $this->errors[$field] = $message;
    }

    public function hasError(string $field): bool
    {
        return isset($this->errors[$field]);
    }
}
