<?php

namespace Tests\Feature\Events;

use App\Features\Events\Services\EventValidationService;
use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Location;
use App\Models\Organization;
use Database\Seeders\EventLookupSeeder;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * EventValidationService Tests
 *
 * Tests for validating event fields for internal and public approval.
 * Internal requires 8 fields, public requires additional fields.
 *
 * Updated for 3NF normalized schema (Nov 30, 2025).
 */
class EventValidationServiceTest extends TestCase
{
    private EventValidationService $service;

    private Organization $organization;

    private Organization $producerOrg;

    private EventType $eventType;

    private EventSubtype $eventSubtype;

    private Location $location;

    private Location $locationWithCity;

    private EventStatus $draftStatus;

    private int $formatId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(UserRolesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
        $this->seed(EventStatusesSeeder::class);
        $this->seed(EventTypesSeeder::class);
        $this->seed(EventLookupSeeder::class);

        $this->service = new EventValidationService;

        $this->organization = Organization::factory()->create();
        $this->producerOrg = Organization::factory()->create(['name' => 'Test Producer Org']);
        $this->eventType = EventType::first() ?? EventType::factory()->create();
        $this->eventSubtype = EventSubtype::where('event_type_id', $this->eventType->id)->first()
            ?? EventSubtype::factory()->create(['event_type_id' => $this->eventType->id]);
        $this->location = Location::factory()->create([
            'entity_id' => $this->organization->id,
            'city' => null,
        ]);
        $this->locationWithCity = Location::factory()->create([
            'entity_id' => $this->organization->id,
            'city' => 'Demo City',
        ]);
        $this->draftStatus = EventStatus::where('status_code', 'draft')->first();
        $this->formatId = \DB::table('event_formats')->value('id') ?? 1;
    }

    // ==========================================
    // INTERNAL VALIDATION TESTS (8 campos)
    // ==========================================

    #[Test]
    public function validates_internal_with_all_required_fields_returns_valid(): void
    {
        $event = $this->createEventWithInternalFields();

        $result = $this->service->validateForInternalApproval($event);

        $this->assertTrue($result->isValid());
        $this->assertEmpty($result->getErrors());
    }

    #[Test]
    public function validates_internal_without_title_returns_error(): void
    {
        $event = $this->createEventWithInternalFields(['title' => null]);

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('title', $result->getErrors());
    }

    #[Test]
    public function validates_internal_without_start_date_returns_error(): void
    {
        $event = $this->createEventWithInternalFields(['start_date' => null]);

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('start_date', $result->getErrors());
    }

    #[Test]
    public function validates_internal_without_end_date_returns_error(): void
    {
        $event = $this->createEventWithInternalFields(['end_date' => null]);

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('end_date', $result->getErrors());
    }

    #[Test]
    public function validates_internal_without_format_id_returns_error(): void
    {
        $event = $this->createEventWithInternalFields(['format_id' => null]);

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('format_id', $result->getErrors());
    }

    #[Test]
    public function validates_internal_without_event_type_id_returns_error(): void
    {
        $event = $this->createEventWithInternalFields(['event_type_id' => null]);

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('event_type_id', $result->getErrors());
    }

    #[Test]
    public function validates_internal_without_event_subtype_id_returns_error(): void
    {
        $event = $this->createEventWithInternalFields(['event_subtype_id' => null]);

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('event_subtype_id', $result->getErrors());
    }

    #[Test]
    public function validates_internal_without_edition_number_returns_error(): void
    {
        $event = $this->createEventWithInternalFields(['edition_number' => null]);

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('edition_number', $result->getErrors());
    }

    #[Test]
    public function validates_internal_without_producer_id_passes_since_auto_filled(): void
    {
        // producer_id is auto-filled with organization_id on creation (Dec 2, 2025)
        // Events can pass validation even if producer_id is null at validation time
        // because it will be auto-filled during the submission flow
        $event = $this->createEventWithInternalFields(['producer_id' => null]);

        $result = $this->service->validateForInternalApproval($event);

        // producer_id is no longer a required field in validation
        $this->assertTrue($result->isValid());
    }

    #[Test]
    public function validates_internal_without_location_returns_error(): void
    {
        $event = $this->createEventWithInternalFields();
        $event->locations()->detach();
        $event->refresh();

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('location', $result->getErrors());
    }

    #[Test]
    public function validates_internal_with_multiple_missing_fields_returns_all_errors(): void
    {
        // producer_id is no longer required (Dec 2, 2025 - auto-filled)
        $event = $this->createEventWithInternalFields([
            'title' => null,
            'edition_number' => null,
        ]);

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertCount(2, $result->getErrors());
        $this->assertArrayHasKey('title', $result->getErrors());
        $this->assertArrayHasKey('edition_number', $result->getErrors());
    }

    // ==========================================
    // PUBLIC VALIDATION TESTS
    // ==========================================

    #[Test]
    public function validates_public_with_all_required_fields_returns_valid(): void
    {
        $event = $this->createEventWithAllPublicFields();

        $result = $this->service->validateForPublicApproval($event);

        $this->assertTrue($result->isValid());
        $this->assertEmpty($result->getErrors());
    }

