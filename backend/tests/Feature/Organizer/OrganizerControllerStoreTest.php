<?php

namespace Tests\Feature\Organizer;

use App\Models\User;
use App\Models\Event;
use App\Models\EventOrigin;
use App\Models\EventType;
use App\Models\EventSubtype;
use App\Models\Location;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests for OrganizerController@store() method
 *
 * Updated for 3NF normalized schema (Nov 30, 2025).
 * Tests creation with normalized FK fields instead of denormalized strings.
 */
class OrganizerControllerStoreTest extends TestCase
{
    use RefreshDatabase;

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

        // Create tourism entity (id=1) that owns shared resources
        \DB::table('organizations')->insertOrIgnore([
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

        // Reset sequence to avoid id collision
        \DB::statement('ALTER SEQUENCE organizations_id_seq RESTART WITH 100');
    }

    /**
     * Helper: Create authenticated user with organization and organizer role
     */
    private function createAuthenticatedUser(): User
    {
        $user = User::factory()->create();
        $organization = Organization::factory()->create();
        $user->organizations()->attach($organization->id);

        $organizerRole = \DB::table('user_roles')->where('role_code', 'organizer_admin')->first();
        if ($organizerRole) {
            $user->role_id = $organizerRole->id;
            $user->save();
        }

        $user->refresh();
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    /**
     * Helper: Get a valid format_id
     */
    private function getValidFormatId(): int
    {
        return \DB::table('event_formats')->value('id') ?? 1;
    }

    /**
     * Helper: Get valid event_type_id and event_subtype_id
     */
    private function getValidEventTypeIds(): array
    {
        $eventType = EventType::first() ?? EventType::factory()->create();
        $eventSubtype = EventSubtype::where('event_type_id', $eventType->id)->first()
            ?? EventSubtype::factory()->create(['event_type_id' => $eventType->id]);

        return [
            'event_type_id' => $eventType->id,
            'event_subtype_id' => $eventSubtype->id,
        ];
    }

    #[Test]
    public function test_creates_event_with_all_normalized_fields_successfully(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $location1 = Location::factory()->create(['entity_id' => 1]);
        $location2 = Location::factory()->create(['entity_id' => 1]);
        $formatId = $this->getValidFormatId();
        $originId = EventOrigin::where('code', 'national')->first()->id;
        $producer = Organization::factory()->create(['name' => 'Event Producer Org']);
        $eventTypeIds = $this->getValidEventTypeIds();

        $payload = [
            // Required fields
            'title' => 'Congreso Internacional de Turismo 2025',
            'description' => 'Evento anual que reúne a los principales actores del sector turístico',
            'start_date' => now()->addDays(30)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(32)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location1->id, $location2->id],
            'format_id' => $formatId,

            // Normalized FK fields
            'edition_number' => '15va Edición',
            'origin_id' => $originId,
            'producer_id' => $producer->id,

            // Location info (kept in events)
            'maps_url' => 'https://maps.google.com/?q=-26.8241,-65.2226',
            'previous_venue' => 'Hotel Sheraton',
            'next_venue' => 'Centro Cultural',

            // Async dates (normalized to table)
            'async_dates' => [
                ['date' => '2025-12-01', 'notes' => 'Day 1'],
                ['date' => '2025-12-03', 'notes' => 'Day 2']
            ],

            // Attendance
            'local_attendance' => 500,
            'national_attendance' => 200,
            'international_attendance' => 100,
            'virtual_transmission' => true,

            // Additional info
            'event_website' => 'https://congreso-turismo.gob.ar',

            // Images
            'logo_url' => 'https://example.com/logo.png',
            'featured_image' => 'https://example.com/featured.jpg',
            'responsive_image_url' => 'https://example.com/responsive.jpg',
        ];

        // Act
        $response = $this->postJson('/api/v1/organizer/events', $payload);

        // Assert: Response structure
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'event' => ['id', 'title', 'description', 'start_date', 'end_date']
        ]);
        $response->assertJsonPath('event.title', 'Congreso Internacional de Turismo 2025');

        // Assert: Verify normalized fields in database
        $eventId = $response->json('event.id');
        $this->assertDatabaseHas('events', [
            'id' => $eventId,
            'title' => 'Congreso Internacional de Turismo 2025',
            'edition_number' => '15va Edición',
            'origin_id' => $originId,
            'producer_id' => $producer->id,
            'maps_url' => 'https://maps.google.com/?q=-26.8241,-65.2226',
            'local_attendance' => 500,
            'national_attendance' => 200,
            'international_attendance' => 100,
            'virtual_transmission' => true,
        ]);

        // Assert: Verify async dates in normalized table
        $event = Event::find($eventId);
        $this->assertCount(2, $event->asyncDates);
        $this->assertEquals('Day 1', $event->asyncDates->first()->notes);

