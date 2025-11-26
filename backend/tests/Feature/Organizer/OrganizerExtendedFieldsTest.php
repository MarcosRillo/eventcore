<?php

namespace Tests\Feature\Organizer;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests for the extended fields migration (27 new columns)
 *
 * This test suite verifies that the migration 2025_11_25_162610_add_extended_fields_to_events_table
 * successfully added all 27 new columns to the events table.
 */
class OrganizerExtendedFieldsTest extends TestCase
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
    }

    #[Test]
    public function test_migration_adds_all_basic_information_fields(): void
    {
        // Assert: Verify 7 basic information fields exist (Assertions 1-7)
        $this->assertTrue(Schema::hasColumn('events', 'edition_number'));
        $this->assertTrue(Schema::hasColumn('events', 'event_type'));
        $this->assertTrue(Schema::hasColumn('events', 'event_subtype'));
        $this->assertTrue(Schema::hasColumn('events', 'origin'));
        $this->assertTrue(Schema::hasColumn('events', 'theme'));
        $this->assertTrue(Schema::hasColumn('events', 'frequency'));
        $this->assertTrue(Schema::hasColumn('events', 'rotation_type'));
    }

    #[Test]
    public function test_migration_adds_all_catering_service_fields(): void
    {
        // Assert: Verify 5 catering/service boolean fields exist (Assertions 1-5)
        $this->assertTrue(Schema::hasColumn('events', 'coffee_break'));
        $this->assertTrue(Schema::hasColumn('events', 'lunch_catering'));
        $this->assertTrue(Schema::hasColumn('events', 'dinner_catering'));
        $this->assertTrue(Schema::hasColumn('events', 'pre_event_package'));
        $this->assertTrue(Schema::hasColumn('events', 'post_event_package'));
    }

    #[Test]
    public function test_migration_adds_all_location_fields(): void
    {
        // Assert: Verify 6 location-related fields exist (Assertions 1-6)
        $this->assertTrue(Schema::hasColumn('events', 'venue'));
        $this->assertTrue(Schema::hasColumn('events', 'city'));
        $this->assertTrue(Schema::hasColumn('events', 'rooms_used'));
        $this->assertTrue(Schema::hasColumn('events', 'maps_url'));
        $this->assertTrue(Schema::hasColumn('events', 'previous_venue'));
        $this->assertTrue(Schema::hasColumn('events', 'next_venue'));
    }

    #[Test]
    public function test_migration_adds_asynchronous_dates_json_field(): void
    {
        // Assert: Verify asynchronous_dates JSON field exists
        $this->assertTrue(Schema::hasColumn('events', 'asynchronous_dates'));

        // Verify column accepts JSON data by creating an event with JSON array
        $jsonData = [
            ['date' => '2025-12-01', 'start_time' => '09:00', 'end_time' => '17:00'],
            ['date' => '2025-12-03', 'start_time' => '10:00', 'end_time' => '18:00']
        ];

        $event = \App\Models\Event::factory()->create([
            'asynchronous_dates' => $jsonData
        ]);

        // Assert: Verify JSON data was stored and retrieved correctly (Assertions 2-4)
        $this->assertNotNull($event->asynchronous_dates);
        $this->assertIsArray($event->asynchronous_dates);
        $this->assertCount(2, $event->asynchronous_dates);

        // Verify database state
        $this->assertDatabaseHas('events', [
            'id' => $event->id
        ]);

        // Verify column accepts null values (nullable)
        $eventWithNull = \App\Models\Event::factory()->create([
            'asynchronous_dates' => null
        ]);
        $this->assertNull($eventWithNull->asynchronous_dates);
    }

    #[Test]
    public function test_migration_adds_all_attendance_fields(): void
    {
        // Assert: Verify 4 attendance fields exist (Assertions 1-4)
        $this->assertTrue(Schema::hasColumn('events', 'local_attendance'));
        $this->assertTrue(Schema::hasColumn('events', 'national_attendance'));
        $this->assertTrue(Schema::hasColumn('events', 'international_attendance'));
        $this->assertTrue(Schema::hasColumn('events', 'virtual_transmission'));
    }

    #[Test]
    public function test_migration_adds_all_additional_information_fields(): void
    {
        // Assert: Verify 2 additional information fields exist (Assertions 1-2)
        $this->assertTrue(Schema::hasColumn('events', 'producer'));
        $this->assertTrue(Schema::hasColumn('events', 'event_website'));
    }

    #[Test]
    public function test_migration_adds_all_image_fields(): void
    {
        // Assert: Verify 2 image URL fields exist (Assertions 1-2)
        $this->assertTrue(Schema::hasColumn('events', 'logo_url'));
        $this->assertTrue(Schema::hasColumn('events', 'responsive_image_url'));
    }

    #[Test]
    public function test_all_27_extended_fields_exist_in_events_table(): void
    {
        // Comprehensive test: Verify all 27 new columns exist (27 assertions)
        $expectedColumns = [
            // Basic Information (7)
            'edition_number',
            'event_type',
            'event_subtype',
            'origin',
            'theme',
            'frequency',
            'rotation_type',

            // Catering Services (5)
            'coffee_break',
            'lunch_catering',
            'dinner_catering',
            'pre_event_package',
            'post_event_package',

            // Location (6)
            'venue',
            'city',
            'rooms_used',
            'maps_url',
            'previous_venue',
            'next_venue',

            // Asynchronous Dates (1)
            'asynchronous_dates',

            // Attendance (4)
            'local_attendance',
            'national_attendance',
            'international_attendance',
            'virtual_transmission',

            // Additional Information (2)
            'producer',
            'event_website',

            // Images (2)
            'logo_url',
            'responsive_image_url',
        ];

        // Assert each column exists
        foreach ($expectedColumns as $column) {
            $this->assertTrue(
                Schema::hasColumn('events', $column),
                "Column '{$column}' does not exist in events table"
            );
        }

        // Additional assertion: Verify count
        $this->assertCount(27, $expectedColumns);
    }

    #[Test]
    public function test_boolean_fields_have_correct_defaults(): void
    {
        // Create an event without specifying boolean fields
        $event = \App\Models\Event::factory()->create();

        // Assert: Boolean fields should default to false (Assertions 1-6)
        $this->assertFalse((bool) $event->coffee_break);
        $this->assertFalse((bool) $event->lunch_catering);
        $this->assertFalse((bool) $event->dinner_catering);
        $this->assertFalse((bool) $event->pre_event_package);
        $this->assertFalse((bool) $event->post_event_package);
        $this->assertFalse((bool) $event->virtual_transmission);

        // Verify database state
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'coffee_break' => false,
            'virtual_transmission' => false
        ]);
    }

    #[Test]
    public function test_nullable_fields_accept_null_values(): void
    {
        // Create event with all nullable extended fields as null
        $event = \App\Models\Event::factory()->create([
            'edition_number' => null,
            'event_type' => null,
            'origin' => null,
            'venue' => null,
            'city' => null,
            'asynchronous_dates' => null,
            'local_attendance' => null,
            'producer' => null,
            'logo_url' => null,
        ]);

        // Assert: All specified fields are null (Assertions 1-9)
        $this->assertNull($event->edition_number);
        $this->assertNull($event->event_type);
        $this->assertNull($event->origin);
        $this->assertNull($event->venue);
        $this->assertNull($event->city);
        $this->assertNull($event->asynchronous_dates);
        $this->assertNull($event->local_attendance);
        $this->assertNull($event->producer);
        $this->assertNull($event->logo_url);

        // Verify database state
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'edition_number' => null,
            'venue' => null,
            'producer' => null
        ]);
    }
}
