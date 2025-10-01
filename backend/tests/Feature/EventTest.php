<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use App\Models\Category;
use App\Models\Location;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class EventTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed base data only if not exists (PostgreSQL + DatabaseTransactions)
        if (\DB::table('user_roles')->count() === 0) {
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\UserRolesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\EventStatusesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\EventTypesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\OrganizationStatusesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\OrganizationTypesSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\OrganizationSeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\CategorySeeder']);
            $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\LocationSeeder']);
        }
    }

    private function authenticateUser(): User
    {
        $user = User::factory()->create();
        $user->organizations()->attach(1);
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    /** @test */
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

    /** @test */
    public function test_can_create_event(): void
    {
        $this->authenticateUser();

        $category = Category::first();
        $location = Location::first();

        $eventData = [
            'title' => 'Test Event Creation',
            'description' => 'Test event description for automated testing',
            'start_date' => now()->addDays(7)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(8)->format('Y-m-d H:i:s'),
            'category_id' => $category->id,
            'location_ids' => [$location->id],
            'type_id' => 1,
            'status_id' => 1,
            'entity_id' => 1,
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

    /** @test */
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

    /** @test */
    public function test_can_delete_event(): void
    {
        $this->authenticateUser();

        $event = Event::factory()->create([
            'status_id' => 1 // draft, so it can be deleted
        ]);

        $response = $this->deleteJson("/api/v1/events/{$event->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('events', [
            'id' => $event->id
        ]);
    }

    /** @test */
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

    /** @test */
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

    /** @test */
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

    /** @test */
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