        // Assert: Verify locations synced correctly
        $this->assertEquals(2, $event->locations()->count());
        $this->assertTrue($event->locations->contains($location1->id));
    }

    #[Test]
    public function test_creates_event_with_only_required_fields(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $location = Location::factory()->create(['entity_id' => 1]);
        $formatId = $this->getValidFormatId();
        $eventTypeIds = $this->getValidEventTypeIds();

        $payload = [
            'title' => 'Evento Mínimo',
            'description' => 'Descripción básica',
            'start_date' => now()->addDays(10)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
            'format_id' => $formatId,
        ];

        // Act
        $response = $this->postJson('/api/v1/organizer/events', $payload);

        // Assert
        $response->assertStatus(201);
        $response->assertJsonPath('event.title', 'Evento Mínimo');

        $eventId = $response->json('event.id');
        $event = Event::find($eventId);

        // Verify optional fields are null or auto-filled
        $this->assertNull($event->edition_number);
        $this->assertNull($event->origin_id);
        // producer_id is now auto-filled with organization_id (Dec 2, 2025)
        $this->assertEquals($user->organization_id, $event->producer_id);
        $this->assertFalse($event->virtual_transmission);
        $this->assertEquals(1, $event->locations()->count());
    }

    #[Test]
    public function test_validation_fails_without_required_title(): void
    {
        $user = $this->createAuthenticatedUser();
        $location = Location::factory()->create();
        $eventTypeIds = $this->getValidEventTypeIds();

        $payload = [
            'description' => 'Test description',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    #[Test]
    public function test_validation_fails_without_required_description(): void
    {
        $user = $this->createAuthenticatedUser();
        $location = Location::factory()->create();
        $eventTypeIds = $this->getValidEventTypeIds();

        $payload = [
            'title' => 'Test Event',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['description']);
    }

    #[Test]
    public function test_validation_fails_without_event_type_id(): void
    {
        $user = $this->createAuthenticatedUser();
        $location = Location::factory()->create();
        $eventTypeIds = $this->getValidEventTypeIds();

        $payload = [
            'title' => 'Test Event',
            'description' => 'Test description',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['event_type_id']);
    }

    #[Test]
    public function test_validation_fails_without_location_ids_or_custom_location(): void
    {
        $user = $this->createAuthenticatedUser();
        $eventTypeIds = $this->getValidEventTypeIds();

        $payload = [
            'title' => 'Test Event',
            'description' => 'Test description',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            // Neither location_ids nor custom_location_name provided
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(422);
        // Custom location name is required when location_ids is not present
        $response->assertJsonValidationErrors(['custom_location_name']);
    }

    #[Test]
    public function test_enforces_organization_id_from_authenticated_user(): void
    {
        $user = $this->createAuthenticatedUser();
        $userOrganization = $user->organization_id;
        $otherOrganization = Organization::factory()->create();
        $location = Location::factory()->create();
        $formatId = $this->getValidFormatId();
        $eventTypeIds = $this->getValidEventTypeIds();

        $payload = [
            'title' => 'Security Test Event',
            'description' => 'Testing organization security',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
            'format_id' => $formatId,
            'organization_id' => $otherOrganization->id, // Malicious injection attempt
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);

        $eventId = $response->json('event.id');
        $event = Event::find($eventId);
        $this->assertEquals($userOrganization, $event->organization_id);
        $this->assertNotEquals($otherOrganization->id, $event->organization_id);
    }

    #[Test]
    public function test_syncs_multiple_locations_correctly(): void
    {
        $user = $this->createAuthenticatedUser();
        $location1 = Location::factory()->create(['entity_id' => 1]);
        $location2 = Location::factory()->create(['entity_id' => 1]);
        $location3 = Location::factory()->create(['entity_id' => 1]);
        $formatId = $this->getValidFormatId();
        $eventTypeIds = $this->getValidEventTypeIds();

        $payload = [
            'title' => 'Multi-Location Event',
            'description' => 'Event across 3 locations',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location1->id, $location2->id, $location3->id],
            'format_id' => $formatId,
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);

        $eventId = $response->json('event.id');
        $event = Event::find($eventId);

        $this->assertEquals(3, $event->locations()->count());
        $this->assertTrue($event->locations->contains($location1->id));
        $this->assertTrue($event->locations->contains($location2->id));
        $this->assertTrue($event->locations->contains($location3->id));

        // Verify pivot table entries
        $this->assertDatabaseHas('event_location', [
            'event_id' => $eventId,
            'location_id' => $location1->id
        ]);
    }

    #[Test]
    public function test_async_dates_creates_entries_in_normalized_table(): void
    {
        $user = $this->createAuthenticatedUser();
        $location = Location::factory()->create(['entity_id' => 1]);
        $formatId = $this->getValidFormatId();
        $eventTypeIds = $this->getValidEventTypeIds();

        $payload = [
            'title' => 'Async Dates Test',
            'description' => 'Testing async dates normalization',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
            'format_id' => $formatId,
            'async_dates' => [
                ['date' => '2025-12-01', 'notes' => 'First session'],
                ['date' => '2025-12-05', 'notes' => 'Second session'],
            ],
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(201);

        $eventId = $response->json('event.id');
        $event = Event::find($eventId);

        $this->assertCount(2, $event->asyncDates);
        $this->assertDatabaseHas('event_async_dates', [
            'event_id' => $eventId,
            'notes' => 'First session',
        ]);
    }

    #[Test]
    public function test_returns_403_if_user_has_no_organization(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $location = Location::factory()->create();
        $eventTypeIds = $this->getValidEventTypeIds();

        $payload = [
            'title' => 'Test Event',
            'description' => 'Test description',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
        ];

        $response = $this->postJson('/api/v1/organizer/events', $payload);

        $response->assertStatus(403);
        $response->assertJsonStructure(['error', 'message']);
    }
}
