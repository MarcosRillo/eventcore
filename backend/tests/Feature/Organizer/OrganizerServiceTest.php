<?php

namespace Tests\Feature\Organizer;

use App\Features\Organizer\Services\EventValidator;
use App\Features\Organizer\Services\OrganizerService;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventType;
use App\Models\EventSubtype;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class OrganizerServiceTest extends TestCase
{
    use RefreshDatabase;

    private OrganizerService $service;
    private EventValidator $validator;
    private User $user;
    private Organization $organization;
    private Location $location;
    private EventStatus $draftStatus;
    private EventStatus $publishedStatus;
    private EventType $eventType;
    private EventSubtype $eventSubtype;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);

        $this->validator = new EventValidator();
        $this->service = new OrganizerService($this->validator);

        // Create organization
        $this->organization = Organization::factory()->create();

        // Create user and attach to organization (organization_id is an accessor, not a column)
        $this->user = User::factory()->create();
        $this->user->organizations()->attach($this->organization->id);

        // Create location
        $this->location = Location::factory()->create([
            'entity_id' => $this->organization->id,
        ]);

        // Get statuses
        $this->draftStatus = EventStatus::where('status_code', 'draft')->first();
        $this->publishedStatus = EventStatus::where('status_code', 'published')->first();

        // Create event format for testing
        DB::table('event_formats')->insert([
            'format_code' => 'sede_unica',
            'format_name' => 'Sede Única',
            'description' => 'Event held at a single location',
            'allows_multiple_locations' => false,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Create event types for testing
        $this->eventType = EventType::create([
            'name' => 'Test Event Type',
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ]);

        $this->eventSubtype = EventSubtype::create([
            'name' => 'Test Event Subtype',
            'event_type_id' => $this->eventType->id,
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ]);
    }

    private function getValidEventData(): array
    {
        return [
            'title' => 'Test Event',
            'description' => 'Test event description',
            'start_date' => now()->addDays(10)->format('Y-m-d'),
            'location_ids' => [$this->location->id],
            'event_type_id' => $this->eventType->id,
            'event_subtype_id' => $this->eventSubtype->id,
        ];
    }

    // ==================== CREATE TESTS ====================

    #[Test]
    public function test_create_event_with_valid_data_returns_event(): void
    {
        $data = $this->getValidEventData();

        $event = $this->service->createEvent($data, $this->user);

        $this->assertInstanceOf(Event::class, $event);
        $this->assertEquals('Test Event', $event->title);
        $this->assertEquals('Test event description', $event->description);
        $this->assertEquals($this->user->organization_id, $event->organization_id);
        $this->assertEquals($this->draftStatus->id, $event->status_id);
        $this->assertEquals($this->user->id, $event->created_by);
    }

    #[Test]
    public function test_create_event_syncs_locations(): void
    {
        $location2 = Location::factory()->create(['entity_id' => $this->organization->id]);

        $data = $this->getValidEventData();
        $data['location_ids'] = [$this->location->id, $location2->id];

        $event = $this->service->createEvent($data, $this->user);

        $this->assertCount(2, $event->locations);
        $this->assertTrue($event->locations->contains($this->location));
        $this->assertTrue($event->locations->contains($location2));
    }

    #[Test]
    public function test_create_event_uses_transaction(): void
    {
        // Verify transaction behavior by checking DB state on failure
        $data = $this->getValidEventData();
        $data['event_type_id'] = 99999; // Invalid event type - will fail

        $initialCount = Event::count();

        try {
            $this->service->createEvent($data, $this->user);
            $this->fail('Expected exception was not thrown');
        } catch (\Exception $e) {
            // Exception expected - verify no event was created
            $this->assertEquals($initialCount, Event::count());
        }
    }

    #[Test]
    public function test_create_event_throws_if_user_has_no_organization(): void
    {
        // Create user without attaching to any organization
        $userWithoutOrg = User::factory()->create();
        // Don't attach to any organization - organization_id accessor will return null
        $data = $this->getValidEventData();

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('User not associated with organization');

        $this->service->createEvent($data, $userWithoutOrg);
    }

    // ==================== UPDATE TESTS ====================

    #[Test]
    public function test_update_event_with_valid_data_returns_updated_event(): void
    {
        $event = Event::factory()->create([
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'Original Title',
        ]);

        $data = $this->getValidEventData();
        $data['title'] = 'Updated Title';

        $updatedEvent = $this->service->updateEvent($event, $data, $this->user);

        $this->assertEquals('Updated Title', $updatedEvent->title);
        $this->assertEquals($event->id, $updatedEvent->id);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Title',
        ]);
    }

    #[Test]
    public function test_update_event_validates_editable_status(): void
    {
        $event = Event::factory()->create([
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
        ]);

        $data = $this->getValidEventData();

        $this->expectException(ValidationException::class);

        $this->service->updateEvent($event, $data, $this->user);
    }

    // ==================== DELETE TESTS ====================

    #[Test]
    public function test_delete_event_soft_deletes_from_database(): void
    {
        $event = Event::factory()->create([
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
        ]);

        $eventId = $event->id;

        $this->service->deleteEvent($event, $this->user);

        // With SoftDeletes, the record exists but has deleted_at set
        $this->assertSoftDeleted('events', ['id' => $eventId]);
    }

    #[Test]
    public function test_delete_event_validates_draft_status(): void
    {
        $event = Event::factory()->create([
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
        ]);

        $this->expectException(ValidationException::class);

        $this->service->deleteEvent($event, $this->user);
    }

    // ==================== READ TESTS ====================

    #[Test]
    public function test_get_paginated_events_returns_only_organization_events(): void
    {
        // Create events for user's organization
        Event::factory()->count(3)->create([
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
        ]);

        // Create events for another organization
        $otherOrg = Organization::factory()->create();
        Event::factory()->count(2)->create([
            'organization_id' => $otherOrg->id,
            'entity_id' => $otherOrg->id,
            'status_id' => $this->draftStatus->id,
        ]);

        $result = $this->service->getPaginatedEvents($this->user, []);

        $this->assertCount(3, $result->items());
        foreach ($result->items() as $event) {
            $this->assertEquals($this->organization->id, $event->organization_id);
        }
    }

    #[Test]
    public function test_get_paginated_events_applies_filters(): void
    {
        Event::factory()->create([
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'Marketing Event',
        ]);

        Event::factory()->create([
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            'title' => 'Sales Event',
        ]);

        $result = $this->service->getPaginatedEvents($this->user, ['search' => 'Marketing']);

        $this->assertCount(1, $result->items());
        $this->assertEquals('Marketing Event', $result->items()[0]->title);
    }

    #[Test]
    public function test_get_event_by_id_returns_event_with_relationships(): void
    {
        $event = Event::factory()->create([
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
        ]);
        $event->locations()->attach($this->location->id);

        $result = $this->service->getEventById($event->id, $this->user);

        $this->assertEquals($event->id, $result->id);
        $this->assertTrue($result->relationLoaded('eventType'));
        $this->assertTrue($result->relationLoaded('locations'));
        $this->assertTrue($result->relationLoaded('status'));
    }

    #[Test]
    public function test_get_event_by_id_throws_if_not_found(): void
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->service->getEventById(99999, $this->user);
    }

    #[Test]
    public function test_validate_event_editable_throws_for_published(): void
    {
        $event = Event::factory()->create([
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
        ]);

        $this->expectException(ValidationException::class);

        $this->validator->validateEditable($event);
    }

    #[Test]
    public function test_validate_event_deletable_throws_for_non_draft(): void
    {
        $event = Event::factory()->create([
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
        ]);

        $this->expectException(ValidationException::class);

        $this->validator->validateDeletable($event);
    }
}
