<?php

namespace Tests\Feature\Organizer;

use App\Models\Event;
use App\Models\EventRoom;
use App\Models\Location;
use App\Models\Organization;
use Database\Seeders\EventLookupSeeder;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
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
 * Updated 2026-03-29: removed event_origins, event_frequencies, event_services (dead code cleanup).
 */
class OrganizerExtendedFieldsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed lookup tables
        $this->seed(UserRolesSeeder::class);
        $this->seed(EventStatusesSeeder::class);
        $this->seed(EventTypesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
        $this->seed(EventLookupSeeder::class);

        // Create tourism entity (id=1) for locations FK
        \DB::table('organizations')->insertOrIgnore([
            'id' => 1,
            'name' => 'Demo Organization',
            'slug' => 'demo-organization',
            'cuit' => '30-12345678-9',
            'description' => 'Ente principal de turismo',
            'type_id' => \DB::table('organization_types')->value('id'),
            'status_id' => \DB::table('organization_statuses')->value('id'),
            'parent_id' => null,
            'trust_level' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Reset sequence to avoid id collision (setval is DML-safe inside transactions, unlike ALTER SEQUENCE DDL)
        \DB::select("SELECT setval('organizations_id_seq', 100)");
    }

    // ==========================================
    // LOOKUP TABLES EXIST TESTS
    // ==========================================

    #[Test]
    public function test_lookup_tables_exist(): void
    {
        $this->assertTrue(Schema::hasTable('event_subtypes'));
        $this->assertTrue(Schema::hasTable('event_rooms'));
    }

    #[Test]
    public function test_pivot_tables_exist(): void
    {
        $this->assertTrue(Schema::hasTable('event_room'));
        $this->assertTrue(Schema::hasTable('event_async_dates'));
    }

    #[Test]
    public function test_removed_lookup_tables_no_longer_exist(): void
    {
        $this->assertFalse(Schema::hasTable('event_origins'));
        $this->assertFalse(Schema::hasTable('event_frequencies'));
        $this->assertFalse(Schema::hasTable('event_services'));
        $this->assertFalse(Schema::hasTable('event_service'));
    }

    // ==========================================
    // FK COLUMNS EXIST TESTS
    // ==========================================

    #[Test]
    public function test_events_table_has_normalized_fk_columns(): void
    {
        $this->assertTrue(Schema::hasColumn('events', 'producer_id'));
    }

    #[Test]
    public function test_events_table_no_longer_has_removed_fk_columns(): void
    {
        $this->assertFalse(Schema::hasColumn('events', 'origin_id'));
        $this->assertFalse(Schema::hasColumn('events', 'frequency_id'));
    }

    #[Test]
    public function test_denormalized_columns_removed(): void
    {
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
    // EVENT RELATIONSHIPS TESTS
    // ==========================================

    #[Test]
    public function test_event_can_have_producer_relationship(): void
    {
        $producer = Organization::factory()->create(['name' => 'Producer Org']);

        $event = Event::factory()->create([
            'producer_id' => $producer->id,
        ]);

        $this->assertNotNull($event->producer);
        $this->assertEquals('Producer Org', $event->producer->name);
    }

    #[Test]
    public function test_event_can_have_many_rooms(): void
    {
        // Create a location first (required by event_rooms FK)
        $location = Location::factory()->create(['entity_id' => 1]);

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
        $event->rooms()->attach([$room1->id, $room2->id]);
        $event->refresh();

        $this->assertCount(2, $event->rooms);
    }

    #[Test]
    public function test_event_can_have_async_dates(): void
    {
        $event = Event::factory()->create();

        $event->asyncDates()->createMany([
            ['date_value' => '2025-12-01', 'notes' => 'Day 1'],
            ['date_value' => '2025-12-03', 'notes' => 'Day 2'],
        ]);

        $event->refresh();

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
            'producer_id' => null,
        ]);

        $this->assertNull($event->producer_id);
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
