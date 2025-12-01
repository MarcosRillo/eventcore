<?php

namespace Tests\Feature\Organizer;

use App\Models\Category;
use App\Models\Event;
use App\Models\EventOrigin;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Comprehensive validation tests for OrganizerController
 *
 * Updated for 3NF normalized schema (Nov 30, 2025).
 * Tests validation for normalized fields (FK references)
 * instead of denormalized string fields.
 */
class OrganizerControllerValidationTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed lookup tables
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
        $this->seed(\Database\Seeders\EventLookupSeeder::class);
    }

    /**
     * Create an authenticated user with organizer_admin role
     */
    private function createAuthenticatedUser(): User
    {
        $user = User::factory()->create();
        $organization = Organization::factory()->create();
        $user->organizations()->attach($organization->id);

        // Assign 'organizer_admin' role (required by middleware)
        $organizerRole = \DB::table('user_roles')->where('role_code', 'organizer_admin')->first();
        if ($organizerRole) {
            $user->role_id = $organizerRole->id;
            $user->save();
        }

        $user->refresh();
        $user->organization_id = $organization->id; // Add as property for easy access
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    /**
     * Get a valid type_id
     */
    private function getValidTypeId(): int
    {
        return \DB::table('event_types')->value('id') ?? 1;
    }

    /**
     * Create minimal valid payload for event creation
     */
    private function getMinimalPayload(User $user): array
    {
        $category = Category::factory()->create(['entity_id' => $user->organization_id]);
        $location = Location::factory()->create(['entity_id' => $user->organization_id]);

        return [
            'title' => 'Valid Title',
            'description' => 'Valid Description',
            'start_date' => now()->addDays(10)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
        ];
    }

    // ==================== REQUIRED FIELDS TESTS ====================

    #[Test]
    public function test_validation_fails_without_title(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        unset($payload['title']);

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    #[Test]
    public function test_validation_fails_without_description(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        unset($payload['description']);

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['description']);
    }

    #[Test]
    public function test_validation_fails_without_start_date(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        unset($payload['start_date']);

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['start_date']);
    }

    #[Test]
    public function test_validation_fails_without_category_id(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        unset($payload['category_id']);

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['category_id']);
    }

    #[Test]
    public function test_validation_fails_without_location_ids(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        unset($payload['location_ids']);

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['location_ids']);
    }

    // ==================== STRING LENGTH VALIDATIONS ====================

    #[Test]
    public function test_validation_fails_when_title_exceeds_max_length(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['title'] = str_repeat('a', 256); // Max is 255

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    #[Test]
    public function test_validation_fails_when_edition_number_exceeds_max_length(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['edition_number'] = str_repeat('a', 101); // Max is 100

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['edition_number']);
    }

    // ==================== URL FORMAT VALIDATIONS ====================

    #[Test]
    public function test_validation_fails_for_invalid_event_website_url(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['event_website'] = 'not-a-valid-url';

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['event_website']);
    }

    #[Test]
    public function test_validation_passes_for_valid_event_website_url(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['event_website'] = 'https://example.com';
        $payload['type_id'] = $this->getValidTypeId();

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);
    }

    // ==================== DATE VALIDATIONS ====================

    #[Test]
    public function test_validation_fails_for_invalid_start_date_format(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['start_date'] = 'not-a-date';

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['start_date']);
    }

    #[Test]
    public function test_validation_fails_when_end_date_before_start_date(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['start_date'] = now()->addDays(10)->format('Y-m-d H:i:s');
        $payload['end_date'] = now()->addDays(5)->format('Y-m-d H:i:s'); // Before start

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['end_date']);
    }

    #[Test]
    public function test_validation_passes_when_end_date_equals_start_date(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $date = now()->addDays(10)->format('Y-m-d H:i:s');
        $payload['start_date'] = $date;
        $payload['end_date'] = $date; // Same day allowed
        $payload['type_id'] = $this->getValidTypeId();

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);
    }

    // ==================== NUMERIC VALIDATIONS ====================

    #[Test]
    public function test_validation_fails_for_negative_local_attendance(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['local_attendance'] = -10;

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['local_attendance']);
    }

    #[Test]
    public function test_validation_fails_for_negative_national_attendance(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['national_attendance'] = -5;

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['national_attendance']);
    }

    #[Test]
    public function test_validation_fails_for_negative_international_attendance(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['international_attendance'] = -1;

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['international_attendance']);
    }

    // ==================== BOOLEAN VALIDATIONS ====================

    #[Test]
    public function test_validation_accepts_valid_boolean_values(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['virtual_transmission'] = true;
        $payload['type_id'] = $this->getValidTypeId();

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);

        $event = Event::find($response->json('event.id'));
        $this->assertTrue($event->virtual_transmission);
    }

    // ==================== ARRAY VALIDATIONS ====================

    #[Test]
    public function test_validation_fails_when_location_ids_is_empty_array(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['location_ids'] = []; // Empty array not allowed

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['location_ids']);
    }

    #[Test]
    public function test_validation_fails_when_location_ids_contains_non_existent_id(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['location_ids'] = [99999]; // Non-existent location

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['location_ids.0']);
    }

    #[Test]
    public function test_validation_fails_when_category_id_does_not_exist(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['category_id'] = 99999; // Non-existent category

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['category_id']);
    }

    // ==================== FK VALIDATIONS (3NF NORMALIZED) ====================

    #[Test]
    public function test_validation_fails_for_invalid_origin_id(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['origin_id'] = 99999; // Non-existent origin

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['origin_id']);
    }

    #[Test]
    public function test_validation_passes_for_valid_origin_id(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['origin_id'] = EventOrigin::where('code', 'national')->first()->id;
        $payload['type_id'] = $this->getValidTypeId();

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);
    }

    #[Test]
    public function test_validation_fails_for_invalid_producer_id(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['producer_id'] = 99999; // Non-existent organization

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['producer_id']);
    }

    #[Test]
    public function test_validation_passes_for_valid_producer_id(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $producer = Organization::factory()->create();
        $payload['producer_id'] = $producer->id;
        $payload['type_id'] = $this->getValidTypeId();

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);

        $event = Event::find($response->json('event.id'));
        $this->assertEquals($producer->id, $event->producer_id);
    }

    // ==================== ASYNC DATES VALIDATIONS (NORMALIZED) ====================

    #[Test]
    public function test_validation_fails_when_async_dates_missing_date_field(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['async_dates'] = [
            ['notes' => 'Some notes'] // Missing 'date'
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['async_dates.0.date']);
    }

    #[Test]
    public function test_validation_passes_for_valid_async_dates(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['async_dates'] = [
            ['date' => '2025-12-01', 'notes' => 'Day 1 notes'],
            ['date' => '2025-12-03', 'notes' => 'Day 2 notes']
        ];
        $payload['type_id'] = $this->getValidTypeId();

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);

        $event = Event::find($response->json('event.id'));
        $this->assertCount(2, $event->asyncDates);
    }

    // ==================== OPTIONAL FIELDS TESTS ====================

    #[Test]
    public function test_optional_fields_can_be_null(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);

        // Explicitly set all optional FK fields to null
        $payload['edition_number'] = null;
        $payload['subtype_id'] = null;
        $payload['origin_id'] = null;
        $payload['theme_id'] = null;
        $payload['frequency_id'] = null;
        $payload['rotation_type_id'] = null;
        $payload['producer_id'] = null;
        $payload['maps_url'] = null;
        $payload['previous_venue'] = null;
        $payload['next_venue'] = null;
        $payload['async_dates'] = null;
        $payload['local_attendance'] = null;
        $payload['national_attendance'] = null;
        $payload['international_attendance'] = null;
        $payload['event_website'] = null;
        $payload['logo_url'] = null;
        $payload['responsive_image_url'] = null;
        $payload['type_id'] = $this->getValidTypeId();

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);

        $event = Event::find($response->json('event.id'));
        $this->assertNull($event->edition_number);
        $this->assertNull($event->origin_id);
        $this->assertNull($event->producer_id);
    }

    #[Test]
    public function test_optional_fields_can_be_omitted(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['type_id'] = $this->getValidTypeId();

        // Don't include any optional fields (they should default to null/false)

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);

        $event = Event::find($response->json('event.id'));
        $this->assertNull($event->edition_number);
        $this->assertNull($event->origin_id);
        $this->assertFalse($event->virtual_transmission);
    }
}
