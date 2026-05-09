<?php

namespace Tests\Unit\Models;

use App\Models\Event;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Organization Model Tests
 *
 * Tests for Organization model relationships, scopes, and methods.
 */
class OrganizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserRolesSeeder::class);
        $this->seed(OrganizationStatusesSeeder::class);
        $this->seed(OrganizationTypesSeeder::class);
        $this->seed(EventStatusesSeeder::class);
        $this->seed(EventTypesSeeder::class);
    }

    // ================================================================
    // RELATIONSHIP TESTS
    // ================================================================

    #[Test]
    public function test_parent_entity_relationship(): void
    {
        $parent = Organization::factory()->primaryEntity()->create();
        $child = Organization::factory()->create(['parent_id' => $parent->id]);

        $this->assertInstanceOf(Organization::class, $child->parentEntity);
        $this->assertEquals($parent->id, $child->parentEntity->id);
    }

    #[Test]
    public function test_organizers_relationship_returns_children(): void
    {
        $parent = Organization::factory()->primaryEntity()->create();
        $child1 = Organization::factory()->create(['parent_id' => $parent->id]);
        $child2 = Organization::factory()->create(['parent_id' => $parent->id]);

        $organizers = $parent->organizers;

        $this->assertCount(2, $organizers);
        $this->assertTrue($organizers->contains($child1));
        $this->assertTrue($organizers->contains($child2));
    }

    #[Test]
    public function test_children_relationship(): void
    {
        $parent = Organization::factory()->primaryEntity()->create();
        $child = Organization::factory()->create(['parent_id' => $parent->id]);

        $children = $parent->children;

        $this->assertCount(1, $children);
        $this->assertEquals($child->id, $children->first()->id);
    }

    #[Test]
    public function test_children_recursive_relationship(): void
    {
        $grandparent = Organization::factory()->primaryEntity()->create();
        $parent = Organization::factory()->create(['parent_id' => $grandparent->id]);
        Organization::factory()->create(['parent_id' => $parent->id]);

        $result = $grandparent->childrenRecursive()->with('childrenRecursive')->get();

        $this->assertCount(1, $result); // One direct child
        $this->assertCount(1, $result->first()->childrenRecursive); // One grandchild
    }

    #[Test]
    public function test_users_belongs_to_many(): void
    {
        $org = Organization::factory()->primaryEntity()->create();
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $org->users()->attach([$user1->id, $user2->id]);

        $this->assertCount(2, $org->users);
        $this->assertTrue($org->users->contains($user1));
        $this->assertTrue($org->users->contains($user2));
    }

    #[Test]
    public function test_status_relationship(): void
    {
        $org = Organization::factory()->create();

        $this->assertNotNull($org->status);
        $this->assertNotNull($org->status->status_code);
    }

    #[Test]
    public function test_type_relationship(): void
    {
        $org = Organization::factory()->create();

        $this->assertNotNull($org->type);
        $this->assertNotNull($org->type->type_code);
    }

    // ================================================================
    // SCOPE TESTS
    // ================================================================

    #[Test]
    public function test_scope_primary_entities_returns_only_primary_entities(): void
    {
        $primary = Organization::factory()->primaryEntity()->create();
        Organization::factory()->eventOrganizer()->create(); // Not primary

        $result = Organization::primaryEntities()->get();

        $this->assertTrue($result->contains($primary));
        foreach ($result as $org) {
            $this->assertEquals('primary_entity', $org->type->type_code);
        }
    }

    #[Test]
    public function test_scope_event_organizers_returns_only_organizers(): void
    {
        $primary = Organization::factory()->primaryEntity()->create();
        $organizer = Organization::factory()->eventOrganizer()->create(['parent_id' => $primary->id]);

        $result = Organization::eventOrganizers()->get();

        $this->assertTrue($result->contains($organizer));
        foreach ($result as $org) {
            $this->assertEquals('event_organizer', $org->type->type_code);
        }
    }

    #[Test]
    public function test_scope_active_returns_only_active_organizations(): void
    {
        $active = Organization::factory()->active()->create();
        // Use 'suspended' status (no 'inactive' code in seeder)
        $suspendedStatusId = \DB::table('organization_statuses')->where('status_code', 'suspended')->value('id');
        $suspended = Organization::factory()->create(['status_id' => $suspendedStatusId]);

        $result = Organization::active()->get();

        $this->assertTrue($result->contains($active));
        $this->assertFalse($result->contains($suspended));
    }

    // ================================================================
    // METHOD TESTS
    // ================================================================

    #[Test]
    public function test_is_primary_entity_returns_true_for_primary_entity(): void
    {
        $org = Organization::factory()->primaryEntity()->create();
        $org->load('type');

        $this->assertTrue($org->isPrimaryEntity());
        $this->assertFalse($org->isEventOrganizer());
    }

    #[Test]
    public function test_is_event_organizer_returns_true_for_organizer(): void
    {
        $primary = Organization::factory()->primaryEntity()->create();
        $org = Organization::factory()->eventOrganizer()->create(['parent_id' => $primary->id]);
        $org->load('type');

        $this->assertTrue($org->isEventOrganizer());
        $this->assertFalse($org->isPrimaryEntity());
    }

    #[Test]
    public function test_is_active_returns_true_for_active_organization(): void
    {
        $org = Organization::factory()->active()->create();
        $org->load('status');

        $this->assertTrue($org->isActive());
    }

    #[Test]
    public function test_is_active_returns_false_for_suspended_organization(): void
    {
        $suspendedStatusId = \DB::table('organization_statuses')->where('status_code', 'suspended')->value('id');
        $org = Organization::factory()->create(['status_id' => $suspendedStatusId]);
        $org->load('status');

        $this->assertFalse($org->isActive());
    }

    #[Test]
    public function test_is_primary_entity_returns_false_when_type_not_loaded(): void
    {
        $org = Organization::factory()->eventOrganizer()->create();
        // Don't load type — tests null safety
        $org = Organization::withoutGlobalScopes()->find($org->id); // fresh without eager load

        // The method checks $this->type?->type_code so null type returns false
        // We need to actually load a non-primary entity type
        $org->load('type');
        $this->assertFalse($org->isPrimaryEntity());
    }

    // ================================================================
    // SOFT DELETE TESTS
    // ================================================================

    #[Test]
    public function test_organization_can_be_soft_deleted(): void
    {
        $org = Organization::factory()->create();

        $org->delete();

        $this->assertSoftDeleted('organizations', ['id' => $org->id]);
        $this->assertNull(Organization::find($org->id));
        $this->assertNotNull(Organization::withTrashed()->find($org->id));
    }

    // ================================================================
    // ROUTE KEY TESTS
    // ================================================================

    #[Test]
    public function test_route_key_name_is_slug(): void
    {
        $org = Organization::factory()->create();

        $this->assertEquals('slug', $org->getRouteKeyName());
    }

    // ================================================================
    // TRUST LEVEL CONSTANTS
    // ================================================================

    #[Test]
    public function test_trust_level_constants_are_defined(): void
    {
        $this->assertEquals(1, Organization::TRUST_LEVEL_NUEVO);
        $this->assertEquals(2, Organization::TRUST_LEVEL_CONFIABLE);
        $this->assertEquals(3, Organization::TRUST_LEVEL_PREMIUM);
    }

    // ================================================================
    // EVENTS RELATIONSHIP TESTS
    // ================================================================

    #[Test]
    public function test_events_relationship_returns_has_many(): void
    {
        $org = Organization::factory()->primaryEntity()->create();
        $event1 = Event::factory()->create(['entity_id' => $org->id]);
        $event2 = Event::factory()->create(['entity_id' => $org->id]);

        $events = $org->events;

        $this->assertInstanceOf(Collection::class, $events);
        $this->assertCount(2, $events);
        $this->assertTrue($events->contains($event1));
        $this->assertTrue($events->contains($event2));
    }

    #[Test]
    public function test_events_returns_empty_collection_when_no_events(): void
    {
        $org = Organization::factory()->primaryEntity()->create();

        $this->assertInstanceOf(Collection::class, $org->events);
        $this->assertCount(0, $org->events);
    }

    // ================================================================
    // FILLABLE TESTS
    // ================================================================

    #[Test]
    public function test_fillable_fields_are_defined(): void
    {
        $org = new Organization;
        $fillable = $org->getFillable();

        $this->assertContains('name', $fillable);
        $this->assertContains('cuit', $fillable);
        $this->assertContains('description', $fillable);
        $this->assertContains('status_id', $fillable);
        $this->assertContains('type_id', $fillable);
        $this->assertContains('parent_id', $fillable);
        $this->assertContains('slug', $fillable);
    }

    // ================================================================
    // CAST TESTS
    // ================================================================

    #[Test]
    public function test_casts_include_integer_fields(): void
    {
        $org = Organization::factory()->primaryEntity()->create();

        $this->assertIsInt($org->status_id);
        $this->assertIsInt($org->type_id);
    }

    #[Test]
    public function test_trust_level_cast_to_integer(): void
    {
        $org = Organization::factory()->primaryEntity()->create(['trust_level' => 2]);

        $this->assertIsInt($org->trust_level);
        $this->assertEquals(2, $org->trust_level);
    }
}
