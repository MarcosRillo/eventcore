<?php

namespace Tests\Unit\Models;

use App\Models\Event;
use App\Models\Location;
use App\Models\Organization;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Location Model Tests
 *
 * Tests for Location model relationships, scopes, attributes, and methods.
 */
class LocationTest extends TestCase
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
        $this->seed(EventTypesSeeder::class);

        $this->organization = Organization::factory()->primaryEntity()->create();
    }

    private function createLocation(array $attributes = []): Location
    {
        return Location::factory()->create(array_merge([
            'entity_id' => $this->organization->id,
        ], $attributes));
    }

    // ================================================================
    // RELATIONSHIP TESTS
    // ================================================================

    #[Test]
    public function test_entity_relationship_returns_organization(): void
    {
        $location = $this->createLocation();

        $this->assertInstanceOf(Organization::class, $location->entity);
        $this->assertEquals($this->organization->id, $location->entity->id);
    }

    #[Test]
    public function test_events_belongs_to_many(): void
    {
        $location = $this->createLocation();
        $event = Event::factory()->create(['entity_id' => $this->organization->id]);

        $event->locations()->attach($location->id, [
            'location_specific_notes' => 'Test notes',
            'max_attendees_for_location' => 100,
        ]);

        $this->assertCount(1, $location->events);
        $this->assertEquals($event->id, $location->events->first()->id);
    }

    // ================================================================
    // SCOPE TESTS
    // ================================================================

    #[Test]
    public function test_scope_active_returns_only_active_locations(): void
    {
        $active = $this->createLocation(['is_active' => true, 'name' => 'Active Venue']);
        $inactive = $this->createLocation(['is_active' => false, 'name' => 'Inactive Venue']);

        // Use withoutGlobalScopes to bypass TenantScope
        $results = Location::withoutGlobalScopes()->active()->where('entity_id', $this->organization->id)->get();

        $this->assertTrue($results->contains($active));
        $this->assertFalse($results->contains($inactive));
    }

    #[Test]
    public function test_scope_search_filters_by_name(): void
    {
        $this->createLocation(['name' => 'Centro de Convenciones']);
        $this->createLocation(['name' => 'Parque 9 de Julio']);

        $results = Location::withoutGlobalScopes()
            ->where('entity_id', $this->organization->id)
            ->search('Centro')
            ->get();

        $this->assertCount(1, $results);
        $this->assertEquals('Centro de Convenciones', $results->first()->name);
    }

    #[Test]
    public function test_scope_search_filters_by_address(): void
    {
        $this->createLocation(['name' => 'Venue A', 'address' => 'Av. Soldati 330']);
        $this->createLocation(['name' => 'Venue B', 'address' => 'Calle San Martín 100']);

        $results = Location::withoutGlobalScopes()
            ->where('entity_id', $this->organization->id)
            ->search('Soldati')
            ->get();

        $this->assertCount(1, $results);
        $this->assertEquals('Venue A', $results->first()->name);
    }

    #[Test]
    public function test_scope_search_filters_by_city(): void
    {
        $this->createLocation(['name' => 'Venue A', 'city' => 'Demo City']);
        $this->createLocation(['name' => 'Venue B', 'city' => 'Buenos Aires']);

        $results = Location::withoutGlobalScopes()
            ->where('entity_id', $this->organization->id)
            ->search('Demo City')
            ->get();

        $this->assertCount(1, $results);
        $this->assertEquals('Venue A', $results->first()->name);
    }

    // ================================================================
    // ACCESSOR TESTS
    // ================================================================

    #[Test]
    public function test_full_address_with_all_parts(): void
    {
        $location = $this->createLocation([
            'address' => 'Av. Soldati 330',
            'city' => 'Demo City',
            'state' => 'Demo State',
            'postal_code' => '4000',
            'country' => 'Argentina',
        ]);

        $fullAddress = $location->full_address;

        $this->assertStringContainsString('Av. Soldati 330', $fullAddress);
        $this->assertStringContainsString('Demo City', $fullAddress);
        $this->assertStringContainsString('Argentina', $fullAddress);
    }

    #[Test]
    public function test_full_address_with_partial_parts(): void
    {
        $location = $this->createLocation([
            'address' => 'Av. Soldati 330',
            'city' => 'Demo City',
            'state' => null,
            'postal_code' => null,
            'country' => null,
        ]);

        $fullAddress = $location->full_address;

        $this->assertEquals('Av. Soldati 330, Demo Region', $fullAddress);
    }

    #[Test]
    public function test_full_address_returns_null_when_all_parts_empty(): void
    {
        $location = $this->createLocation([
            'address' => null,
            'city' => null,
            'state' => null,
            'postal_code' => null,
            'country' => null,
        ]);

        $this->assertNull($location->full_address);
    }

    // ================================================================
    // hasCoordinates() TESTS
    // ================================================================

    #[Test]
    public function test_has_coordinates_returns_true_when_both_lat_lng_set(): void
    {
        $location = $this->createLocation([
            'latitude' => '-26.8241',
            'longitude' => '-65.2226',
        ]);

        $this->assertTrue($location->hasCoordinates());
    }

    #[Test]
    public function test_has_coordinates_returns_false_when_latitude_is_null(): void
    {
        $location = $this->createLocation([
            'latitude' => null,
            'longitude' => '-65.2226',
        ]);

        $this->assertFalse($location->hasCoordinates());
    }

    #[Test]
    public function test_has_coordinates_returns_false_when_longitude_is_null(): void
    {
        $location = $this->createLocation([
            'latitude' => '-26.8241',
            'longitude' => null,
        ]);

        $this->assertFalse($location->hasCoordinates());
    }

    #[Test]
    public function test_has_coordinates_returns_false_when_both_null(): void
    {
        $location = $this->createLocation([
            'latitude' => null,
            'longitude' => null,
        ]);

        $this->assertFalse($location->hasCoordinates());
    }

    // ================================================================
    // CAST TESTS
    // ================================================================

    #[Test]
    public function test_is_active_cast_to_boolean(): void
    {
        $location = $this->createLocation(['is_active' => true]);

        $this->assertIsBool($location->is_active);
        $this->assertTrue($location->is_active);
    }

    #[Test]
    public function test_additional_info_cast_to_array(): void
    {
        $info = ['key' => 'value', 'notes' => 'Extra notes'];
        $location = $this->createLocation(['additional_info' => $info]);

        $this->assertIsArray($location->additional_info);
        $this->assertEquals('value', $location->additional_info['key']);
    }

    // ================================================================
    // SOFT DELETE TESTS
    // ================================================================

    #[Test]
    public function test_location_can_be_soft_deleted(): void
    {
        $location = $this->createLocation();

        $location->delete();

        $this->assertSoftDeleted('locations', ['id' => $location->id]);
        $this->assertNotNull(Location::withoutGlobalScopes()->withTrashed()->find($location->id));
    }
}
