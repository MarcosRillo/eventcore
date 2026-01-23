<?php

namespace Tests\Feature\Events;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\User;
use App\Models\UserRole;
use Tests\TestCase;

/**
 * Base test case for event-related tests
 * Provides common helper methods to reduce duplication
 */
abstract class EventTestCase extends TestCase
{
    /**
     * Authenticate a user with specific role for testing
     */
    protected function authenticateUser(string $role = 'entity_admin'): User
    {
        $user = User::factory()->create([
            'role_id' => UserRole::where('role_code', $role)->first()->id,
        ]);
        $this->actingAs($user, 'sanctum');

        return $user;
    }

    /**
     * Get event status ID by status code
     */
    protected function getStatusId(string $statusCode): int
    {
        $status = EventStatus::where('status_code', $statusCode)->first();

        if (! $status) {
            throw new \RuntimeException(
                "EventStatus '{$statusCode}' not found. Did you seed EventStatusesSeeder?",
            );
        }

        return $status->id;
    }

    /**
     * Create an event with specific status
     */
    protected function createEventWithStatus(string $statusCode, array $attributes = []): Event
    {
        return Event::factory()->create(array_merge([
            'status_id' => $this->getStatusId($statusCode),
        ], $attributes));
    }
}
