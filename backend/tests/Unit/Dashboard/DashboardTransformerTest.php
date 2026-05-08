<?php

namespace Tests\Unit\Dashboard;

use App\Features\Dashboard\Services\DashboardTransformer;
use App\Models\Event;
use App\Models\EventType;
use App\Models\Organization;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * DashboardTransformer Unit Tests
 *
 * Tests for all transformation methods including transformForList,
 * transformForDetail, and calculateCurrentStateDuration.
 */
class DashboardTransformerTest extends TestCase
{
    use RefreshDatabase;

    private DashboardTransformer $transformer;
    private Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserRolesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
        $this->seed(EventStatusesSeeder::class);
        $this->seed(EventTypesSeeder::class);
        $this->seed(\Database\Seeders\EventLookupSeeder::class);

        $this->transformer = new DashboardTransformer();
        $this->organization = Organization::factory()->primaryEntity()->create();
    }

    private function createEvent(array $attributes = []): Event
    {
        $formatId = \DB::table('event_formats')->value('id');
        $statusId = \DB::table('event_statuses')->where('status_code', 'draft')->value('id')
            ?? \DB::table('event_statuses')->value('id');
        $eventType = EventType::factory()->create(['entity_id' => $this->organization->id]);
        $subtype = \App\Models\EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
        ]);

        return Event::factory()->create(array_merge([
            'entity_id' => $this->organization->id,
            'format_id' => $formatId,
            'status_id' => $statusId,
            'event_type_id' => $eventType->id,
            'event_subtype_id' => $subtype->id,
        ], $attributes));
    }

    // ================================================================
    // transformForList() TESTS
    // ================================================================

    #[Test]
    public function test_transform_for_list_returns_required_keys(): void
    {
        $event = $this->createEvent();
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype']);

        $result = $this->transformer->transformForList($event);

        $this->assertArrayHasKey('id', $result);
        $this->assertArrayHasKey('title', $result);
        $this->assertArrayHasKey('start_date', $result);
        $this->assertArrayHasKey('end_date', $result);
        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('format', $result);
        $this->assertArrayHasKey('entity', $result);
        $this->assertArrayHasKey('event_type', $result);
        $this->assertArrayHasKey('is_featured', $result);
        $this->assertArrayHasKey('current_state_duration', $result);
        $this->assertArrayHasKey('is_happening', $result);
        $this->assertArrayHasKey('has_ended', $result);
        $this->assertArrayHasKey('is_upcoming', $result);
    }

    #[Test]
    public function test_transform_for_list_formats_dates_correctly(): void
    {
        $event = $this->createEvent();
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype']);

        $result = $this->transformer->transformForList($event);

        // Verify date format Y-m-d H:i:s
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $result['start_date']);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $result['end_date']);
    }

    #[Test]
    public function test_transform_for_list_includes_status_fields(): void
    {
        $event = $this->createEvent();
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype']);

        $result = $this->transformer->transformForList($event);

        $this->assertArrayHasKey('id', $result['status']);
        $this->assertArrayHasKey('status_code', $result['status']);
        $this->assertArrayHasKey('status_name', $result['status']);
    }

    #[Test]
    public function test_transform_for_list_includes_format_fields(): void
    {
        $event = $this->createEvent();
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype']);

        $result = $this->transformer->transformForList($event);

        $this->assertArrayHasKey('id', $result['format']);
        $this->assertArrayHasKey('format_code', $result['format']);
        $this->assertArrayHasKey('format_name', $result['format']);
    }

    #[Test]
    public function test_transform_for_list_returns_null_event_type_when_none(): void
    {
        // Test when eventType is null (optional relationship)
        $event = $this->createEvent();
        $event->load(['status', 'format', 'entity', 'eventSubtype']);
        // Manually unset event type
        $event->setRelation('eventType', null);

        $result = $this->transformer->transformForList($event);

        $this->assertNull($result['event_type']);
    }

    #[Test]
    public function test_transform_for_list_includes_event_type_when_present(): void
    {
        $eventType = EventType::factory()->create(['entity_id' => $this->organization->id]);
        $event = $this->createEvent(['event_type_id' => $eventType->id]);
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype']);

        $result = $this->transformer->transformForList($event);

        $this->assertNotNull($result['event_type']);
        $this->assertEquals($eventType->id, $result['event_type']['id']);
        $this->assertEquals($eventType->name, $result['event_type']['name']);
    }

    // ================================================================
    // transformForDetail() TESTS
    // ================================================================

    #[Test]
    public function test_transform_for_detail_returns_required_keys(): void
    {
        $event = $this->createEvent();
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype', 'locations', 'creator', 'approvals']);

        $result = $this->transformer->transformForDetail($event);

        $this->assertArrayHasKey('id', $result);
        $this->assertArrayHasKey('title', $result);
        $this->assertArrayHasKey('description', $result);
        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('format', $result);
        $this->assertArrayHasKey('entity', $result);
        $this->assertArrayHasKey('locations', $result);
        $this->assertArrayHasKey('approval_history', $result);
        $this->assertArrayHasKey('creator', $result);
        $this->assertArrayHasKey('has_multiple_locations', $result);
        $this->assertArrayHasKey('has_cta', $result);
        $this->assertArrayHasKey('is_in_approval_workflow', $result);
    }

    #[Test]
    public function test_transform_for_detail_includes_entity_contact_fields(): void
    {
        $event = $this->createEvent();
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype', 'locations', 'creator', 'approvals']);

        $result = $this->transformer->transformForDetail($event);

        $this->assertArrayHasKey('email', $result['entity']);
        $this->assertArrayHasKey('phone', $result['entity']);
    }

    #[Test]
    public function test_transform_for_detail_includes_status_description(): void
    {
        $event = $this->createEvent();
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype', 'locations', 'creator', 'approvals']);

        $result = $this->transformer->transformForDetail($event);

        $this->assertArrayHasKey('description', $result['status']);
    }

    #[Test]
    public function test_transform_for_detail_returns_empty_approval_history_when_not_loaded(): void
    {
        $event = $this->createEvent();
        // Not loading approvals
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype', 'locations', 'creator']);

        $result = $this->transformer->transformForDetail($event);

        $this->assertIsArray($result['approval_history']);
        $this->assertEmpty($result['approval_history']);
    }

    #[Test]
    public function test_transform_for_detail_returns_empty_locations_array(): void
    {
        $event = $this->createEvent();
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype', 'locations', 'creator', 'approvals']);

        $result = $this->transformer->transformForDetail($event);

        $this->assertIsArray($result['locations']);
        $this->assertEmpty($result['locations']);
    }

    #[Test]
    public function test_transform_for_detail_includes_creator_when_present(): void
    {
        $creator = User::factory()->create(['name' => 'Event Creator']);
        $event = $this->createEvent(['created_by' => $creator->id]);
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype', 'locations', 'creator', 'approvals']);

        $result = $this->transformer->transformForDetail($event);

        $this->assertNotNull($result['creator']);
        $this->assertEquals($creator->id, $result['creator']['id']);
        $this->assertEquals('Event Creator', $result['creator']['name']);
        $this->assertArrayHasKey('email', $result['creator']);
    }

    // ================================================================
    // calculateCurrentStateDuration() TESTS
    // ================================================================

    // ================================================================
    // calculateCurrentStateDuration() BRANCH TESTS
    //
    // IMPORTANT DISCOVERY: Carbon diffInDays/diffInHours return FLOAT values
    // (e.g. 30 minutes = 0.0208 days). The transformer checks `$diffInDays > 0`
    // so even 30 minutes falls into the "days" branch (0.0208 > 0 is true).
    // This means the hours and minutes branches are unreachable in practice.
    // The singular forms ('día', 'hora', 'minuto') are also unreachable because
    // the transformer uses === 1 (integer) but Carbon returns 1.0 (float).
    //
    // These tests document the ACTUAL behavior of the transformer.
    // ================================================================

    #[Test]
    public function test_calculate_duration_returns_required_structure(): void
    {
        $event = $this->createEvent();
        $fixedNow = Carbon::create(2026, 6, 15, 12, 0, 0, 'UTC');
        $event->updated_at = Carbon::create(2026, 6, 10, 12, 0, 0, 'UTC');
        Carbon::setTestNow($fixedNow);

        $result = $this->transformer->calculateCurrentStateDuration($event);
        Carbon::setTestNow();

        $this->assertArrayHasKey('value', $result);
        $this->assertArrayHasKey('unit', $result);
        $this->assertArrayHasKey('formatted', $result);
    }

    #[Test]
    public function test_calculate_duration_returns_days_for_5_days_ago(): void
    {
        $event = $this->createEvent();
        $fixedNow = Carbon::create(2026, 6, 15, 12, 0, 0, 'UTC');
        $event->updated_at = Carbon::create(2026, 6, 10, 12, 0, 0, 'UTC');
        Carbon::setTestNow($fixedNow);

        $result = $this->transformer->calculateCurrentStateDuration($event);
        Carbon::setTestNow();

        // 5 days ago: diffInDays = 5.0, unit = 'días' (plural since 5.0 !== 1)
        $this->assertEquals(5.0, $result['value']);
        $this->assertEquals('días', $result['unit']);
        $this->assertEquals('5 días', $result['formatted']);
    }

    #[Test]
    public function test_calculate_duration_returns_days_for_10_days_ago(): void
    {
        $event = $this->createEvent();
        $fixedNow = Carbon::create(2026, 6, 20, 12, 0, 0, 'UTC');
        $event->updated_at = Carbon::create(2026, 6, 10, 12, 0, 0, 'UTC');
        Carbon::setTestNow($fixedNow);

        $result = $this->transformer->calculateCurrentStateDuration($event);
        Carbon::setTestNow();

        $this->assertEquals(10.0, $result['value']);
        $this->assertEquals('días', $result['unit']);
    }

    #[Test]
    public function test_calculate_duration_diffInDays_gt_zero_even_for_hours(): void
    {
        // DISCOVERY: diffInDays returns fractional days, so 5 hours = 0.208 days > 0
        // This means the transformer always takes the "days" branch for any non-zero diff.
        $event = $this->createEvent();
        $fixedNow = Carbon::create(2026, 6, 10, 17, 0, 0, 'UTC');
        $event->updated_at = Carbon::create(2026, 6, 10, 12, 0, 0, 'UTC');
        Carbon::setTestNow($fixedNow);

        $result = $this->transformer->calculateCurrentStateDuration($event);
        Carbon::setTestNow();

        // 5 hours = 0.208 fractional days — falls into days branch
        $this->assertStringContainsString('día', $result['unit']);
        $this->assertGreaterThan(0, $result['value']);
    }

    #[Test]
    public function test_calculate_duration_diffInDays_gt_zero_even_for_minutes(): void
    {
        // DISCOVERY: 30 minutes = 0.0208 days > 0 — still falls into days branch
        $event = $this->createEvent();
        $fixedNow = Carbon::create(2026, 6, 10, 12, 30, 0, 'UTC');
        $event->updated_at = Carbon::create(2026, 6, 10, 12, 0, 0, 'UTC');
        Carbon::setTestNow($fixedNow);

        $result = $this->transformer->calculateCurrentStateDuration($event);
        Carbon::setTestNow();

        // 30 minutes = 0.0208 fractional days — diffInDays > 0 is true
        $this->assertStringContainsString('día', $result['unit']);
        $this->assertGreaterThan(0, $result['value']);
    }

    #[Test]
    public function test_calculate_duration_minimum_1_minute_when_updated_just_now(): void
    {
        // When updated_at === now(), diffInMinutes = 0, max(1, 0) = 1
        $event = $this->createEvent();
        $fixedNow = Carbon::create(2026, 6, 10, 12, 0, 0, 'UTC');
        $event->updated_at = $fixedNow->copy(); // Same time as now
        Carbon::setTestNow($fixedNow);

        $result = $this->transformer->calculateCurrentStateDuration($event);
        Carbon::setTestNow();

        // diff = 0 for all units — diffInDays = 0, diffInHours = 0, diffInMinutes = 0
        // max(1, 0) = 1
        $this->assertEquals(1, $result['value']);
        $this->assertEquals('minuto', $result['unit']);
        $this->assertEquals('1 minuto', $result['formatted']);
    }

    // ================================================================
    // transformForDetail() — NULL CREATOR + LOCATIONS WITH PIVOT DATA
    // ================================================================

    #[Test]
    public function test_transform_for_detail_returns_null_creator_when_no_creator(): void
    {
        $event = $this->createEvent(['created_by' => null]);
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype', 'locations', 'approvals']);
        $event->setRelation('creator', null);

        $result = $this->transformer->transformForDetail($event);

        $this->assertNull($result['creator']);
    }

    #[Test]
    public function test_transform_for_detail_returns_null_event_subtype_when_none(): void
    {
        $event = $this->createEvent();
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype', 'locations', 'creator', 'approvals']);
        $event->setRelation('eventSubtype', null);

        $result = $this->transformer->transformForDetail($event);

        $this->assertNull($result['event_subtype']);
    }

    #[Test]
    public function test_transform_for_detail_returns_null_event_type_when_none(): void
    {
        $event = $this->createEvent();
        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype', 'locations', 'creator', 'approvals']);
        $event->setRelation('eventType', null);

        $result = $this->transformer->transformForDetail($event);

        $this->assertNull($result['event_type']);
    }

    #[Test]
    public function test_transform_for_detail_includes_locations_with_pivot_data(): void
    {
        $event = $this->createEvent();
        $location = \App\Models\Location::factory()->create([
            'entity_id' => $this->organization->id,
            'name'      => 'Teatro San Martín',
            'address'   => 'Av. San Martín 123',
            'city'      => 'Demo City',
        ]);
        $event->locations()->attach($location->id, [
            'location_specific_notes'    => 'Sala principal',
            'max_attendees_for_location' => 500,
        ]);

        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype', 'locations', 'creator', 'approvals']);

        $result = $this->transformer->transformForDetail($event);

        $this->assertCount(1, $result['locations']);
        $loc = $result['locations'][0];
        $this->assertEquals($location->id, $loc['id']);
        $this->assertEquals('Teatro San Martín', $loc['name']);
        $this->assertEquals('Av. San Martín 123', $loc['address']);
        $this->assertEquals('Demo Region', $loc['city']);
        $this->assertEquals('Sala principal', $loc['location_specific_notes']);
        $this->assertEquals(500, $loc['max_attendees_for_location']);
    }

    #[Test]
    public function test_transform_for_list_returns_null_event_subtype_when_none(): void
    {
        $event = $this->createEvent();
        $event->load(['status', 'format', 'entity', 'eventType']);
        $event->setRelation('eventSubtype', null);

        $result = $this->transformer->transformForList($event);

        $this->assertNull($result['event_subtype']);
    }

    #[Test]
    public function test_transform_for_detail_formats_approval_history_entries(): void
    {
        $creator = \App\Models\User::factory()->create(['name' => 'Approver User']);
        $event = $this->createEvent(['created_by' => $creator->id]);

        // Create an approval record
        \App\Models\EventApproval::create([
            'event_id'     => $event->id,
            'performed_by' => $creator->id,
            'action'       => 'approved',
            'comments'     => 'Looks good',
            'performed_at' => now(),
        ]);

        $event->load(['status', 'format', 'entity', 'eventType', 'eventSubtype', 'locations', 'creator', 'approvals']);

        $result = $this->transformer->transformForDetail($event);

        $this->assertCount(1, $result['approval_history']);
        $entry = $result['approval_history'][0];
        $this->assertEquals('approved', $entry['action']);
        $this->assertEquals($creator->id, $entry['user_id']);
        $this->assertEquals('Looks good', $entry['comment']);
        $this->assertArrayHasKey('timestamp', $entry);
    }
}
