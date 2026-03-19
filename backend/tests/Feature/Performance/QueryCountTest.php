<?php

namespace Tests\Feature\Performance;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventType;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\Concerns\AssertsQueryCount;
use Tests\TestCase;

/**
 * Query count tests for critical endpoints.
 *
 * These tests verify that query counts remain constant regardless of
 * how many records exist — proving no N+1 queries.
 *
 * Strategy: seed N records, assert max M queries.
 * If someone introduces an N+1, query count grows with N and fails.
 */
class QueryCountTest extends TestCase
{
    use AssertsQueryCount, RefreshDatabase;

    private Organization $organization;

    private EventStatus $publishedStatus;

    private EventType $eventType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);

        $this->organization = Organization::factory()->create();
        $this->publishedStatus = EventStatus::where('status_code', 'published')->first();
        $this->eventType = EventType::factory()->create([
            'entity_id' => $this->organization->id,
        ]);
    }

    private function seedPublishedEvents(int $count): void
    {
        Event::factory()->count($count)->create([
            'entity_id' => $this->organization->id,
            'organization_id' => $this->organization->id,
            'status_id' => $this->publishedStatus->id,
            'event_type_id' => $this->eventType->id,
            'start_date' => now()->addDays(rand(1, 30)),
            'end_date' => now()->addDays(rand(31, 60)),
        ]);
    }

    private function authenticateAsEntityAdmin(): User
    {
        $user = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'entity_admin')->first()->id,
        ]);
        $user->organizations()->attach($this->organization->id);
        $this->actingAs($user, 'sanctum');

        return $user;
    }

    #[Test]
    public function public_events_index_has_constant_query_count(): void
    {
        $this->seedPublishedEvents(20);

        // Public endpoint: no auth overhead, just event listing with relations.
        // Queries: events paginate + eager loads (status, eventType, eventSubtype, locations, etc.)
        $this->assertMaxQueries(10, function () {
            $this->getJson('/api/v1/public/events')
                ->assertOk();
        });
    }

    #[Test]
    public function admin_events_index_has_constant_query_count(): void
    {
        $this->authenticateAsEntityAdmin();
        $this->seedPublishedEvents(20);

        // Admin endpoint: auth + TenantScope + event listing with relations + meta
        $this->assertMaxQueries(15, function () {
            $this->getJson('/api/v1/events')
                ->assertOk();
        });
    }

    #[Test]
    public function internal_calendar_has_constant_query_count(): void
    {
        $this->authenticateAsEntityAdmin();

        // Create events with approved_internal status for internal calendar
        $approvedStatus = EventStatus::where('status_code', 'approved_internal')->first();
        if ($approvedStatus) {
            Event::factory()->count(20)->create([
                'entity_id' => $this->organization->id,
                'organization_id' => $this->organization->id,
                'status_id' => $approvedStatus->id,
                'event_type_id' => $this->eventType->id,
                'start_date' => now()->addDays(rand(1, 30)),
                'end_date' => now()->addDays(rand(31, 60)),
            ]);
        }

        // Higher budget: auth + TenantScope + eager loads + format/status lookups
        $this->assertMaxQueries(20, function () {
            $this->getJson('/api/v1/internal-calendar/events')
                ->assertOk();
        });
    }

    #[Test]
    public function query_count_does_not_grow_with_record_count(): void
    {
        // This is the definitive N+1 test:
        // Run the same endpoint with 5 records and 20 records.
        // Query count must be the same (or very close).

        $this->seedPublishedEvents(5);

        $queriesWithFew = 0;
        $this->assertMaxQueries(100, function () use (&$queriesWithFew) {
            // Count queries for 5 records (excluding cache infrastructure queries)
            $queries = collect();
            \Illuminate\Support\Facades\DB::listen(function ($q) use ($queries) {
                if (! str_contains($q->sql, '"cache"')) {
                    $queries->push($q->sql);
                }
            });

            $this->getJson('/api/v1/public/events')->assertOk();

            $queriesWithFew = $queries->count();
        });

        // Add 15 more records (total 20)
        $this->seedPublishedEvents(15);

        $queriesWithMany = 0;
        $this->assertMaxQueries(100, function () use (&$queriesWithMany) {
            $queries = collect();
            \Illuminate\Support\Facades\DB::listen(function ($q) use ($queries) {
                if (! str_contains($q->sql, '"cache"')) {
                    $queries->push($q->sql);
                }
            });

            $this->getJson('/api/v1/public/events')->assertOk();

            $queriesWithMany = $queries->count();
        });

        // Query count should be identical (no N+1 growth)
        $this->assertEquals(
            $queriesWithFew,
            $queriesWithMany,
            "Query count grew from {$queriesWithFew} (5 records) to {$queriesWithMany} (20 records) — likely N+1",
        );
    }
}
