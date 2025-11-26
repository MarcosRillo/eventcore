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
 * Tests for OrganizerController@update() method with all 34 extended fields
 *
 * This test suite verifies that the update() method:
 * - Updates events with all 34 fields
 * - Enforces security (organization ownership, editable status)
 * - Validates all required and optional fields
 * - Syncs locations correctly
 * - Handles asynchronous_dates JSON properly
 */
class OrganizerControllerUpdateTest extends TestCase
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

        // Assign 'organizer_admin' role
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
     * Helper: Get draft status ID
     */
    private function getDraftStatusId(): int
    {
        return \DB::table('event_statuses')->where('status_code', 'draft')->value('id');
    }

    /**
     * Helper: Get requires_changes status ID
     */
    private function getRequiresChangesStatusId(): int
    {
        return \DB::table('event_statuses')->where('status_code', 'requires_changes')->value('id');
    }

    /**
     * Helper: Get published status ID
     */
    private function getPublishedStatusId(): int
    {
        return \DB::table('event_statuses')->where('status_code', 'published')->value('id');
    }

    /**
     * Helper: Get valid type_id
     */
    private function getValidTypeId(): int
    {
        $typeId = \DB::table('event_types')->value('id');

        if (!$typeId) {
            $typeId = \DB::table('event_types')->insertGetId([
                'type_name' => 'Test Event Type',
                'type_code' => 'test_type',
                'description' => 'Test type',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $typeId;
    }

    #[Test]
    public function test_updates_event_with_all_34_extended_fields_successfully(): void
    {
        // Arrange: Create event with minimal data
        $user = $this->createAuthenticatedUser();
        $category = Category::factory()->create();
        $location = Location::factory()->create();

        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getDraftStatusId(),
            'type_id' => $this->getValidTypeId(),
            'title' => 'Original Title',
            'description' => 'Original Description',
        ]);

        $event->locations()->sync([$location->id]);

        $newCategory = Category::factory()->create(['entity_id' => $user->organization_id]);
        $newLocation1 = Location::factory()->create(['entity_id' => 1]);
        $newLocation2 = Location::factory()->create(['entity_id' => 1]);

        // Update payload with all 34 fields
        $updatePayload = [
            'title' => 'Updated: Congreso Internacional de Turismo 2025',
            'description' => 'Updated: Evento anual renovado',
            'start_date' => now()->addDays(40)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(42)->format('Y-m-d H:i:s'),
            'category_id' => $newCategory->id,
            'location_ids' => [$newLocation1->id, $newLocation2->id],
            'type_id' => $this->getValidTypeId(),

            // Basic Information (7 fields)
            'edition_number' => '16va Edición',
            'event_type' => 'Congreso Actualizado',
            'event_subtype' => 'Regional',
            'origin' => 'Internacional',
            'theme' => 'Turismo Digital',
            'frequency' => 'Bienal',
            'rotation_type' => 'Fijo',

            // Catering Services (5 fields)
            'coffee_break' => false,
            'lunch_catering' => true,
            'dinner_catering' => true,
            'pre_event_package' => false,
            'post_event_package' => true,

            // Location (6 fields)
            'venue' => 'Centro Cultural Actualizado',
            'city' => 'Buenos Aires',
            'rooms_used' => 'Auditorio Principal',
            'maps_url' => 'https://maps.google.com/?q=-34.6037,-58.3816',
            'previous_venue' => 'Palacio de Congresos',
            'next_venue' => 'Expo Centro',

            // Asynchronous Dates (1 field)
            'asynchronous_dates' => [
                ['date' => '2025-12-10', 'start_time' => '10:00', 'end_time' => '14:00'],
                ['date' => '2025-12-12', 'start_time' => '15:00', 'end_time' => '19:00']
            ],

            // Attendance (4 fields)
            'local_attendance' => 800,
            'national_attendance' => 300,
            'international_attendance' => 150,
            'virtual_transmission' => true,

            // Additional Information (2 fields)
            'producer' => 'Ministerio de Turismo',
            'event_website' => 'https://turismo-actualizado.gob.ar',

            // Images (3 fields)
            'logo_url' => 'https://example.com/new-logo.png',
            'featured_image' => 'https://example.com/new-featured.jpg',
            'responsive_image_url' => 'https://example.com/new-responsive.jpg',
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert: Response (Assertions 1-3)
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'event' => ['id', 'title', 'description']
        ]);
        $response->assertJsonPath('event.title', 'Updated: Congreso Internacional de Turismo 2025');

        // Assert: Verify all 34 fields updated in database (Assertions 4-37)
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated: Congreso Internacional de Turismo 2025',
            'description' => 'Updated: Evento anual renovado',
            'category_id' => $newCategory->id,

            // Basic Information (7 fields)
            'edition_number' => '16va Edición',
            'event_type' => 'Congreso Actualizado',
            'event_subtype' => 'Regional',
            'origin' => 'Internacional',
            'theme' => 'Turismo Digital',
            'frequency' => 'Bienal',
            'rotation_type' => 'Fijo',

            // Catering (5 fields)
            'coffee_break' => false,
            'lunch_catering' => true,
            'dinner_catering' => true,
            'pre_event_package' => false,
            'post_event_package' => true,

            // Location (6 fields)
            'venue' => 'Centro Cultural Actualizado',
            'city' => 'Buenos Aires',
            'rooms_used' => 'Auditorio Principal',
            'maps_url' => 'https://maps.google.com/?q=-34.6037,-58.3816',
            'previous_venue' => 'Palacio de Congresos',
            'next_venue' => 'Expo Centro',

            // Attendance (4 fields)
            'local_attendance' => 800,
            'national_attendance' => 300,
            'international_attendance' => 150,
            'virtual_transmission' => true,

            // Additional Info (2 fields)
            'producer' => 'Ministerio de Turismo',
            'event_website' => 'https://turismo-actualizado.gob.ar',

            // Images (3 fields)
            'logo_url' => 'https://example.com/new-logo.png',
            'featured_image' => 'https://example.com/new-featured.jpg',
            'responsive_image_url' => 'https://example.com/new-responsive.jpg',
        ]);

        // Assert: Verify asynchronous_dates JSON (Assertions 38-40)
        $updatedEvent = Event::with('locations')->find($event->id);
        $this->assertIsArray($updatedEvent->asynchronous_dates);
        $this->assertCount(2, $updatedEvent->asynchronous_dates);
        $this->assertEquals('2025-12-10', $updatedEvent->asynchronous_dates[0]['date']);

        // Assert: Verify locations synced (Assertions 41-43)
        $this->assertEquals(2, $updatedEvent->locations()->count());
        $this->assertTrue($updatedEvent->locations->contains($newLocation1->id));
        $this->assertTrue($updatedEvent->locations->contains($newLocation2->id));
    }

    #[Test]
    public function test_updates_event_with_only_required_fields(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getDraftStatusId(),
            'type_id' => $this->getValidTypeId(),
            'title' => 'Original',
            'edition_number' => 'Old Edition',
            'venue' => 'Old Venue',
        ]);

        $category = Category::factory()->create(['entity_id' => $user->organization_id]);
        $location = Location::factory()->create(['entity_id' => 1]);

        $updatePayload = [
            'title' => 'Updated Title',
            'description' => 'Updated Description',
            'start_date' => now()->addDays(10)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert (Assertions 1-8)
        $response->assertStatus(200);
        $response->assertJsonPath('event.title', 'Updated Title');

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Title',
            'description' => 'Updated Description',
        ]);

        // Verify optional fields were NOT changed (set to null by update)
        $updatedEvent = Event::with('locations')->find($event->id);
        $this->assertNull($updatedEvent->edition_number);
        $this->assertNull($updatedEvent->venue);
        $this->assertFalse($updatedEvent->coffee_break);
        $this->assertEquals(1, $updatedEvent->locations()->count());
    }

    #[Test]
    public function test_cannot_update_event_from_different_organization(): void
    {
        // Arrange: Create event for organization A
        $userA = $this->createAuthenticatedUser();
        $orgA = $userA->organization_id;

        $event = Event::factory()->create([
            'organization_id' => $orgA,
            'entity_id' => $orgA,
            'created_by' => $userA->id,
            'status_id' => $this->getDraftStatusId(),
            'type_id' => $this->getValidTypeId(),
        ]);

        // Arrange: Authenticate as user B from different organization
        $userB = User::factory()->create();
        $orgB = Organization::factory()->create();
        $userB->organizations()->attach($orgB->id);
        $organizerRole = \DB::table('user_roles')->where('role_code', 'organizer_admin')->first();
        $userB->role_id = $organizerRole->id;
        $userB->save();
        $userB->refresh();
        $this->actingAs($userB, 'sanctum');

        $category = Category::factory()->create();
        $location = Location::factory()->create();

        $updatePayload = [
            'title' => 'Malicious Update',
            'description' => 'Should not work',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert (Assertions 1-3)
        $response->assertStatus(404); // firstOrFail throws 404

        // Verify event was NOT updated
        $this->assertDatabaseMissing('events', [
            'id' => $event->id,
            'title' => 'Malicious Update'
        ]);
    }

    #[Test]
    public function test_cannot_update_published_event(): void
    {
        // Arrange: Create published event
        $user = $this->createAuthenticatedUser();
        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getPublishedStatusId(),
            'type_id' => $this->getValidTypeId(),
            'title' => 'Published Event',
        ]);

        $category = Category::factory()->create();
        $location = Location::factory()->create();

        $updatePayload = [
            'title' => 'Attempted Update',
            'description' => 'Should not work',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert (Assertions 1-4)
        $response->assertStatus(403);
        $response->assertJsonFragment(['error' => 'Cannot edit event in current status']);
        $response->assertJsonStructure(['error', 'current_status', 'editable_statuses']);

        // Verify event was NOT updated
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Published Event' // Original title
        ]);
    }

    #[Test]
    public function test_can_update_draft_event(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getDraftStatusId(),
            'type_id' => $this->getValidTypeId(),
            'title' => 'Draft Event',
        ]);

        $category = Category::factory()->create();
        $location = Location::factory()->create();

        $updatePayload = [
            'title' => 'Updated Draft',
            'description' => 'Updated',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert (Assertions 1-3)
        $response->assertStatus(200);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Draft'
        ]);
    }

    #[Test]
    public function test_can_update_requires_changes_event(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getRequiresChangesStatusId(),
            'type_id' => $this->getValidTypeId(),
            'title' => 'Requires Changes Event',
        ]);

        $category = Category::factory()->create();
        $location = Location::factory()->create();

        $updatePayload = [
            'title' => 'Fixed Event',
            'description' => 'Updated',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert (Assertions 1-3)
        $response->assertStatus(200);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Fixed Event'
        ]);
    }

    #[Test]
    public function test_validation_fails_without_required_title(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getDraftStatusId(),
            'type_id' => $this->getValidTypeId(),
        ]);

        $category = Category::factory()->create();
        $location = Location::factory()->create();

        $updatePayload = [
            // Missing 'title'
            'description' => 'Updated',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert (Assertions 1-2)
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    #[Test]
    public function test_syncs_updated_locations_correctly(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $location1 = Location::factory()->create(['entity_id' => 1]);
        $location2 = Location::factory()->create(['entity_id' => 1]);

        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getDraftStatusId(),
            'type_id' => $this->getValidTypeId(),
        ]);

        // Initial: 2 locations
        $event->locations()->sync([$location1->id, $location2->id]);

        // Update: Change to 3 different locations
        $location3 = Location::factory()->create(['entity_id' => 1]);
        $location4 = Location::factory()->create(['entity_id' => 1]);
        $location5 = Location::factory()->create(['entity_id' => 1]);

        $category = Category::factory()->create(['entity_id' => $user->organization_id]);

        $updatePayload = [
            'title' => 'Updated',
            'description' => 'Updated',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location3->id, $location4->id, $location5->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert (Assertions 1-7)
        $response->assertStatus(200);

        $updatedEvent = Event::with('locations')->find($event->id);
        $this->assertEquals(3, $updatedEvent->locations()->count());
        $this->assertTrue($updatedEvent->locations->contains($location3->id));
        $this->assertTrue($updatedEvent->locations->contains($location4->id));
        $this->assertTrue($updatedEvent->locations->contains($location5->id));

        // Old locations should NOT be attached
        $this->assertFalse($updatedEvent->locations->contains($location1->id));
        $this->assertFalse($updatedEvent->locations->contains($location2->id));
    }

    #[Test]
    public function test_updates_asynchronous_dates_correctly(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getDraftStatusId(),
            'type_id' => $this->getValidTypeId(),
            'asynchronous_dates' => [
                ['date' => '2025-11-01', 'start_time' => '09:00', 'end_time' => '12:00']
            ]
        ]);

        $category = Category::factory()->create();
        $location = Location::factory()->create();

        $updatePayload = [
            'title' => 'Updated',
            'description' => 'Updated',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
            'asynchronous_dates' => [
                ['date' => '2025-12-05', 'start_time' => '10:00', 'end_time' => '14:00'],
                ['date' => '2025-12-07', 'start_time' => '15:00', 'end_time' => '19:00'],
                ['date' => '2025-12-09', 'start_time' => '08:00', 'end_time' => '12:00']
            ]
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert (Assertions 1-5)
        $response->assertStatus(200);

        $updatedEvent = Event::find($event->id);
        $this->assertIsArray($updatedEvent->asynchronous_dates);
        $this->assertCount(3, $updatedEvent->asynchronous_dates);
        $this->assertEquals('2025-12-05', $updatedEvent->asynchronous_dates[0]['date']);
        $this->assertEquals('10:00', $updatedEvent->asynchronous_dates[0]['start_time']);
    }
}
