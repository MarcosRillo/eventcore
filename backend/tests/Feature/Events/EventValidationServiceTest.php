<?php

namespace Tests\Feature\Events;

use App\Features\Events\Services\EventValidationService;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventOrigin;
use App\Models\EventStatus;
use App\Models\EventType;
use App\Models\Location;
use App\Models\Organization;
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
    private Category $category;
    private Location $location;
    private Location $locationWithCity;
    private EventStatus $draftStatus;
    private EventType $eventType;
    private ?EventOrigin $origin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\EventLookupSeeder::class);

        $this->service = new EventValidationService();

        $this->organization = Organization::factory()->create();
        $this->producerOrg = Organization::factory()->create(['name' => 'Test Producer Org']);
        $this->category = Category::factory()->create(['entity_id' => $this->organization->id]);
        $this->location = Location::factory()->create([
            'entity_id' => $this->organization->id,
            'city' => null,
        ]);
        $this->locationWithCity = Location::factory()->create([
            'entity_id' => $this->organization->id,
            'city' => 'San Miguel de Tucumán',
        ]);
        $this->draftStatus = EventStatus::where('status_code', 'draft')->first();
        $this->eventType = EventType::first();
        $this->origin = EventOrigin::where('code', 'national')->first();
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
    public function validates_internal_without_type_id_returns_error(): void
    {
        $event = $this->createEventWithInternalFields(['type_id' => null]);

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('type_id', $result->getErrors());
    }

    #[Test]
    public function validates_internal_without_category_id_returns_error(): void
    {
        $event = $this->createEventWithInternalFields(['category_id' => null]);

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('category_id', $result->getErrors());
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
    public function validates_internal_without_producer_id_returns_error(): void
    {
        $event = $this->createEventWithInternalFields(['producer_id' => null]);

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('producer_id', $result->getErrors());
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
        $event = $this->createEventWithInternalFields([
            'title' => null,
            'producer_id' => null,
            'edition_number' => null,
        ]);

        $result = $this->service->validateForInternalApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertCount(3, $result->getErrors());
        $this->assertArrayHasKey('title', $result->getErrors());
        $this->assertArrayHasKey('producer_id', $result->getErrors());
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

    #[Test]
    public function validates_public_without_origin_id_returns_error(): void
    {
        $event = $this->createEventWithAllPublicFields(['origin_id' => null]);

        $result = $this->service->validateForPublicApproval($event);

        $this->assertFalse($result->isValid());
        $this->assertArrayHasKey('origin_id', $result->getErrors());
    }

    // ==========================================
    // getMissingFields TESTS
    // ==========================================

    #[Test]
    public function get_missing_fields_for_internal_returns_correct_list(): void
    {
        $event = $this->createEventWithInternalFields([
            'producer_id' => null,
            'edition_number' => null,
        ]);

        $missing = $this->service->getMissingFields($event, 'approved_internal');

        $this->assertArrayHasKey('producer_id', $missing);
        $this->assertArrayHasKey('edition_number', $missing);
        $this->assertCount(2, $missing);
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
            'type_id' => $this->eventType->id,
            'category_id' => $this->category->id,
            'edition_number' => '5ta Edición',
            'producer_id' => $this->producerOrg->id,
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            // Explicitly null out public fields
            'description' => null,
            'featured_image' => null,
            'origin_id' => null,
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
            'type_id' => $this->eventType->id,
            'category_id' => $this->category->id,
            'edition_number' => '5ta Edición',
            'producer_id' => $this->producerOrg->id,
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
            // Public fields
            'description' => 'Descripción completa del evento de prueba',
            'featured_image' => 'https://example.com/image.jpg',
            'origin_id' => $this->origin?->id,
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
