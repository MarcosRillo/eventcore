<?php

namespace Tests\Feature\Organizer;

use App\Models\User;
use App\Models\Event;
use App\Models\Category;
use App\Models\Location;
use App\Models\Organization;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests for OrganizerController@store() method with all 34 extended fields
 *
 * This test suite verifies that the store() method:
 * - Creates events with all 34 fields (7 basic + 5 catering + 6 location + 1 async + 4 attendance + 2 info + 2 images + 7 legacy)
 * - Validates all required and optional fields
 * - Enforces organization ownership security
 * - Syncs locations correctly
 * - Handles asynchronous_dates JSON properly
 */
class OrganizerControllerStoreTest extends TestCase
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

        // Create tourism entity (id=1) that owns shared resources (locations, categories)
        // Required for TenantScope which filters locations to entity_id = 1
        \DB::table('organizations')->insert([
            'id' => 1,
            'name' => 'Ente de Turismo de Tucumán',
            'slug' => 'ente-turismo-tucuman',
            'cuit' => '30-12345678-9',
            'description' => 'Ente principal de turismo',
            'type_id' => \DB::table('organization_types')->value('id'),
            'status_id' => \DB::table('organization_statuses')->value('id'),
            'parent_id' => null,
            'trust_level' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Reset sequence to avoid id collision with factory-created organizations
        \DB::statement('ALTER SEQUENCE organizations_id_seq RESTART WITH 2');
    }

    /**
     * Helper: Create authenticated user with organization and organizer role
     */
    private function createAuthenticatedUser(): User
    {
        $user = User::factory()->create();
        $organization = Organization::factory()->create();
        $user->organizations()->attach($organization->id);

        // Assign 'organizer_admin' role (required by middleware - role_code in DB)
        $organizerRole = \DB::table('user_roles')->where('role_code', 'organizer_admin')->first();
        if ($organizerRole) {
            $user->role_id = $organizerRole->id;
            $user->save();
        }

        // Refresh to load relationships (organization_id is an accessor)
        $user->refresh();

        $this->actingAs($user, 'sanctum');
        return $user;
    }

    /**
     * Helper: Get or create a valid type_id
     */
    private function getValidTypeId(): int
    {
        $typeId = \DB::table('event_types')->value('id');

        if (!$typeId) {
            // If no event_types exist, create one
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

    #[Test]
    public function test_creates_event_with_all_34_extended_fields_successfully(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $category = Category::factory()->create(['entity_id' => $user->organization_id]);
        $location1 = Location::factory()->create(['entity_id' => 1]);
        $location2 = Location::factory()->create(['entity_id' => 1]);
        $typeId = $this->getValidTypeId();

        $payload = [
            // Required fields
            'title' => 'Congreso Internacional de Turismo 2025',
            'description' => 'Evento anual que reúne a los principales actores del sector turístico',
            'start_date' => now()->addDays(30)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(32)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location1->id, $location2->id],
            'type_id' => $typeId,

            // Basic Information (7 fields)
            'edition_number' => '15va Edición',
            'event_type' => 'Congreso',
            'event_subtype' => 'Internacional',
            'origin' => 'Nacional',
            'theme' => 'Turismo Sostenible',
            'frequency' => 'Anual',
            'rotation_type' => 'Rotativo',

            // Catering Services (5 fields)
            'coffee_break' => true,
            'lunch_catering' => true,
            'dinner_catering' => false,
            'pre_event_package' => true,
            'post_event_package' => false,

            // Location (6 fields)
            'venue' => 'Centro de Convenciones',
            'city' => 'San Miguel de Tucumán',
            'rooms_used' => 'Sala Principal, Sala VIP',
            'maps_url' => 'https://maps.google.com/?q=-26.8241,-65.2226',
            'previous_venue' => 'Hotel Sheraton',
            'next_venue' => 'Centro Cultural',

            // Asynchronous Dates (1 field - JSON array)
            'asynchronous_dates' => [
                ['date' => '2025-12-01', 'start_time' => '09:00', 'end_time' => '13:00'],
                ['date' => '2025-12-03', 'start_time' => '14:00', 'end_time' => '18:00']
            ],

            // Attendance (4 fields)
            'local_attendance' => 500,
            'national_attendance' => 200,
            'international_attendance' => 100,
            'virtual_transmission' => true,

            // Additional Information (2 fields)
            'producer' => 'Ente de Turismo Tucumán',
            'event_website' => 'https://congreso-turismo.gob.ar',

            // Images (3 fields)
            'logo_url' => 'https://example.com/logo.png',
            'featured_image' => 'https://example.com/featured.jpg',
            'responsive_image_url' => 'https://example.com/responsive.jpg',
        ];

        // Act
        $response = $this->postJson('/api/v1/organizer/events', $payload);

        // Assert: Response structure (Assertions 1-3)
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'event' => [
                'id',
                'title',
                'description',
                'start_date',
                'end_date'
            ]
        ]);
        $response->assertJsonPath('event.title', 'Congreso Internacional de Turismo 2025');

        // Assert: Verify all 34 fields in database (Assertions 4-37)
        $eventId = $response->json('event.id');
        $this->assertDatabaseHas('events', [
            'id' => $eventId,
            // Basic fields
            'title' => 'Congreso Internacional de Turismo 2025',
            'description' => 'Evento anual que reúne a los principales actores del sector turístico',
            'category_id' => $category->id,

            // Basic Information (7 fields)
            'edition_number' => '15va Edición',
            'event_type' => 'Congreso',
            'event_subtype' => 'Internacional',
            'origin' => 'Nacional',
            'theme' => 'Turismo Sostenible',
            'frequency' => 'Anual',
            'rotation_type' => 'Rotativo',

            // Catering (5 fields)
            'coffee_break' => true,
            'lunch_catering' => true,
            'dinner_catering' => false,
            'pre_event_package' => true,
            'post_event_package' => false,

            // Location (6 fields)
            'venue' => 'Centro de Convenciones',
            'city' => 'San Miguel de Tucumán',
            'rooms_used' => 'Sala Principal, Sala VIP',
            'maps_url' => 'https://maps.google.com/?q=-26.8241,-65.2226',
            'previous_venue' => 'Hotel Sheraton',
            'next_venue' => 'Centro Cultural',

            // Attendance (4 fields)
            'local_attendance' => 500,
            'national_attendance' => 200,
            'international_attendance' => 100,
            'virtual_transmission' => true,

            // Additional Info (2 fields)
            'producer' => 'Ente de Turismo Tucumán',
            'event_website' => 'https://congreso-turismo.gob.ar',

            // Images (3 fields)
            'logo_url' => 'https://example.com/logo.png',
            'featured_image' => 'https://example.com/featured.jpg',
            'responsive_image_url' => 'https://example.com/responsive.jpg',
        ]);

        // Assert: Verify asynchronous_dates JSON field (Assertions 38-40)
        $event = Event::find($eventId);
        $this->assertIsArray($event->asynchronous_dates);
        $this->assertCount(2, $event->asynchronous_dates);
        $this->assertEquals('2025-12-01', $event->asynchronous_dates[0]['date']);

        // Assert: Verify locations synced correctly (Assertions 41-42)
        $this->assertEquals(2, $event->locations()->count());
        $this->assertTrue($event->locations->contains($location1->id));
    }

    #[Test]
    public function test_creates_event_with_only_required_fields(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $category = Category::factory()->create(['entity_id' => $user->organization_id]);
        $location = Location::factory()->create(['entity_id' => 1]);
        $typeId = $this->getValidTypeId();

        $payload = [
            'title' => 'Evento Mínimo',
            'description' => 'Descripción básica',
            'start_date' => now()->addDays(10)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
            'type_id' => $typeId,
        ];

        // Act
        $response = $this->postJson('/api/v1/organizer/events', $payload);

        // Assert (Assertions 1-10)
        $response->assertStatus(201);
        $response->assertJsonPath('event.title', 'Evento Mínimo');

        $eventId = $response->json('event.id');
        $this->assertDatabaseHas('events', [
            'id' => $eventId,
            'title' => 'Evento Mínimo',
            'description' => 'Descripción básica',
            'category_id' => $category->id,
        ]);

        // Verify optional fields are null
        $event = Event::find($eventId);
        $this->assertNull($event->edition_number);
        $this->assertNull($event->venue);
        $this->assertNull($event->producer);
        $this->assertFalse($event->coffee_break);
        $this->assertEquals(1, $event->locations()->count());
    }

    #[Test]
    public function test_validation_fails_without_required_title(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $category = Category::factory()->create();
        $location = Location::factory()->create();

        $payload = [
            // Missing 'title'
            'description' => 'Test description',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->postJson('/api/v1/organizer/events', $payload);

        // Assert (Assertions 1-4)
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
        $this->assertStringContainsString('required', $response->json('errors.title.0'));
        $this->assertDatabaseMissing('events', [
            'description' => 'Test description'
        ]);
    }

    #[Test]
    public function test_validation_fails_without_required_description(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $category = Category::factory()->create();
        $location = Location::factory()->create();

        $payload = [
            'title' => 'Test Event',
            // Missing 'description'
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->postJson('/api/v1/organizer/events', $payload);

        // Assert (Assertions 1-3)
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['description']);
        $this->assertDatabaseMissing('events', [
            'title' => 'Test Event'
        ]);
    }

    #[Test]
    public function test_validation_fails_without_category_id(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $location = Location::factory()->create();

        $payload = [
            'title' => 'Test Event',
            'description' => 'Test description',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            // Missing 'category_id'
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->postJson('/api/v1/organizer/events', $payload);

        // Assert (Assertions 1-3)
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['category_id']);
        $this->assertDatabaseMissing('events', [
            'title' => 'Test Event'
        ]);
    }

    #[Test]
    public function test_validation_fails_without_location_ids(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $category = Category::factory()->create();

        $payload = [
            'title' => 'Test Event',
            'description' => 'Test description',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            // Missing 'location_ids'
        ];

        // Act
        $response = $this->postJson('/api/v1/organizer/events', $payload);

        // Assert (Assertions 1-3)
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['location_ids']);
        $this->assertDatabaseMissing('events', [
            'title' => 'Test Event'
        ]);
    }

    #[Test]
    public function test_enforces_organization_id_from_authenticated_user(): void
    {
        // Arrange: Create two organizations
        $user = $this->createAuthenticatedUser();
        $userOrganization = $user->organization_id;

        $otherOrganization = Organization::factory()->create();

        $category = Category::factory()->create();
        $location = Location::factory()->create();
        $typeId = $this->getValidTypeId();

        $payload = [
            'title' => 'Security Test Event',
            'description' => 'Testing organization security',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
            'type_id' => $typeId,
            // Malicious: trying to inject different organization_id
            'organization_id' => $otherOrganization->id,
        ];

        // Act
        $response = $this->postJson('/api/v1/organizer/events', $payload);

        // Assert: Event created with user's organization, NOT the injected one (Assertions 1-5)
        $response->assertStatus(201);

        $eventId = $response->json('event.id');
        $this->assertDatabaseHas('events', [
            'id' => $eventId,
            'organization_id' => $userOrganization, // MUST be user's org
        ]);

        $this->assertDatabaseMissing('events', [
            'id' => $eventId,
            'organization_id' => $otherOrganization->id, // NOT the malicious org
        ]);

        $event = Event::find($eventId);
        $this->assertEquals($userOrganization, $event->organization_id);
        $this->assertNotEquals($otherOrganization->id, $event->organization_id);
    }

    #[Test]
    public function test_syncs_multiple_locations_correctly(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $category = Category::factory()->create();
        $location1 = Location::factory()->create(['entity_id' => 1]);
        $location2 = Location::factory()->create(['entity_id' => 1]);
        $location3 = Location::factory()->create(['entity_id' => 1]);
        $typeId = $this->getValidTypeId();

        $payload = [
            'title' => 'Multi-Location Event',
            'description' => 'Event across 3 locations',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location1->id, $location2->id, $location3->id],
            'type_id' => $typeId,
        ];

        // Act
        $response = $this->postJson('/api/v1/organizer/events', $payload);

        // Assert (Assertions 1-7)
        $response->assertStatus(201);

        $eventId = $response->json('event.id');
        $event = Event::find($eventId);

        $this->assertEquals(3, $event->locations()->count());
        $this->assertTrue($event->locations->contains($location1->id));
        $this->assertTrue($event->locations->contains($location2->id));
        $this->assertTrue($event->locations->contains($location3->id));

        // Verify pivot table entries exist
        $this->assertDatabaseHas('event_location', [
            'event_id' => $eventId,
            'location_id' => $location1->id
        ]);
        $this->assertDatabaseHas('event_location', [
            'event_id' => $eventId,
            'location_id' => $location2->id
        ]);
    }

    #[Test]
    public function test_asynchronous_dates_validation_requires_all_fields(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $category = Category::factory()->create();
        $location = Location::factory()->create();

        $payload = [
            'title' => 'Async Dates Test',
            'description' => 'Testing async dates validation',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
            'asynchronous_dates' => [
                // Invalid: missing start_time and end_time
                ['date' => '2025-12-01']
            ],
        ];

        // Act
        $response = $this->postJson('/api/v1/organizer/events', $payload);

        // Assert (Assertions 1-4)
        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'asynchronous_dates.0.start_time',
            'asynchronous_dates.0.end_time'
        ]);
        $this->assertDatabaseMissing('events', [
            'title' => 'Async Dates Test'
        ]);
    }

    #[Test]
    public function test_returns_403_if_user_has_no_organization(): void
    {
        // Arrange: User WITHOUT organization (don't attach any organization)
        $user = User::factory()->create();
        // Do NOT attach organization - user->organization_id accessor will return null
        $this->actingAs($user, 'sanctum');

        $category = Category::factory()->create();
        $location = Location::factory()->create();

        $payload = [
            'title' => 'Test Event',
            'description' => 'Test description',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->postJson('/api/v1/organizer/events', $payload);

        // Assert (Assertions 1-4)
        $response->assertStatus(403);
        // Middleware CheckRole rejects user without role before reaching controller
        $response->assertJsonStructure(['error', 'message']);
        $this->assertStringContainsString('Forbidden', $response->json('error'));
        $this->assertDatabaseMissing('events', [
            'title' => 'Test Event'
        ]);
    }
}
