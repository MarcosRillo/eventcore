<?php

namespace Tests\Unit\Models;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Event Model Relationship Tests
 *
 * Tests for Event Eloquent model relationships to ensure proper
 * database associations and data integrity.
 *
 * Relationships tested:
 * - belongsTo: status, eventType, eventSubtype, creator, organization
 * - belongsToMany: locations (with pivot table)
 * - Cascade operations: location detachment on delete
 *
 * Created: December 19, 2025
 */
class EventTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
    }

    #[Test]
    public function test_event_belongs_to_status(): void
    {
        // Arrange
        $status = EventStatus::where('status_code', 'published')->first();
        $event = Event::factory()->create(['status_id' => $status->id]);

        // Act
        $eventStatus = $event->status;

        // Assert (5 assertions)
        $this->assertInstanceOf(EventStatus::class, $eventStatus);       // 1
        $this->assertEquals($status->id, $eventStatus->id);              // 2
        $this->assertEquals('published', $eventStatus->status_code);     // 3
        $this->assertEquals($status->name, $eventStatus->name);          // 4
        $this->assertDatabaseHas('event_statuses', [
            'id' => $status->id,
            'status_code' => 'published',
        ]); // 5
    }

    #[Test]
    public function test_event_belongs_to_type(): void
    {
        // Arrange
        $org = Organization::factory()->create();
        $type = EventType::factory()->create([
            'entity_id' => $org->id,
            'name' => 'Concert',
        ]);
        $event = Event::factory()->create([
            'entity_id' => $org->id,
            'event_type_id' => $type->id,
        ]);

        // Act
        $eventType = $event->eventType;

        // Assert (4 assertions)
        $this->assertInstanceOf(EventType::class, $eventType);           // 1
        $this->assertEquals($type->id, $eventType->id);                  // 2
        $this->assertEquals('Concert', $eventType->name);                // 3
        $this->assertDatabaseHas('event_types', ['id' => $type->id]);    // 4
    }

    #[Test]
    public function test_event_belongs_to_subtype(): void
    {
        // Arrange
        $org = Organization::factory()->create();
        $type = EventType::factory()->create(['entity_id' => $org->id]);
        $subtype = EventSubtype::factory()->create([
            'event_type_id' => $type->id,
            'entity_id' => $org->id,
            'name' => 'Rock Concert',
        ]);
        $event = Event::factory()->create([
            'entity_id' => $org->id,
            'event_subtype_id' => $subtype->id,
        ]);

        // Act
        $eventSubtype = $event->eventSubtype;

        // Assert (5 assertions)
        $this->assertInstanceOf(EventSubtype::class, $eventSubtype);     // 1
        $this->assertEquals($subtype->id, $eventSubtype->id);            // 2
        $this->assertEquals('Rock Concert', $eventSubtype->name);        // 3
        $this->assertEquals($type->id, $eventSubtype->event_type_id);    // 4
        $this->assertDatabaseHas('event_subtypes', ['id' => $subtype->id]); // 5
    }

    #[Test]
    public function test_event_belongs_to_creator(): void
    {
        // Arrange
        $user = User::factory()->create(['name' => 'John Doe']);
        $event = Event::factory()->create(['created_by' => $user->id]);

        // Act
        $creator = $event->creator;

        // Assert (4 assertions)
        $this->assertInstanceOf(User::class, $creator);                  // 1
        $this->assertEquals($user->id, $creator->id);                    // 2
        $this->assertEquals('John Doe', $creator->name);                 // 3
        $this->assertDatabaseHas('users', ['id' => $user->id]);          // 4
    }

    #[Test]
    public function test_event_belongs_to_organization(): void
    {
        // Arrange
        $org = Organization::factory()->create(['name' => 'Test Org']);
        $event = Event::factory()->create([
            'entity_id' => $org->id,
            'organization_id' => $org->id,
        ]);

        // Act
        $organization = $event->organization;

        // Assert (4 assertions)
        $this->assertInstanceOf(Organization::class, $organization);     // 1
        $this->assertEquals($org->id, $organization->id);                // 2
        $this->assertEquals('Test Org', $organization->name);            // 3
        $this->assertDatabaseHas('organizations', ['id' => $org->id]);   // 4
    }

    #[Test]
    public function test_event_has_many_to_many_locations(): void
    {
        // Arrange
        $org = Organization::factory()->create();
        $event = Event::factory()->create(['entity_id' => $org->id]);
        $location1 = Location::factory()->create([
            'entity_id' => $org->id,
            'name' => 'Venue A',
        ]);
        $location2 = Location::factory()->create([
            'entity_id' => $org->id,
            'name' => 'Venue B',
        ]);

        $event->locations()->attach([$location1->id, $location2->id]);

        // Act
        $locations = $event->locations;

        // Assert (6 assertions)
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $locations); // 1
        $this->assertCount(2, $locations);                               // 2
        $this->assertTrue($locations->contains($location1));             // 3
        $this->assertTrue($locations->contains($location2));             // 4
        $this->assertDatabaseHas('event_location', [
            'event_id' => $event->id,
            'location_id' => $location1->id,
        ]); // 5
        $this->assertDatabaseHas('event_location', [
            'event_id' => $event->id,
            'location_id' => $location2->id,
        ]); // 6
    }

    #[Test]
    public function test_event_can_have_zero_locations(): void
    {
        // Arrange
        $event = Event::factory()->create();

        // Act
        $locations = $event->locations;

        // Assert (3 assertions)
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $locations); // 1
        $this->assertCount(0, $locations);                               // 2
        $this->assertEmpty($locations);                                  // 3
    }

    #[Test]
    public function test_soft_deleting_event_preserves_location_relationships(): void
    {
        // Arrange
        $org = Organization::factory()->create();
        $event = Event::factory()->create(['entity_id' => $org->id]);
        $location = Location::factory()->create(['entity_id' => $org->id]);
        $event->locations()->attach($location->id);

        // Verify attachment
        $this->assertDatabaseHas('event_location', [
            'event_id' => $event->id,
            'location_id' => $location->id,
        ]);

        // Act
        $event->delete();

        // Assert (4 assertions)
        $this->assertSoftDeleted('events', ['id' => $event->id]);        // 1
        // Soft delete preserves pivot records (allows restoration with relationships intact)
        $this->assertDatabaseHas('event_location', [
            'event_id' => $event->id,
            'location_id' => $location->id,
        ]); // 2: Pivot record preserved
        $this->assertDatabaseHas('locations', ['id' => $location->id]);  // 3: Location still exists
        $this->assertEquals(1, Event::withTrashed()->find($event->id)->locations()->count()); // 4: Relationship preserved
    }
}
