<?php

namespace Tests\Feature\Dashboard;

use App\Models\Event;
use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\Feature\Events\EventTestCase;

/**
 * DashboardService Feature Tests
 *
 * Tests for dashboard API responses, filtering, and pagination.
 * Note: Raw SQL tenant-filtered counts are difficult to test end-to-end
 * due to Sanctum auth + lazy-loading behavior. Tests here focus on
 * API response structure and controller error handling.
 */
class DashboardServiceTest extends EventTestCase
{
    use RefreshDatabase;

    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);
        $this->seed(\Database\Seeders\EventLookupSeeder::class);
        \Illuminate\Support\Facades\Cache::flush();
    }

    /**
     * Create authenticated user with organization pre-attached.
     * Organization is attached BEFORE actingAs to ensure organization_id
     * accessor works correctly when Auth::user() is called in the service.
     */
    protected function authenticateUser(string $role = 'entity_admin'): User
    {
        $roleRecord = UserRole::where('role_code', $role)->first();
        $this->organization = Organization::factory()->create();

        $user = User::factory()->create(['role_id' => $roleRecord->id]);
        $user->organizations()->attach($this->organization->id);

        $this->actingAs($user, 'sanctum');

        return $user;
    }

    private function createDashboardEvent(string $statusCode, array $extra = []): Event
    {
        $formatId = \DB::table('event_formats')->value('id');
        $statusId = $this->getStatusId($statusCode);
        $eventType = EventType::factory()->create(['entity_id' => $this->organization->id]);
        $subtype = EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
        ]);

        return Event::factory()->create(array_merge([
            'entity_id' => $this->organization->id,
            'status_id' => $statusId,
            'format_id' => $formatId,
            'event_type_id' => $eventType->id,
            'event_subtype_id' => $subtype->id,
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(12),
        ], $extra));
    }

    // ================================================================
    // EVENTS SUMMARY — API STRUCTURE TESTS
    // ================================================================

    #[Test]
    public function test_events_summary_returns_correct_structure(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events/summary');

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => ['requiere_accion', 'pendientes', 'publicados', 'historico'],
            'message',
        ]);
    }

    #[Test]
    public function test_events_summary_returns_integer_values(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events/summary');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertIsInt($data['requiere_accion']);
        $this->assertIsInt($data['pendientes']);
        $this->assertIsInt($data['publicados']);
        $this->assertIsInt($data['historico']);
    }

    #[Test]
    public function test_events_summary_returns_success_true(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events/summary');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Events summary retrieved successfully');
    }

    #[Test]
    public function test_events_summary_entity_staff_can_access(): void
    {
        $this->authenticateUser('entity_staff');

        $response = $this->getJson('/api/v1/dashboard/events/summary');

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => ['requiere_accion', 'pendientes', 'publicados', 'historico'],
        ]);
    }

    // ================================================================
    // EVENTS LIST — TAB FILTER STRUCTURE TESTS
    // ================================================================

    #[Test]
    public function test_events_list_default_tab_returns_data_and_pagination(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events');

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data',
            'pagination' => [
                'current_page',
                'per_page',
                'total',
                'last_page',
                'from',
                'to',
            ],
            'message',
        ]);
    }

    #[Test]
    public function test_events_list_requires_action_tab_accepted(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events?tab=requires-action');

        $response->assertOk();
        $response->assertJsonPath('success', true);
    }

    #[Test]
    public function test_events_list_pending_tab_accepted(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events?tab=pending');

        $response->assertOk();
        $response->assertJsonPath('success', true);
    }

    #[Test]
    public function test_events_list_published_tab_accepted(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events?tab=published');

        $response->assertOk();
        $response->assertJsonPath('success', true);
    }

    #[Test]
    public function test_events_list_all_tab_accepted(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events?tab=all');

        $response->assertOk();
        $response->assertJsonPath('success', true);
    }

    #[Test]
    public function test_events_list_approved_tab_accepted(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events?tab=approved');

        $response->assertOk();
        $response->assertJsonPath('success', true);
    }

    #[Test]
    public function test_events_list_rejected_tab_accepted(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events?tab=rejected');

        $response->assertOk();
        $response->assertJsonPath('success', true);
    }

    #[Test]
    public function test_events_list_invalid_tab_returns_422(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events?tab=invalid-tab');

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['tab']);
    }

    #[Test]
    public function test_events_list_with_search_param_accepted(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events?tab=pending&search=festival');

        $response->assertOk();
    }

    #[Test]
    public function test_events_list_pagination_page_1_returns_correct_structure(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events?page=1');

        $response->assertOk();
        $response->assertJsonPath('pagination.current_page', 1);
    }

    // ================================================================
    // EVENT DETAIL TESTS
    // ================================================================

    #[Test]
    public function test_event_detail_returns_full_structure_for_existing_event(): void
    {
        $user = $this->authenticateUser('entity_admin');
        $event = $this->createDashboardEvent('draft', ['created_by' => $user->id]);

        $response = $this->getJson("/api/v1/events/{$event->id}/detail");

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                'id',
                'title',
                'description',
                'start_date',
                'end_date',
                'status',
                'format',
                'entity',
                'event_type',
                'locations',
                'approval_history',
                'creator',
                'current_state_duration',
                'is_happening',
                'has_ended',
                'is_upcoming',
                'has_multiple_locations',
                'has_cta',
                'is_in_approval_workflow',
            ],
            'message',
        ]);
    }

    #[Test]
    public function test_event_detail_returns_404_for_nonexistent_event(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/events/999999/detail');

        $response->assertNotFound();
        $response->assertJsonPath('success', false);
    }

    #[Test]
    public function test_event_detail_includes_creator_info_when_creator_exists(): void
    {
        $user = $this->authenticateUser('entity_admin');
        $event = $this->createDashboardEvent('draft', ['created_by' => $user->id]);

        $response = $this->getJson("/api/v1/events/{$event->id}/detail");

        $response->assertOk();
        $creatorData = $response->json('data.creator');
        $this->assertNotNull($creatorData);
        $this->assertEquals($user->id, $creatorData['id']);
        $this->assertArrayHasKey('name', $creatorData);
        $this->assertArrayHasKey('email', $creatorData);
    }

    #[Test]
    public function test_event_detail_includes_empty_locations_array(): void
    {
        $user = $this->authenticateUser('entity_admin');
        $event = $this->createDashboardEvent('draft', ['created_by' => $user->id]);

        $response = $this->getJson("/api/v1/events/{$event->id}/detail");

        $response->assertOk();
        $locations = $response->json('data.locations');
        $this->assertIsArray($locations);
    }

    #[Test]
    public function test_event_detail_includes_approval_history_array(): void
    {
        $user = $this->authenticateUser('entity_admin');
        $event = $this->createDashboardEvent('draft', ['created_by' => $user->id]);

        $response = $this->getJson("/api/v1/events/{$event->id}/detail");

        $response->assertOk();
        $history = $response->json('data.approval_history');
        $this->assertIsArray($history);
    }

    #[Test]
    public function test_event_detail_includes_computed_boolean_fields(): void
    {
        $user = $this->authenticateUser('entity_admin');
        $event = $this->createDashboardEvent('draft', ['created_by' => $user->id]);

        $response = $this->getJson("/api/v1/events/{$event->id}/detail");

        $response->assertOk();
        $data = $response->json('data');
        $this->assertIsBool($data['is_happening']);
        $this->assertIsBool($data['has_ended']);
        $this->assertIsBool($data['is_upcoming']);
        $this->assertIsBool($data['has_multiple_locations']);
        $this->assertIsBool($data['has_cta']);
        $this->assertIsBool($data['is_in_approval_workflow']);
    }

    #[Test]
    public function test_event_detail_status_includes_description(): void
    {
        $user = $this->authenticateUser('entity_admin');
        $event = $this->createDashboardEvent('draft', ['created_by' => $user->id]);

        $response = $this->getJson("/api/v1/events/{$event->id}/detail");

        $response->assertOk();
        $status = $response->json('data.status');
        $this->assertArrayHasKey('description', $status);
    }

    #[Test]
    public function test_event_detail_entity_includes_contact_fields(): void
    {
        $user = $this->authenticateUser('entity_admin');
        $event = $this->createDashboardEvent('draft', ['created_by' => $user->id]);

        $response = $this->getJson("/api/v1/events/{$event->id}/detail");

        $response->assertOk();
        $entity = $response->json('data.entity');
        $this->assertArrayHasKey('email', $entity);
        $this->assertArrayHasKey('phone', $entity);
    }

    #[Test]
    public function test_events_list_success_message_present(): void
    {
        $this->authenticateUser('entity_admin');

        $response = $this->getJson('/api/v1/dashboard/events');

        $response->assertOk()
            ->assertJsonPath('message', 'Events retrieved successfully');
    }

    // ================================================================
    // HISTORIC TAB — applyOrdering branch + applyTabFilter branch
    // These call DashboardService directly since 'historic' is not a
    // valid API tab value (blocked by IndexDashboardEventsRequest validation).
    // ================================================================

    #[Test]
    public function test_service_historic_tab_returns_past_events(): void
    {
        $user = $this->authenticateUser('entity_admin');

        // Create a past event (end_date in past) to exercise historic tab filter
        $this->createDashboardEvent('draft', [
            'created_by' => $user->id,
            'start_date' => now()->subDays(20),
            'end_date'   => now()->subDays(10),
        ]);

        /** @var \App\Features\Dashboard\Services\DashboardService $service */
        $service = app(\App\Features\Dashboard\Services\DashboardService::class);
        $result = $service->getFilteredEvents('historic', 1, '', 20);

        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('pagination', $result);
        $this->assertGreaterThanOrEqual(1, count($result['data']));
    }

    #[Test]
    public function test_service_historic_tab_orders_by_updated_at_desc(): void
    {
        $user = $this->authenticateUser('entity_admin');

        // Create two past events with different updated_at
        $older = $this->createDashboardEvent('draft', [
            'created_by' => $user->id,
            'start_date' => now()->subDays(30),
            'end_date'   => now()->subDays(20),
        ]);
        $older->updated_at = now()->subDays(15);
        $older->saveQuietly();

        $newer = $this->createDashboardEvent('draft', [
            'created_by' => $user->id,
            'start_date' => now()->subDays(25),
            'end_date'   => now()->subDays(15),
        ]);
        $newer->updated_at = now()->subDays(5);
        $newer->saveQuietly();

        /** @var \App\Features\Dashboard\Services\DashboardService $service */
        $service = app(\App\Features\Dashboard\Services\DashboardService::class);
        $result = $service->getFilteredEvents('historic', 1, '', 20);

        $data = $result['data'];
        $this->assertGreaterThanOrEqual(2, count($data));
        // Most recently updated appears first (updated_at desc)
        $this->assertEquals($newer->id, $data[0]['id']);
    }

    #[Test]
    public function test_service_historic_tab_includes_rejected_future_events(): void
    {
        $user = $this->authenticateUser('entity_admin');

        // Rejected event with future dates — still counts as historic due to status
        $rejected = $this->createDashboardEvent('rejected', [
            'created_by' => $user->id,
            'start_date' => now()->addDays(5),
            'end_date'   => now()->addDays(10),
        ]);

        /** @var \App\Features\Dashboard\Services\DashboardService $service */
        $service = app(\App\Features\Dashboard\Services\DashboardService::class);
        $result = $service->getFilteredEvents('historic', 1, '', 20);

        $ids = array_column($result['data'], 'id');
        $this->assertContains($rejected->id, $ids);
    }

    #[Test]
    public function test_events_list_requires_action_tab_filters_non_past_events(): void
    {
        $user = $this->authenticateUser('entity_admin');

        // Future pending event — should appear in requires-action
        $this->createDashboardEvent('pending_internal_approval', [
            'created_by' => $user->id,
            'start_date' => now()->addDays(5),
            'end_date'   => now()->addDays(10),
        ]);

        $response = $this->getJson('/api/v1/dashboard/events?tab=requires-action');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, count($data));
    }

    #[Test]
    public function test_events_list_pending_tab_filters_non_past_events(): void
    {
        $user = $this->authenticateUser('entity_admin');

        $this->createDashboardEvent('approved_internal', [
            'created_by' => $user->id,
            'start_date' => now()->addDays(5),
            'end_date'   => now()->addDays(10),
        ]);

        $response = $this->getJson('/api/v1/dashboard/events?tab=pending');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, count($data));
    }

    #[Test]
    public function test_events_list_published_tab_filters_non_past_events(): void
    {
        $user = $this->authenticateUser('entity_admin');

        $this->createDashboardEvent('published', [
            'created_by' => $user->id,
            'start_date' => now()->addDays(5),
            'end_date'   => now()->addDays(10),
        ]);

        $response = $this->getJson('/api/v1/dashboard/events?tab=published');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, count($data));
    }

    #[Test]
    public function test_events_list_search_filters_by_title(): void
    {
        $user = $this->authenticateUser('entity_admin');

        $matching = $this->createDashboardEvent('approved_internal', [
            'created_by' => $user->id,
            'title'      => 'Festival de Tango Especial XUniqueX',
        ]);
        $this->createDashboardEvent('approved_internal', [
            'created_by' => $user->id,
            'title'      => 'Exposición de Arte',
        ]);

        $response = $this->getJson('/api/v1/dashboard/events?tab=pending&search=XUniqueX');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals($matching->id, $data[0]['id']);
    }

    #[Test]
    public function test_events_summary_counts_are_correct_for_entity_admin(): void
    {
        $user = $this->authenticateUser('entity_admin');

        // Create one event per category
        $this->createDashboardEvent('pending_internal_approval', ['created_by' => $user->id]);
        $this->createDashboardEvent('approved_internal', ['created_by' => $user->id]);
        $this->createDashboardEvent('published', ['created_by' => $user->id]);
        // Historic: past event
        $this->createDashboardEvent('draft', [
            'created_by' => $user->id,
            'start_date' => now()->subDays(20),
            'end_date'   => now()->subDays(10),
        ]);

        $response = $this->getJson('/api/v1/dashboard/events/summary');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, $data['requiere_accion']);
        $this->assertGreaterThanOrEqual(1, $data['pendientes']);
        $this->assertGreaterThanOrEqual(1, $data['publicados']);
        $this->assertGreaterThanOrEqual(1, $data['historico']);
    }

    #[Test]
    public function test_events_list_pagination_second_page(): void
    {
        $user = $this->authenticateUser('entity_admin');

        // Create 6 future draft events so page 2 has entries with per_page=5
        for ($i = 0; $i < 6; $i++) {
            $this->createDashboardEvent('draft', ['created_by' => $user->id]);
        }

        $response = $this->getJson('/api/v1/dashboard/events?page=2&per_page=5');

        $response->assertOk();
        $response->assertJsonPath('pagination.current_page', 2);
    }
}
