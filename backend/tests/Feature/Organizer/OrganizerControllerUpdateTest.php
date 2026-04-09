<?php

namespace Tests\Feature\Organizer;

use App\Models\Event;
use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests for OrganizerController@update() method
 *
 * Updated for 3NF normalized schema (Nov 30, 2025).
 * Tests update with normalized FK fields instead of denormalized strings.
 */
class OrganizerControllerUpdateTest extends TestCase
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

        // Create tourism entity (id=1) that owns shared resources.
        // Must use primary_entity type so OrganizationFactory::getOrCreatePrimaryEntity()
        // finds this record and uses id=1 as parent_id for child orgs.
        // Location validation scopes to parent entity id, so locations with entity_id=1 must match.
        \DB::table('organizations')->insertOrIgnore([
            'id' => 1,
            'name' => 'Ente de Turismo de Tucumán',
            'slug' => 'ente-turismo-tucuman',
            'cuit' => '30-12345678-9',
            'description' => 'Ente principal de turismo',
            'type_id' => \DB::table('organization_types')->where('type_code', 'primary_entity')->value('id'),
            'status_id' => \DB::table('organization_statuses')->value('id'),
            'parent_id' => null,
            'trust_level' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Reset sequence to avoid id collision (setval is DML-safe inside transactions, unlike ALTER SEQUENCE DDL)
        \DB::select("SELECT setval('organizations_id_seq', 100)");
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
     * Helper: Get approved_internal status ID
     */
    private function getApprovedInternalStatusId(): int
    {
        return \DB::table('event_statuses')->where('status_code', 'approved_internal')->value('id');
    }

    /**
     * Helper: Get pending_internal_approval status ID
     */
    private function getPendingInternalApprovalStatusId(): int
    {
        return \DB::table('event_statuses')->where('status_code', 'pending_internal_approval')->value('id');
    }

    /**
     * Helper: Get valid format_id
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
    public function test_updates_event_with_all_normalized_fields_successfully(): void
    {
        // Arrange: Create event with minimal data
        $user = $this->createAuthenticatedUser();
        $location = Location::factory()->create(['entity_id' => 1]);

        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getDraftStatusId(),
            'format_id' => $this->getValidFormatId(),
            'title' => 'Original Title',
            'description' => 'Original Description',
        ]);

        $event->locations()->sync([$location->id]);

        $newLocation1 = Location::factory()->create(['entity_id' => 1]);
        $newLocation2 = Location::factory()->create(['entity_id' => 1]);
        $producer = Organization::factory()->create(['name' => 'Producer Org']);
        $eventTypeIds = $this->getValidEventTypeIds();

        // Update payload with normalized fields
        $updatePayload = [
            'title' => 'Updated: Congreso Internacional de Turismo 2025',
            'description' => 'Updated: Evento anual renovado',
            'start_date' => now()->addDays(40)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(42)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$newLocation1->id, $newLocation2->id],
            'format_id' => $this->getValidFormatId(),

            // Normalized FK fields
            'edition_number' => '16va Edición',
            'producer_id' => $producer->id,

            // Location info (kept in events)
            'maps_url' => 'https://maps.google.com/?q=-34.6037,-58.3816',
            'previous_venue' => 'Palacio de Congresos',
            'next_venue' => 'Expo Centro',

            // Async dates (normalized to table)
            'async_dates' => [
                ['date' => '2025-12-10', 'notes' => 'Morning session'],
                ['date' => '2025-12-12', 'notes' => 'Afternoon session'],
            ],

            // Attendance
            'local_attendance' => 800,
            'national_attendance' => 300,
            'international_attendance' => 150,

            // Additional info
            'event_website' => 'https://turismo-actualizado.gob.ar',

            // Images
            'logo_url' => 'https://example.com/new-logo.png',
            'featured_image' => 'https://example.com/new-featured.jpg',
            'responsive_image_url' => 'https://example.com/new-responsive.jpg',
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert: Response
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'event' => ['id', 'title', 'description'],
        ]);
        $response->assertJsonPath('event.title', 'Updated: Congreso Internacional de Turismo 2025');

        // Assert: Verify normalized fields in database
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated: Congreso Internacional de Turismo 2025',
            'description' => 'Updated: Evento anual renovado',
            'edition_number' => '16va Edición',
            'producer_id' => $producer->id,
            'maps_url' => 'https://maps.google.com/?q=-34.6037,-58.3816',
            'local_attendance' => 800,
            'national_attendance' => 300,
            'international_attendance' => 150,
        ]);

        // Assert: Verify async dates in normalized table
        $updatedEvent = Event::with(['locations', 'asyncDates'])->find($event->id);
        $this->assertCount(2, $updatedEvent->asyncDates);
        $this->assertEquals('Morning session', $updatedEvent->asyncDates->first()->notes);

        // Assert: Verify locations synced
        $this->assertEquals(2, $updatedEvent->locations()->count());
        $this->assertTrue($updatedEvent->locations->contains($newLocation1->id));
        $this->assertTrue($updatedEvent->locations->contains($newLocation2->id));
    }

    #[Test]
    public function test_updates_event_with_only_required_fields(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $producer = Organization::factory()->create();
        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getDraftStatusId(),
            'format_id' => $this->getValidFormatId(),
            'title' => 'Original',
            'edition_number' => 'Old Edition',
            'producer_id' => $producer->id,
        ]);

        $location = Location::factory()->create(['entity_id' => 1]);
        $eventTypeIds = $this->getValidEventTypeIds();

        $updatePayload = [
            'title' => 'Updated Title',
            'description' => 'Updated Description',
            'start_date' => now()->addDays(10)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('event.title', 'Updated Title');

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Title',
            'description' => 'Updated Description',
        ]);

        // Verify optional fields were reset, but producer_id is preserved (Dec 2, 2025)
        $updatedEvent = Event::with('locations')->find($event->id);
        $this->assertNull($updatedEvent->edition_number);
        // producer_id is preserved when not provided in update (auto-filled behavior)
        $this->assertEquals($producer->id, $updatedEvent->producer_id);
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
            'format_id' => $this->getValidFormatId(),
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

        $location = Location::factory()->create(['entity_id' => 1]);
        $eventTypeIds = $this->getValidEventTypeIds();

        $updatePayload = [
            'title' => 'Malicious Update',
            'description' => 'Should not work',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert
        $response->assertStatus(404);

        $this->assertDatabaseMissing('events', [
            'id' => $event->id,
            'title' => 'Malicious Update',
        ]);
    }

    #[Test]
    public function test_can_update_published_event_and_changes_to_pending(): void
    {
        // Arrange: Create published event
        $user = $this->createAuthenticatedUser();
        $location = Location::factory()->create(['entity_id' => 1]);

        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getPublishedStatusId(),
            'format_id' => $this->getValidFormatId(),
            'title' => 'Published Event',
        ]);

        $event->locations()->sync([$location->id]);
        $eventTypeIds = $this->getValidEventTypeIds();

        $updatePayload = [
            'title' => 'Updated Published Event',
            'description' => 'This was published but now edited',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(6)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert: Update should succeed
        $response->assertStatus(200);

        // Verify title was updated
        $event->refresh();
        $this->assertEquals('Updated Published Event', $event->title);

        // Verify status changed to pending_internal_approval
        $this->assertEquals(
            'pending_internal_approval',
            $event->status->status_code,
            'Published event should change to pending_internal_approval after edit',
        );
    }

    #[Test]
    public function test_can_update_approved_internal_event_and_changes_to_pending(): void
    {
        // Arrange: Create approved_internal event
        $user = $this->createAuthenticatedUser();
        $location = Location::factory()->create(['entity_id' => 1]);

        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getApprovedInternalStatusId(),
            'format_id' => $this->getValidFormatId(),
            'title' => 'Approved Event',
        ]);

        $event->locations()->sync([$location->id]);
        $eventTypeIds = $this->getValidEventTypeIds();

        $updatePayload = [
            'title' => 'Updated Approved Event',
            'description' => 'This was approved but now edited',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(6)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert: Update should succeed
        $response->assertStatus(200);

        // Verify title was updated
        $event->refresh();
        $this->assertEquals('Updated Approved Event', $event->title);

        // Verify status changed to pending_internal_approval
        $this->assertEquals(
            'pending_internal_approval',
            $event->status->status_code,
            'Approved event should change to pending_internal_approval after edit',
        );
    }

    #[Test]
    public function test_can_update_draft_event_and_maintains_draft_status(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getDraftStatusId(),
            'format_id' => $this->getValidFormatId(),
            'title' => 'Draft Event',
        ]);

        $location = Location::factory()->create(['entity_id' => 1]);
        $eventTypeIds = $this->getValidEventTypeIds();

        $updatePayload = [
            'title' => 'Updated Draft',
            'description' => 'Updated',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Draft',
        ]);

        // Verify status remains draft (does not change to pending)
        $event->refresh();
        $this->assertEquals('draft', $event->status->status_code, 'Draft event should maintain draft status after edit');
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
            'format_id' => $this->getValidFormatId(),
            'title' => 'Requires Changes Event',
        ]);

        $location = Location::factory()->create(['entity_id' => 1]);
        $eventTypeIds = $this->getValidEventTypeIds();

        $updatePayload = [
            'title' => 'Fixed Event',
            'description' => 'Updated',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Fixed Event',
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
            'format_id' => $this->getValidFormatId(),
        ]);

        $location = Location::factory()->create();
        $eventTypeIds = $this->getValidEventTypeIds();

        $updatePayload = [
            'description' => 'Updated',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert
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
            'format_id' => $this->getValidFormatId(),
        ]);

        $event->locations()->sync([$location1->id, $location2->id]);

        // Update: Change to 3 different locations
        $location3 = Location::factory()->create(['entity_id' => 1]);
        $location4 = Location::factory()->create(['entity_id' => 1]);
        $location5 = Location::factory()->create(['entity_id' => 1]);

        $eventTypeIds = $this->getValidEventTypeIds();

        $updatePayload = [
            'title' => 'Updated',
            'description' => 'Updated',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location3->id, $location4->id, $location5->id],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert
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
    public function test_updates_async_dates_correctly(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getDraftStatusId(),
            'format_id' => $this->getValidFormatId(),
        ]);

        // Create initial async date
        $event->asyncDates()->create([
            'date_value' => '2025-11-01',
            'notes' => 'Initial session',
        ]);

        $location = Location::factory()->create(['entity_id' => 1]);
        $eventTypeIds = $this->getValidEventTypeIds();

        $updatePayload = [
            'title' => 'Updated',
            'description' => 'Updated',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
            'async_dates' => [
                ['date' => '2025-12-05', 'notes' => 'Morning session'],
                ['date' => '2025-12-07', 'notes' => 'Afternoon session'],
                ['date' => '2025-12-09', 'notes' => 'Closing session'],
            ],
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert
        $response->assertStatus(200);

        $updatedEvent = Event::with('asyncDates')->find($event->id);
        $this->assertCount(3, $updatedEvent->asyncDates);
        $this->assertEquals('2025-12-05', $updatedEvent->asyncDates->first()->date->format('Y-m-d'));
        $this->assertEquals('Morning session', $updatedEvent->asyncDates->first()->notes);
    }

    #[Test]
    public function test_updates_normalized_fk_fields(): void
    {
        // Arrange
        $user = $this->createAuthenticatedUser();
        $initialProducer = Organization::factory()->create();
        $event = Event::factory()->create([
            'organization_id' => $user->organization_id,
            'entity_id' => $user->organization_id,
            'created_by' => $user->id,
            'status_id' => $this->getDraftStatusId(),
            'format_id' => $this->getValidFormatId(),
            'producer_id' => $initialProducer->id,
        ]);

        $location = Location::factory()->create(['entity_id' => 1]);
        $newProducer = Organization::factory()->create(['name' => 'New Producer']);
        $eventTypeIds = $this->getValidEventTypeIds();

        $updatePayload = [
            'title' => 'Updated Event',
            'description' => 'Updated',
            'start_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
            'producer_id' => $newProducer->id,
        ];

        // Act
        $response = $this->putJson("/api/v1/organizer/events/{$event->id}", $updatePayload);

        // Assert
        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'producer_id' => $newProducer->id,
        ]);

        $updatedEvent = Event::with(['producer'])->find($event->id);
        $this->assertEquals('New Producer', $updatedEvent->producer->name);
    }
}
