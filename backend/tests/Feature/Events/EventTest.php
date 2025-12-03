<?php

namespace Tests\Feature\Events;

use App\Models\Event;
use App\Models\User;

use App\Models\EventType;
use App\Models\EventSubtype;
use App\Models\Location;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EventTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed only lookup tables
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);  // Seeds event_formats
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
    }

    private function authenticateUser(): User
    {
        $user = User::factory()->create();
        $organization = \App\Models\Organization::factory()->create();
        $user->organizations()->attach($organization->id);
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    /**
     * Get event status ID by status code
     */
    private function getStatusId(string $statusCode): int
    {
        return \DB::table('event_statuses')
            ->where('status_code', $statusCode)
            ->value('id') ?? 1;
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
    public function test_can_list_events(): void
    {
        $this->authenticateUser();

        $response = $this->getJson('/api/v1/events');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data',
                     'links',
                     'meta'
                 ]);

        // Verify data is array
        $this->assertTrue(is_array($response->json('data')));
    }

    #[Test]
    public function test_can_create_event(): void
    {
        $user = $this->authenticateUser();
        $organization = $user->organizations()->first();

        $location = Location::factory()->create(['entity_id' => $organization->id]);
        $eventTypeIds = $this->getValidEventTypeIds();

        $eventData = [
            'title' => 'Test Event Creation',
            'description' => 'Test event description for automated testing',
            'start_date' => now()->addDays(7)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(8)->format('Y-m-d H:i:s'),
            'event_type_id' => $eventTypeIds['event_type_id'],
            'event_subtype_id' => $eventTypeIds['event_subtype_id'],
            'location_ids' => [$location->id],
            'format_id' => \DB::table('event_formats')->first()->id,
            'status_id' => $this->getStatusId('draft'),
            'entity_id' => $organization->id,
            'is_featured' => false,
            'max_attendees' => 100
        ];

        $response = $this->postJson('/api/v1/events', $eventData);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'title' => 'Test Event Creation'
                 ]);

        $this->assertDatabaseHas('events', [
            'title' => 'Test Event Creation',
            'description' => 'Test event description for automated testing'
        ]);
    }

    #[Test]
    public function test_can_update_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'title' => 'Original Event Title'
        ]);

        $updateData = [
            'title' => 'Updated Event Title',
            'description' => 'Updated event description'
        ];

        $response = $this->putJson("/api/v1/events/{$event->id}", $updateData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Event Title'
        ]);
    }

    #[Test]
    public function test_can_delete_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => $this->getStatusId('draft')
        ]);

        $response = $this->deleteJson("/api/v1/events/{$event->id}");

        $response->assertStatus(200);

        // With SoftDeletes, the record exists but has deleted_at set
        $this->assertSoftDeleted('events', [
            'id' => $event->id
        ]);
    }

    #[Test]
    public function test_can_get_event_statistics(): void
    {
        $this->authenticateUser();

        $response = $this->getJson('/api/v1/events/statistics');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'total',
                         'published',
                         'pending',
                         'draft'
                     ]
                 ]);

        // Verify statistics structure
        $data = $response->json('data');
        $this->assertIsArray($data);
    }

    #[Test]
    public function test_can_duplicate_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'title' => 'Original Event for Duplication'
        ]);

        $response = $this->postJson("/api/v1/events/{$event->id}/duplicate");

        $response->assertStatus(201);

        // Verify duplicate was created with (Copia) suffix
        $this->assertDatabaseHas('events', [
            'title' => 'Original Event for Duplication (Copia)'
        ]);
    }

    #[Test]
    public function test_can_toggle_featured_status(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'is_featured' => false
        ]);

        // Toggle to true
        $response = $this->patchJson("/api/v1/events/{$event->id}/toggle-featured");

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'is_featured' => true
        ]);

        // Toggle back to false
        $response = $this->patchJson("/api/v1/events/{$event->id}/toggle-featured");

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'is_featured' => false
        ]);
    }

    #[Test]
    public function test_can_get_single_event_detail(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'title' => 'Detailed Event Test'
        ]);

        $response = $this->getJson("/api/v1/events/{$event->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'title' => 'Detailed Event Test'
                 ])
                 ->assertJsonStructure([
                     'data' => [
                         'id',
                         'title',
                         'description',
                         'start_date',
                         'end_date'
                     ]
                 ]);
    }
}
