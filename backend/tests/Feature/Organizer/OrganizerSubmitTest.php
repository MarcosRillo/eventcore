<?php

namespace Tests\Feature\Organizer;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * OrganizerSubmitTest - TDD tests for event submission endpoint
 *
 * Tests the submit endpoint that validates internal fields and
 * transitions event from draft to pending_internal_approval.
 *
 * Updated for 3NF normalized schema (Nov 30, 2025).
 */
class OrganizerSubmitTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Organization $organization;

    private Organization $producerOrg;

    private Location $location;

    private EventStatus $draftStatus;

    private EventStatus $pendingInternalStatus;

    private int $formatId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\EventLookupSeeder::class);

        // Create tourism entity (id=1) that owns shared resources (locations, categories)
        // Required by TenantScope which filters locations to entity_id = 1 for organizers
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

        $this->organization = Organization::factory()->create();
        $this->producerOrg = Organization::factory()->create(['name' => 'Test Producer Org']);
        $this->user = User::factory()->create();
        $this->user->organizations()->attach($this->organization->id);

        // Assign organizer_admin role (required by middleware)
        $organizerRole = \DB::table('user_roles')->where('role_code', 'organizer_admin')->first();
        if ($organizerRole) {
            $this->user->role_id = $organizerRole->id;
            $this->user->save();
        }

        $this->location = Location::factory()->create([
            'entity_id' => $this->organization->id,
            'city' => 'Demo City',
        ]);
        $this->draftStatus = EventStatus::where('status_code', 'draft')->first();
        $this->pendingInternalStatus = EventStatus::where('status_code', 'pending_internal_approval')->first();
        $this->formatId = \DB::table('event_formats')->value('id') ?? 1;
    }

    // ==========================================
    // SUCCESSFUL SUBMISSION TESTS
    // ==========================================

    #[Test]
    public function submit_with_all_internal_fields_changes_status_to_pending(): void
    {
        $event = $this->createCompleteInternalEvent();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/organizer/events/{$event->id}/submit");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Event submitted for review',
                'status' => 'pending_internal_approval',
            ]);

        $event->refresh();
        $this->assertEquals('pending_internal_approval', $event->status->status_code);
    }

    #[Test]
    public function submit_returns_event_data_with_new_status(): void
    {
        $event = $this->createCompleteInternalEvent();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/organizer/events/{$event->id}/submit");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'status',
                'event' => ['id', 'title', 'status'],
            ]);
    }

    // ==========================================
    // VALIDATION FAILURE TESTS
    // ==========================================

    #[Test]
    public function submit_without_edition_number_returns_validation_error(): void
    {
        // edition_number is optional on create but required for submit
        $event = $this->createEventMissingFields(['edition_number']);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/organizer/events/{$event->id}/submit");

        $response->assertStatus(422)
            ->assertJsonStructure(['errors' => ['edition_number']])
            ->assertJsonPath('errors.edition_number', fn ($v) => str_contains($v, 'requerido'));
    }

    #[Test]
    public function submit_without_explicit_producer_succeeds_with_auto_filled_value(): void
    {
        // producer_id is auto-filled with organization_id on creation (Dec 2, 2025)
        // Events created without explicit producer_id should still submit successfully
        $event = $this->createCompleteInternalEvent();

        // Simulate an event where producer_id was set to organization_id (auto-filled behavior)
        $event->producer_id = $this->organization->id;
        $event->save();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/organizer/events/{$event->id}/submit");

        // Should succeed - producer_id is auto-filled, not required to be set by user
        $response->assertStatus(200)
            ->assertJson(['status' => 'pending_internal_approval']);
    }

    #[Test]
    public function submit_without_location_returns_validation_error(): void
    {
        $event = $this->createCompleteInternalEvent();
        $event->locations()->detach();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/organizer/events/{$event->id}/submit");

        $response->assertStatus(422)
            ->assertJsonStructure(['errors' => ['location']]);
    }

    #[Test]
    public function submit_with_missing_edition_number_returns_error(): void
    {
        // Create event missing edition_number (producer_id is auto-filled, not required)
        $event = $this->createEventMissingFields(['edition_number']);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/organizer/events/{$event->id}/submit");

        $response->assertStatus(422)
            ->assertJsonStructure([
                'errors' => ['edition_number'],
            ]);

        $errors = $response->json('errors');
        $this->assertCount(1, $errors);
    }

    // ==========================================
    // STATUS VALIDATION TESTS
    // ==========================================

    #[Test]
    public function cannot_submit_non_draft_event(): void
    {
        $publishedStatus = EventStatus::where('status_code', 'published')->first();
        $event = $this->createCompleteInternalEvent();
        $event->status_id = $publishedStatus->id;
        $event->save();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/organizer/events/{$event->id}/submit");

        // Policy denies submit for non-draft/requires_changes events
        $response->assertStatus(403);
    }

    #[Test]
    public function can_submit_event_with_requires_changes_status(): void
    {
        $requiresChangesStatus = EventStatus::where('status_code', 'requires_changes')->first();
        $event = $this->createCompleteInternalEvent();
        $event->status_id = $requiresChangesStatus->id;
        $event->save();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/organizer/events/{$event->id}/submit");

        $response->assertStatus(200);
        $event->refresh();
        $this->assertEquals('pending_internal_approval', $event->status->status_code);
    }

    // ==========================================
    // AUTHORIZATION TESTS
    // ==========================================

    #[Test]
    public function cannot_submit_event_from_different_organization(): void
    {
        $otherOrg = Organization::factory()->create();
        $event = Event::factory()->create([
            'organization_id' => $otherOrg->id,
            'entity_id' => $otherOrg->id,
            'status_id' => $this->draftStatus->id,
            'format_id' => $this->formatId,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/organizer/events/{$event->id}/submit");

        $response->assertStatus(404);
    }

    #[Test]
    public function unauthenticated_user_cannot_submit(): void
    {
        $event = $this->createCompleteInternalEvent();

        $response = $this->postJson("/api/v1/organizer/events/{$event->id}/submit");

        $response->assertStatus(401);
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    /**
     * Create a complete event with all internal required fields.
     * Updated for 3NF normalized schema.
     */
    private function createCompleteInternalEvent(): Event
    {
        // Create fresh location for each test
        // Note: entity_id = 1 because TenantScope filters locations to entity_id = 1 for organizers
        $location = Location::factory()->create([
            'entity_id' => 1,
            'city' => 'Demo City',
        ]);

        $event = Event::factory()->create([
            'title' => 'Test Event',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(11),
            'format_id' => $this->formatId,
            'edition_number' => '5ta Edición',
            'producer_id' => $this->producerOrg->id,
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
        ]);

        // Attach location relation (required for internal approval)
        $event->locations()->attach($location->id);

        // Refresh to ensure location relation is loaded
        return $event->fresh(['locations']);
    }

    /**
     * Create event with specific nullable fields set to null.
     * Updated for 3NF normalized schema.
     */
    private function createEventMissingFields(array $nullFields): Event
    {
        // Create fresh location for each test
        // Note: entity_id = 1 because TenantScope filters locations to entity_id = 1 for organizers
        $location = Location::factory()->create([
            'entity_id' => 1,
            'city' => 'Demo City',
        ]);

        $data = [
            'title' => 'Test Event',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(11),
            'format_id' => $this->formatId,
            'edition_number' => '5ta Edición',
            'producer_id' => $this->producerOrg->id,
            'organization_id' => $this->organization->id,
            'entity_id' => $this->organization->id,
            'status_id' => $this->draftStatus->id,
        ];

        // Set specified fields to null
        foreach ($nullFields as $field) {
            $data[$field] = null;
        }

        $event = Event::factory()->create($data);
        $event->locations()->attach($location->id);

        return $event->fresh(['locations']);
    }
}
