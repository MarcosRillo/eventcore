<?php

namespace Tests\Feature\Events;

use App\Features\Events\Services\EventService;
use App\Models\Event;
use App\Models\EventFormat;
use App\Models\EventStatus;
use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Database\Seeders\EventLookupSeeder;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypeSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EventMassAssignmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(UserRolesSeeder::class);
        $this->seed(EventStatusesSeeder::class);
        $this->seed(EventTypesSeeder::class);
        $this->seed(EventTypeSeeder::class);
        $this->seed(EventLookupSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
    }

    // ===== $fillable protection =====

    #[Test]
    public function fillable_does_not_contain_created_by(): void
    {
        $this->assertNotContains('created_by', (new Event)->getFillable());
    }

    #[Test]
    public function fillable_does_not_contain_approved_by(): void
    {
        $this->assertNotContains('approved_by', (new Event)->getFillable());
    }

    #[Test]
    public function fillable_does_not_contain_approved_at(): void
    {
        $this->assertNotContains('approved_at', (new Event)->getFillable());
    }

    #[Test]
    public function fillable_does_not_contain_published_at(): void
    {
        $this->assertNotContains('published_at', (new Event)->getFillable());
    }

    #[Test]
    public function status_id_remains_in_fillable_for_approval_service(): void
    {
        $this->assertContains('status_id', (new Event)->getFillable());
    }

    // ===== Mass assignment behavior =====

    #[Test]
    public function mass_assignment_ignores_created_by(): void
    {
        $organization = Organization::factory()->create();

        $event = Event::factory()->create([
            'entity_id' => $organization->id,
        ]);

        // Try to mass-update created_by — should be silently ignored
        $event->fill(['created_by' => 99999]);
        $this->assertNotEquals(99999, $event->created_by);
    }

    #[Test]
    public function mass_assignment_ignores_published_at(): void
    {
        $organization = Organization::factory()->create();

        $event = Event::factory()->create([
            'entity_id' => $organization->id,
        ]);

        $event->fill(['published_at' => now()]);
        $this->assertNull($event->published_at);
    }

    // ===== EventService forces draft =====

    #[Test]
    public function event_service_forces_draft_status_on_creation(): void
    {
        $organization = Organization::factory()->create();

        $entityAdmin = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'entity_admin')->first()->id,
        ]);
        $entityAdmin->organizations()->attach($organization->id);

        $location = Location::factory()->create([
            'entity_id' => $organization->id,
        ]);

        // Create event type and subtype directly (EventTypeSeeder needs specific org)
        $eventType = EventType::create([
            'name' => 'Test Type',
            'color' => '#000000',
            'entity_id' => $organization->id,
        ]);
        $eventSubtype = EventSubtype::create([
            'name' => 'Test Subtype',
            'event_type_id' => $eventType->id,
            'entity_id' => $organization->id,
        ]);

        $publishedStatusId = EventStatus::where('status_code', 'published')->first()->id;
        $draftStatusId = EventStatus::where('status_code', 'draft')->first()->id;

        $service = app(EventService::class);

        $data = [
            'title' => 'Test Event - Status Bypass Attempt',
            'description' => 'Testing that status_id is forced to draft',
            'start_date' => now()->addDays(10)->toISOString(),
            'end_date' => now()->addDays(11)->toISOString(),
            'format_id' => EventFormat::first()->id,
            'entity_id' => $organization->id,
            'organization_id' => $organization->id,
            'event_type_id' => $eventType->id,
            'event_subtype_id' => $eventSubtype->id,
            'location_ids' => [$location->id],
            'status_id' => $publishedStatusId, // Attacker tries to inject published status
        ];

        $event = $service->createEvent($data, $entityAdmin);

        $this->assertEquals($draftStatusId, $event->status_id,
            'EventService must force draft status regardless of input');
    }
}
