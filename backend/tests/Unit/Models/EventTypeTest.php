<?php

namespace Tests\Unit\Models;

use App\Models\Event;
use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Organization;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * EventType Model Tests
 *
 * Tests for EventType model relationships, scopes, and soft deletes.
 */
class EventTypeTest extends TestCase
{
    use RefreshDatabase;

    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserRolesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
        $this->seed(EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\EventLookupSeeder::class);

        $this->organization = Organization::factory()->primaryEntity()->create();
    }

    private function createEventType(array $attributes = []): EventType
    {
        return EventType::factory()->create(array_merge([
            'entity_id' => $this->organization->id,
            'is_active' => true,
        ], $attributes));
    }

    // ================================================================
    // RELATIONSHIP TESTS
    // ================================================================

    #[Test]
    public function test_organization_relationship(): void
    {
        $eventType = $this->createEventType();

        $this->assertInstanceOf(Organization::class, $eventType->organization);
        $this->assertEquals($this->organization->id, $eventType->organization->id);
    }

    #[Test]
    public function test_subtypes_relationship(): void
    {
        $eventType = $this->createEventType();
        $subtype1 = EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
        ]);
        $subtype2 = EventSubtype::factory()->create([
            'event_type_id' => $eventType->id,
            'entity_id' => $this->organization->id,
        ]);

        $subtypes = $eventType->subtypes;

        $this->assertInstanceOf(Collection::class, $subtypes);
        $this->assertCount(2, $subtypes);
        $this->assertTrue($subtypes->contains($subtype1));
        $this->assertTrue($subtypes->contains($subtype2));
    }

    #[Test]
    public function test_events_relationship_is_has_many(): void
    {
        $eventType = $this->createEventType();

        // Verify the relationship is a HasMany instance (zero events initially)
        $relation = $eventType->events();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $relation);
        $this->assertInstanceOf(Collection::class, $eventType->events);
        $this->assertCount(0, $eventType->events);
    }

    // ================================================================
    // SCOPE TESTS
    // ================================================================

    #[Test]
    public function test_scope_active_returns_only_active_event_types(): void
    {
        $active = $this->createEventType(['is_active' => true, 'name' => 'Active Type']);
        $inactive = $this->createEventType(['is_active' => false, 'name' => 'Inactive Type']);

        // Use withoutGlobalScopes to bypass TenantScope
        $results = EventType::withoutGlobalScopes()
            ->where('entity_id', $this->organization->id)
            ->active()
            ->get();

        $this->assertTrue($results->contains($active));
        $this->assertFalse($results->contains($inactive));
    }

    #[Test]
    public function test_scope_active_excludes_inactive_types(): void
    {
        $this->createEventType(['is_active' => false, 'name' => 'Inactive Only']);

        $results = EventType::withoutGlobalScopes()
            ->where('entity_id', $this->organization->id)
            ->active()
            ->get();

        $this->assertCount(0, $results);
    }

    // ================================================================
    // SOFT DELETE TESTS
    // ================================================================

    #[Test]
    public function test_event_type_can_be_soft_deleted(): void
    {
        $eventType = $this->createEventType();

        $eventType->delete();

        $this->assertSoftDeleted('event_types', ['id' => $eventType->id]);
        $this->assertNotNull(EventType::withoutGlobalScopes()->withTrashed()->find($eventType->id));
    }

    // ================================================================
    // CAST TESTS
    // ================================================================

    #[Test]
    public function test_is_active_cast_to_boolean(): void
    {
        $eventType = $this->createEventType(['is_active' => true]);

        $this->assertIsBool($eventType->is_active);
        $this->assertTrue($eventType->is_active);
    }

    #[Test]
    public function test_fillable_fields(): void
    {
        $eventType = $this->createEventType([
            'name' => 'Test Type',
            'color' => '#ff0000',
            'icon' => 'music',
        ]);

        $this->assertDatabaseHas('event_types', [
            'id' => $eventType->id,
            'name' => 'Test Type',
            'color' => '#ff0000',
            'icon' => 'music',
        ]);
    }

    #[Test]
    public function test_has_tenant_scope_via_booted(): void
    {
        // EventType uses TenantScope — verify global scopes are registered
        $scopes = (new EventType())->getGlobalScopes();

        $this->assertArrayHasKey(\App\Models\Scopes\TenantScope::class, $scopes);
    }
}
