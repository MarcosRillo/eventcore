<?php

namespace Tests\Feature\Events;

use App\Features\Events\Services\EventService;
use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\EventLookupSeeder;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * EventSanitizationTest
 *
 * Tests for triple-layer XSS defense:
 * - CAPA 1: FormRequest (prepareForValidation)
 * - CAPA 2: EventService (sanitizeDescription)
 * - CAPA 3: Frontend (DOMPurify - tested separately)
 *
 * Created: Dec 18, 2025 (Sprint 3 - Security Audit)
 */
class EventSanitizationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private EventStatus $draftStatus;

    private object $format;  // stdClass from DB table

    private EventType $eventType;

    private EventSubtype $eventSubtype;

    private Location $location;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed lookup tables
        $this->seed(UserRolesSeeder::class);
        $this->seed(EventStatusesSeeder::class);
        $this->seed(EventTypesSeeder::class);  // Seeds event_formats
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
        $this->seed(EventLookupSeeder::class);  // Seeds event types, subtypes, etc.

        // Create organization
        $organization = Organization::factory()->create();

        // Create user with organization
        $this->user = User::factory()->create();
        $this->user->organizations()->attach($organization->id);

        // Get required related models from seeded data
        $this->draftStatus = EventStatus::where('status_code', 'draft')->first();
        $this->format = \DB::table('event_formats')->first();

        // Create EventType and EventSubtype for the organization
        $this->eventType = EventType::create([
            'name' => 'Test Event Type',
            'entity_id' => $organization->id,
        ]);
        $this->eventSubtype = EventSubtype::create([
            'name' => 'Test Subtype',
            'event_type_id' => $this->eventType->id,
            'entity_id' => $organization->id,
        ]);

        $this->location = Location::factory()->create([
            'entity_id' => $organization->id,
        ]);
    }

    /**
     * Test CAPA 1 + CAPA 2: Sanitizes malicious JavaScript from description via API.
     *
     * This tests that both FormRequest (CAPA 1) and EventService (CAPA 2) work together.
     */
    public function test_sanitizes_malicious_javascript_from_description_via_api(): void
    {
        $maliciousDescription = 'Normal text <script>alert("XSS")</script> more text';

        $organization = $this->user->organizations()->first();

        $response = $this->actingAs($this->user)->postJson('/api/v1/events', [
            'title' => 'Test Event',
            'description' => $maliciousDescription,
            'start_date' => now()->addDays(1)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(1)->addHours(2)->format('Y-m-d H:i:s'),
            'status_id' => $this->draftStatus->id,
            'format_id' => $this->format->id,
            'event_type_id' => $this->eventType->id,
            'event_subtype_id' => $this->eventSubtype->id,
            'location_ids' => [$this->location->id],
            'entity_id' => $organization->id,
        ]);

        $response->assertStatus(201);

        $event = Event::latest()->first();

        // Verify that <script> was removed (both layers worked)
        $this->assertStringNotContainsString('<script>', $event->description);
        $this->assertStringNotContainsString('alert', $event->description);

        // Verify that normal text was preserved
        $this->assertStringContainsString('Normal text', $event->description);
        $this->assertStringContainsString('more text', $event->description);
    }

    /**
     * Test CAPA 2: Service layer sanitizes description independently.
     *
     * This simulates a bypass of FormRequest to ensure Service layer protects independently.
     */
    public function test_service_layer_sanitizes_description_independently(): void
    {
        $eventService = app(EventService::class);

        $maliciousData = [
            'title' => 'Test Event',
            'description' => 'Text <script>evil()</script> more',
            'start_date' => now()->addDays(1)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(1)->addHours(2)->format('Y-m-d H:i:s'),
            'status_id' => $this->draftStatus->id,
            'format_id' => $this->format->id,
            'event_type_id' => $this->eventType->id,
            'event_subtype_id' => $this->eventSubtype->id,
            'location_ids' => [$this->location->id],
        ];

        // Call Service directly (bypasses FormRequest)
        $event = $eventService->createEvent($maliciousData, $this->user);

        // Verify that Service sanitized independently
        $this->assertStringNotContainsString('<script>', $event->description);
        $this->assertStringNotContainsString('evil()', $event->description);
        $this->assertStringContainsString('Text', $event->description);

        // Verify database state
        $dbEvent = Event::find($event->id);
        $this->assertNotNull($dbEvent);
        $this->assertStringNotContainsString('<script>', $dbEvent->description);
    }

    /**
     * Test that preserves allowed HTML tags.
     *
     * Safe HTML like <p>, <strong>, <a> should be preserved.
     */
    public function test_preserves_allowed_html_tags(): void
    {
        $safeHtml = '<p>Párrafo con <strong>negrita</strong> y <a href="https://example.com">link</a></p>';

        $organization = $this->user->organizations()->first();

        $response = $this->actingAs($this->user)->postJson('/api/v1/events', [
            'title' => 'Test Event',
            'description' => $safeHtml,
            'start_date' => now()->addDays(1)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(1)->addHours(2)->format('Y-m-d H:i:s'),
            'status_id' => $this->draftStatus->id,
            'format_id' => $this->format->id,
            'event_type_id' => $this->eventType->id,
            'event_subtype_id' => $this->eventSubtype->id,
            'location_ids' => [$this->location->id],
            'entity_id' => $organization->id,
        ]);

        $response->assertStatus(201);

        $event = Event::latest()->first();

        // Verify that safe HTML was preserved
        $this->assertStringContainsString('<p>', $event->description);
        $this->assertStringContainsString('<strong>negrita</strong>', $event->description);
        $this->assertStringContainsString('href="https://example.com"', $event->description);
    }

    /**
     * Test that removes event handlers from allowed tags.
     *
     * Event handlers like onclick, javascript: should be removed even from allowed tags.
     */
    public function test_removes_event_handlers_from_allowed_tags(): void
    {
        $maliciousHtml = '<p onclick="alert(1)">Click me</p><a href="javascript:alert(2)">Link</a>';

        $organization = $this->user->organizations()->first();

        $response = $this->actingAs($this->user)->postJson('/api/v1/events', [
            'title' => 'Test Event',
            'description' => $maliciousHtml,
            'start_date' => now()->addDays(1)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(1)->addHours(2)->format('Y-m-d H:i:s'),
            'status_id' => $this->draftStatus->id,
            'format_id' => $this->format->id,
            'event_type_id' => $this->eventType->id,
            'event_subtype_id' => $this->eventSubtype->id,
            'location_ids' => [$this->location->id],
            'entity_id' => $organization->id,
        ]);

        $response->assertStatus(201);

        $event = Event::latest()->first();

        // Verify that event handlers were removed
        $this->assertStringNotContainsString('onclick', $event->description);
        $this->assertStringNotContainsString('javascript:', $event->description);

        // Verify that safe tags were preserved
        $this->assertStringContainsString('<p>Click me</p>', $event->description);
        // Note: javascript: URLs might be completely stripped, which is even better
    }
}
