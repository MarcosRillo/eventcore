<?php

namespace Tests\Feature\Organizer;

use App\Models\Category;
use App\Models\Event;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Comprehensive validation tests for OrganizerController
 *
 * Validates all 34 extended fields plus base fields for:
 * - Required/optional constraints
 * - Data types
 * - String lengths
 * - URL formats
 * - Date formats
 * - Numeric ranges
 * - Array structures
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
     * Get a valid type_id, creating one if necessary
     */
    private function getValidTypeId(): int
    {
        $typeId = \DB::table('event_types')->value('id');

        if (!$typeId) {
            $typeId = \DB::table('event_types')->insertGetId([
                'type_name' => 'Test Event Type',
                'type_code' => 'test_type',
                'description' => 'Test type for unit tests',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $typeId;
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

    #[Test]
    public function test_validation_fails_when_event_type_exceeds_max_length(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['event_type'] = str_repeat('a', 101); // Max is 100

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['event_type']);
    }

    #[Test]
    public function test_validation_fails_when_venue_exceeds_max_length(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['venue'] = str_repeat('a', 256); // Max is 255

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['venue']);
    }

    #[Test]
    public function test_validation_fails_when_city_exceeds_max_length(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['city'] = str_repeat('a', 101); // Max is 100

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['city']);
    }

    #[Test]
    public function test_validation_fails_when_producer_exceeds_max_length(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['producer'] = str_repeat('a', 256); // Max is 255

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['producer']);
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

    #[Test]
    public function test_validation_fails_for_invalid_virtual_link_url(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['virtual_link'] = 'invalid-url';

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['virtual_link']);
    }

    #[Test]
    public function test_validation_fails_for_invalid_cta_link_url(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['cta_link'] = 'not-a-url';

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['cta_link']);
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

    #[Test]
    public function test_validation_fails_for_negative_max_attendees(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['max_attendees'] = -50;

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['max_attendees']);
    }

    #[Test]
    public function test_validation_fails_for_zero_max_attendees(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['max_attendees'] = 0; // Min is 1

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['max_attendees']);
    }

    // ==================== BOOLEAN VALIDATIONS ====================

    #[Test]
    public function test_validation_accepts_valid_boolean_values(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['coffee_break'] = true;
        $payload['lunch_catering'] = false;
        $payload['dinner_catering'] = true;
        $payload['virtual_transmission'] = false;
        $payload['type_id'] = $this->getValidTypeId();

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);

        $event = Event::find($response->json('event.id'));
        $this->assertTrue($event->coffee_break);
        $this->assertFalse($event->lunch_catering);
        $this->assertTrue($event->dinner_catering);
        $this->assertFalse($event->virtual_transmission);
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

    // ==================== ASYNCHRONOUS DATES VALIDATIONS ====================

    #[Test]
    public function test_validation_fails_when_asynchronous_dates_missing_date_field(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['asynchronous_dates'] = [
            ['start_time' => '09:00', 'end_time' => '17:00'] // Missing 'date'
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['asynchronous_dates.0.date']);
    }

    #[Test]
    public function test_validation_fails_when_asynchronous_dates_missing_start_time(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['asynchronous_dates'] = [
            ['date' => '2025-12-01', 'end_time' => '17:00'] // Missing 'start_time'
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['asynchronous_dates.0.start_time']);
    }

    #[Test]
    public function test_validation_fails_when_asynchronous_dates_missing_end_time(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['asynchronous_dates'] = [
            ['date' => '2025-12-01', 'start_time' => '09:00'] // Missing 'end_time'
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['asynchronous_dates.0.end_time']);
    }

    #[Test]
    public function test_validation_fails_for_invalid_time_format_in_asynchronous_dates(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['asynchronous_dates'] = [
            ['date' => '2025-12-01', 'start_time' => '9am', 'end_time' => '5pm'] // Invalid format
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['asynchronous_dates.0.start_time', 'asynchronous_dates.0.end_time']);
    }

    #[Test]
    public function test_validation_passes_for_valid_asynchronous_dates(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);
        $payload['asynchronous_dates'] = [
            ['date' => '2025-12-01', 'start_time' => '09:00', 'end_time' => '13:00'],
            ['date' => '2025-12-03', 'start_time' => '14:00', 'end_time' => '18:00']
        ];
        $payload['type_id'] = $this->getValidTypeId();

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);

        $event = Event::find($response->json('event.id'));
        $this->assertCount(2, $event->asynchronous_dates);
    }

    // ==================== OPTIONAL FIELDS TESTS ====================

    #[Test]
    public function test_optional_fields_can_be_null(): void
    {
        $user = $this->createAuthenticatedUser();
        $payload = $this->getMinimalPayload($user);

        // Explicitly set all optional fields to null
        $payload['edition_number'] = null;
        $payload['event_type'] = null;
        $payload['event_subtype'] = null;
        $payload['origin'] = null;
        $payload['theme'] = null;
        $payload['frequency'] = null;
        $payload['rotation_type'] = null;
        $payload['venue'] = null;
        $payload['city'] = null;
        $payload['rooms_used'] = null;
        $payload['maps_url'] = null;
        $payload['previous_venue'] = null;
        $payload['next_venue'] = null;
        $payload['asynchronous_dates'] = null;
        $payload['local_attendance'] = null;
        $payload['national_attendance'] = null;
        $payload['international_attendance'] = null;
        $payload['producer'] = null;
        $payload['event_website'] = null;
        $payload['logo_url'] = null;
        $payload['responsive_image_url'] = null;
        $payload['type_id'] = $this->getValidTypeId();

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);

        $event = Event::find($response->json('event.id'));
        $this->assertNull($event->edition_number);
        $this->assertNull($event->venue);
        $this->assertNull($event->producer);
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
        $this->assertNull($event->venue);
        $this->assertFalse($event->coffee_break);
        $this->assertFalse($event->virtual_transmission);
    }
}
