<?php

namespace Tests\Feature\Organizer;

use App\Models\Event;
use App\Models\EventFrequency;
use App\Models\EventOrigin;
use App\Models\EventRoom;
use App\Models\EventService;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests for the 3NF normalized event schema
 *
 * This test suite verifies that the events table has been properly
 * normalized to 3NF with FK columns instead of denormalized strings.
 *
 * Updated for 3NF normalized schema (Nov 30, 2025).
 */
class OrganizerExtendedFieldsTest extends TestCase
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

        // Create tourism entity (id=1) for locations FK
        \DB::table('organizations')->insertOrIgnore([
            'id' => 1,
            'name' => 'Ente de Turismo de Tucumán',
            'slug' => 'ente-turismo-tucuman',
            'cuit' => '30-12345678-9',
            'description' => 'Ente principal de turismo',
            'type_id' => \DB::table('organization_types')->value('id'),
            'status_id' => \DB::table('organization_statuses')->value('id'),
            'parent_id' => null,
            'trust_level' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Reset sequence to avoid id collision
        \DB::statement('ALTER SEQUENCE organizations_id_seq RESTART WITH 100');
    }

    // ==========================================
    // LOOKUP TABLES EXIST TESTS
    // ==========================================

    #[Test]
    public function test_lookup_tables_exist(): void
    {
        // Assert: Verify all lookup tables exist
        $this->assertTrue(Schema::hasTable('event_origins'));
        $this->assertTrue(Schema::hasTable('event_frequencies'));
        $this->assertTrue(Schema::hasTable('event_subtypes'));
        $this->assertTrue(Schema::hasTable('event_services'));
        $this->assertTrue(Schema::hasTable('event_rooms'));
    }

    #[Test]
    public function test_pivot_tables_exist(): void
    {
        // Assert: Verify pivot tables exist
        $this->assertTrue(Schema::hasTable('event_service'));
        $this->assertTrue(Schema::hasTable('event_room'));
        $this->assertTrue(Schema::hasTable('event_async_dates'));
    }

    // ==========================================
    // FK COLUMNS EXIST TESTS
    // ==========================================

    #[Test]
    public function test_events_table_has_normalized_fk_columns(): void
    {
        // Assert: Verify FK columns exist in events table
        $this->assertTrue(Schema::hasColumn('events', 'origin_id'));
        $this->assertTrue(Schema::hasColumn('events', 'frequency_id'));
        $this->assertTrue(Schema::hasColumn('events', 'producer_id'));
    }

    #[Test]
    public function test_denormalized_columns_removed(): void
    {
        // Assert: Verify old denormalized columns were removed
        $this->assertFalse(Schema::hasColumn('events', 'event_type'));
        $this->assertFalse(Schema::hasColumn('events', 'event_subtype'));
        $this->assertFalse(Schema::hasColumn('events', 'origin'));
        $this->assertFalse(Schema::hasColumn('events', 'theme'));
        $this->assertFalse(Schema::hasColumn('events', 'frequency'));
        $this->assertFalse(Schema::hasColumn('events', 'producer'));
        $this->assertFalse(Schema::hasColumn('events', 'city'));
        $this->assertFalse(Schema::hasColumn('events', 'venue'));
        $this->assertFalse(Schema::hasColumn('events', 'rooms_used'));
        $this->assertFalse(Schema::hasColumn('events', 'coffee_break'));
        $this->assertFalse(Schema::hasColumn('events', 'lunch_catering'));
        $this->assertFalse(Schema::hasColumn('events', 'dinner_catering'));
        $this->assertFalse(Schema::hasColumn('events', 'asynchronous_dates'));
    }

    // ==========================================
    // LOOKUP TABLES DATA TESTS
    // ==========================================

    #[Test]
    public function test_event_origins_seeded_with_correct_values(): void
    {
        // Assert: Verify EventOrigin lookup table has expected values
        $this->assertDatabaseHas('event_origins', ['code' => 'local']);
        $this->assertDatabaseHas('event_origins', ['code' => 'national']);
        $this->assertDatabaseHas('event_origins', ['code' => 'international']);
        $this->assertEquals(3, EventOrigin::count());
    }

    #[Test]
    public function test_event_frequencies_seeded(): void
    {
        // Assert: Verify frequencies are seeded
        $this->assertGreaterThan(0, EventFrequency::count());
        $this->assertDatabaseHas('event_frequencies', ['code' => 'unico']);
        $this->assertDatabaseHas('event_frequencies', ['code' => 'anual']);
    }

    // ==========================================
    // EVENT RELATIONSHIPS TESTS
    // ==========================================

    #[Test]
    public function test_event_can_have_origin_relationship(): void
    {
        $origin = EventOrigin::where('code', 'national')->first();

        $event = Event::factory()->create([
            'origin_id' => $origin->id,
        ]);

        // Assert: Verify relationship works
        $this->assertNotNull($event->origin);
        $this->assertEquals('national', $event->origin->code);
        $this->assertEquals('Nacional', $event->origin->name);
    }

    #[Test]
    public function test_event_can_have_producer_relationship(): void
    {
        $producer = Organization::factory()->create(['name' => 'Producer Org']);

        $event = Event::factory()->create([
            'producer_id' => $producer->id,
        ]);

        // Assert: Verify relationship works
        $this->assertNotNull($event->producer);
        $this->assertEquals('Producer Org', $event->producer->name);
    }

    #[Test]
    public function test_event_can_have_many_services(): void
    {
        $services = EventService::take(3)->get();
        $event = Event::factory()->create();

        // Attach services via pivot
        $event->services()->attach($services->pluck('id'), ['is_included' => true]);

        $event->refresh();

        // Assert: Verify many-to-many relationship works
        $this->assertCount(3, $event->services);
        $this->assertTrue($event->services->first()->pivot->is_included);
    }

    #[Test]
    public function test_event_can_have_many_rooms(): void
    {
        // Create a location first (required by event_rooms FK)
        $location = \App\Models\Location::factory()->create(['entity_id' => 1]);

        // Create rooms directly since no seeder exists for them
        $room1 = EventRoom::create([
            'location_id' => $location->id,
            'name' => 'Sala Principal',
            'code' => 'sala_principal',
            'is_active' => true,
        ]);
        $room2 = EventRoom::create([
            'location_id' => $location->id,
            'name' => 'Sala Secundaria',
            'code' => 'sala_secundaria',
            'is_active' => true,
        ]);

        $event = Event::factory()->create();

        // Attach rooms via pivot
        $event->rooms()->attach([$room1->id, $room2->id]);

        $event->refresh();

        // Assert: Verify many-to-many relationship works
        $this->assertCount(2, $event->rooms);
    }

    #[Test]
    public function test_event_can_have_async_dates(): void
    {
        $event = Event::factory()->create();

        // Create async dates via relationship
        $event->asyncDates()->createMany([
            ['date_value' => '2025-12-01', 'notes' => 'Day 1'],
            ['date_value' => '2025-12-03', 'notes' => 'Day 2'],
        ]);

        $event->refresh();

        // Assert: Verify has-many relationship works
        $this->assertCount(2, $event->asyncDates);
        $this->assertEquals('Day 1', $event->asyncDates->first()->notes);
    }

    // ==========================================
    // NULLABLE FK TESTS
    // ==========================================

    #[Test]
    public function test_nullable_fk_fields_accept_null(): void
    {
        $event = Event::factory()->create([
            'origin_id' => null,
            'frequency_id' => null,
            'producer_id' => null,
        ]);

        // Assert: All FK fields are nullable
        $this->assertNull($event->origin_id);
        $this->assertNull($event->frequency_id);
        $this->assertNull($event->producer_id);

        // Relationships return null
        $this->assertNull($event->origin);
        $this->assertNull($event->producer);
    }

    // ==========================================
    // ATTENDANCE AND OTHER FIELDS TESTS
    // ==========================================

    #[Test]
    public function test_attendance_fields_exist(): void
    {
        $this->assertTrue(Schema::hasColumn('events', 'local_attendance'));
        $this->assertTrue(Schema::hasColumn('events', 'national_attendance'));
        $this->assertTrue(Schema::hasColumn('events', 'international_attendance'));
    }

    #[Test]
    public function test_image_fields_exist(): void
    {
        $this->assertTrue(Schema::hasColumn('events', 'logo_url'));
        $this->assertTrue(Schema::hasColumn('events', 'responsive_image_url'));
        $this->assertTrue(Schema::hasColumn('events', 'featured_image'));
    }
}