    #[Test]
    public function validates_public_includes_internal_validation(): void
    {
        $event = $this->createEventWithAllPublicFields(['title' => null]);

        $result = $this->service->validateForPublicApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('title', $result->getErrors());
    }

    #[Test]
    public function validates_public_without_description_returns_error(): void
    {
        $event = $this->createEventWithAllPublicFields(['description' => null]);

        $result = $this->service->validateForPublicApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('description', $result->getErrors());
    }

    #[Test]
    public function validates_public_without_featured_image_returns_error(): void
    {
        $event = $this->createEventWithAllPublicFields(['featured_image' => null]);

        $result = $this->service->validateForPublicApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('featured_image', $result->getErrors());
    }

    #[Test]
    public function validates_public_without_location_city_returns_error(): void
    {
        $event = $this->createEventWithAllPublicFields();
        // Detach location with city and attach one without
        $event->locations()->detach();
        $event->locations()->attach($this->location->id);
        $event->refresh();

        $result = $this->service->validateForPublicApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('location_city', $result->getErrors());
    }

    #[Test]
    public function validates_public_without_any_attendance_returns_error(): void
    {
        $event = $this->createEventWithAllPublicFields([
            'local_attendance' => null,
            'national_attendance' => null,
            'international_attendance' => null,
        ]);

        $result = $this->service->validateForPublicApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('attendance', $result->getErrors());
    }

    #[Test]
    public function validates_public_with_only_local_attendance_is_valid(): void
    {
        $event = $this->createEventWithAllPublicFields([
            'local_attendance' => 100,
            'national_attendance' => null,
            'international_attendance' => null,
        ]);

        $result = $this->service->validateForPublicApproval($event);

        $this->assertTrue($result->isValid());
    }

    #[Test]
    public function validates_public_with_only_international_attendance_is_valid(): void
    {
        $event = $this->createEventWithAllPublicFields([
            'local_attendance' => null,
            'national_attendance' => null,
            'international_attendance' => 50,
        ]);

        $result = $this->service->validateForPublicApproval($event);

        $this->assertTrue($result->isValid());
    }

    // ==========================================
    // getMissingFields TESTS
    // ==========================================

    #[Test]
    public function get_missing_fields_for_internal_returns_correct_list(): void
    {
        // producer_id is no longer required (Dec 2, 2025 - auto-filled)
        $event = $this->createEventWithInternalFields([
            'edition_number' => null,
        ]);

        $missing = $this->service->getMissingFields($event, 'approved_internal');

        $this->assertArrayHasKey('edition_number', $missing);
        $this->assertCount(1, $missing);
    }

    #[Test]
    public function get_missing_fields_for_published_returns_correct_list(): void
    {
        $event = $this->createEventWithInternalFields();
        // Attach location without city
        $event->locations()->detach();
        $event->locations()->attach($this->location->id);
        $event->refresh();

        $missing = $this->service->getMissingFields($event, 'published');

        $this->assertArrayHasKey('description', $missing);
        $this->assertArrayHasKey('featured_image', $missing);
        $this->assertArrayHasKey('location_city', $missing);
    }

    #[Test]
    public function get_missing_fields_for_unknown_status_returns_empty(): void
    {
        $event = $this->createEventWithInternalFields();

        $missing = $this->service->getMissingFields($event, 'unknown_status');

        $this->assertEmpty($missing);
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    /**
     * Creates an event with all internal required fields filled.
     * Updated for 3NF normalized schema.
     */
    private function createEventWithInternalFields(array $overrides = []): Event
    {
        $event = Event::factory()->create([
            'title' => 'Test Event',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(11),
            'format_id' => $this->formatId,
            'event_type_id' => $this->eventType->id,
            'event_subtype_id' => $this->eventSubtype->id,
            'edition_number' => '5ta Edición',
            'producer_id' => $this->producerOrg->id,
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            // Explicitly null out public fields
            'description' => null,
            'featured_image' => null,
            'local_attendance' => null,
            'national_attendance' => null,
            'international_attendance' => null,
        ]);
        $event->locations()->attach($this->locationWithCity->id);
        $event->load('locations');

        // Apply overrides in-memory (for testing null values)
        foreach ($overrides as $key => $value) {
            $event->$key = $value;
        }

        return $event;
    }

    /**
     * Creates an event with all public required fields filled.
     * Updated for 3NF normalized schema.
     */
    private function createEventWithAllPublicFields(array $overrides = []): Event
    {
        $event = Event::factory()->create([
            'title' => 'Test Event',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(11),
            'format_id' => $this->formatId,
            'event_type_id' => $this->eventType->id,
            'event_subtype_id' => $this->eventSubtype->id,
            'edition_number' => '5ta Edición',
            'producer_id' => $this->producerOrg->id,
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            // Public fields
            'description' => 'Descripción completa del evento de prueba',
            'featured_image' => 'https://example.com/image.jpg',
            'local_attendance' => 500,
            'national_attendance' => 200,
            'international_attendance' => 100,
        ]);
        $event->locations()->attach($this->locationWithCity->id);
        $event->load('locations');

        // Apply overrides in-memory (for testing null values)
        foreach ($overrides as $key => $value) {
            $event->$key = $value;
        }

        return $event;
    }
}
