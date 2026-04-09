<?php

namespace Tests\Feature\Sectors;

use App\Models\Organization;
use App\Models\Sector;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests for Sectors feature:
 * - SectorController (index, store, show, update, destroy, toggleStatus, active, publicActive)
 * - SectorService (getAllSectors, getActiveSectors, getPublicActiveSectors, createSector,
 *                  updateSector, deleteSector, toggleSectorStatus)
 * - StoreSectorRequest (name required max:100, is_active optional boolean)
 * - UpdateSectorRequest (name sometimes required max:100, is_active optional boolean)
 */
class SectorTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;
    private User $entityAdmin;
    private User $entityStaff;
    private User $organizerAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);

        $this->organization = Organization::factory()->create();

        $this->entityAdmin = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'entity_admin')->first()->id,
        ]);
        $this->entityAdmin->organizations()->attach($this->organization->id);

        $this->entityStaff = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'entity_staff')->first()->id,
        ]);
        $this->entityStaff->organizations()->attach($this->organization->id);

        $this->organizerAdmin = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'organizer_admin')->first()->id,
        ]);
        $this->organizerAdmin->organizations()->attach($this->organization->id);
    }

    // ==================== INDEX TESTS ====================

    public function test_can_list_sectors(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        Sector::factory()->count(3)->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/sectors');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'links', 'meta']);

        $this->assertGreaterThanOrEqual(3, count($response->json('data')));
    }

    public function test_can_filter_sectors_by_search(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        Sector::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'tecnologia innovacion',
        ]);
        Sector::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'salud bienestar',
        ]);

        $response = $this->getJson('/api/v1/sectors?search=tecnologia');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertGreaterThan(0, count($data));
        $this->assertStringContainsStringIgnoringCase('tecnologia', $data[0]['name']);
    }

    public function test_search_is_case_insensitive(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        Sector::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'EDUCACION SUPERIOR',
        ]);

        $response = $this->getJson('/api/v1/sectors?search=educacion');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertGreaterThan(0, count($data));
    }

    public function test_can_filter_sectors_by_active_status(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        Sector::factory()->count(3)->active()->create([
            'entity_id' => $this->organization->id,
        ]);
        Sector::factory()->count(2)->inactive()->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/sectors?is_active=true');

        $response->assertStatus(200);
        foreach ($response->json('data') as $sector) {
            $this->assertTrue($sector['is_active']);
        }
    }

    public function test_can_filter_sectors_by_inactive_status(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        Sector::factory()->count(2)->active()->create([
            'entity_id' => $this->organization->id,
        ]);
        Sector::factory()->count(3)->inactive()->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/sectors?is_active=false');

        $response->assertStatus(200);
        foreach ($response->json('data') as $sector) {
            $this->assertFalse($sector['is_active']);
        }
    }

    public function test_sectors_pagination_works(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        Sector::factory()->count(20)->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/sectors?per_page=5&page=1');

        $response->assertStatus(200);
        $this->assertCount(5, $response->json('data'));
        $this->assertEquals(1, $response->json('meta.current_page'));
    }

    public function test_per_page_has_maximum_limit(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        Sector::factory()->count(110)->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/sectors?per_page=200');

        $response->assertStatus(200);
        $this->assertLessThanOrEqual(100, count($response->json('data')));
    }

    public function test_list_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/sectors');

        $response->assertStatus(401);
    }

    // ==================== SHOW TESTS ====================

    public function test_can_show_sector(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $sector = Sector::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Turismo Cultural',
        ]);

        $response = $this->getJson("/api/v1/sectors/{$sector->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Turismo Cultural');
    }

    public function test_show_returns_404_for_nonexistent_sector(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $response = $this->getJson('/api/v1/sectors/99999');

        $response->assertStatus(404);
    }

    public function test_show_tenant_isolation(): void
    {
        $otherOrganization = Organization::factory()->create();
        $otherAdmin = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'entity_admin')->first()->id,
        ]);
        $otherAdmin->organizations()->attach($otherOrganization->id);
        $this->actingAs($otherAdmin, 'sanctum');

        // sector belongs to $this->organization, not $otherOrganization
        $sector = Sector::factory()->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->getJson("/api/v1/sectors/{$sector->id}");

        // TenantScope should return 404
        $response->assertStatus(404);
    }

    // ==================== STORE TESTS ====================

    public function test_entity_admin_can_create_sector(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/sectors', [
            'name' => 'Gastronomia y Turismo',
            'is_active' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Gastronomia y Turismo')
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('sectors', [
            'name' => 'Gastronomia y Turismo',
            'entity_id' => $this->organization->id,
        ]);
    }

    public function test_create_sector_defaults_is_active_to_true(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/sectors', [
            'name' => 'Sector Sin Estado Explicito',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.is_active', true);
    }

    public function test_create_sector_with_is_active_false(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/sectors', [
            'name' => 'Sector Inactivo',
            'is_active' => false,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.is_active', false);
    }

    public function test_create_sector_requires_name(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/sectors', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_create_sector_name_cannot_exceed_100_chars(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/sectors', [
            'name' => str_repeat('a', 101),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_create_sector_accepts_name_at_exactly_100_chars(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/sectors', [
            'name' => str_repeat('a', 100),
        ]);

        $response->assertStatus(201);
    }

    public function test_create_sector_requires_authentication(): void
    {
        $response = $this->postJson('/api/v1/sectors', [
            'name' => 'Test Sector',
        ]);

        $response->assertStatus(401);
    }

    public function test_is_active_must_be_boolean(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $response = $this->postJson('/api/v1/sectors', [
            'name' => 'Test Sector',
            'is_active' => 'not-a-boolean',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['is_active']);
    }

    // ==================== UPDATE TESTS ====================

    public function test_entity_admin_can_update_sector(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $sector = Sector::factory()->create([
            'entity_id' => $this->organization->id,
            'name' => 'Original Name',
        ]);

        $response = $this->putJson("/api/v1/sectors/{$sector->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('sectors', [
            'id' => $sector->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_update_sector_name_cannot_exceed_100_chars(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $sector = Sector::factory()->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->putJson("/api/v1/sectors/{$sector->id}", [
            'name' => str_repeat('x', 101),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_update_can_change_active_status(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $sector = Sector::factory()->active()->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->putJson("/api/v1/sectors/{$sector->id}", [
            'is_active' => false,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('sectors', [
            'id' => $sector->id,
            'is_active' => false,
        ]);
    }

    public function test_update_requires_authentication(): void
    {
        $sector = Sector::factory()->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->putJson("/api/v1/sectors/{$sector->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertStatus(401);
    }

    // ==================== DELETE TESTS ====================

    public function test_entity_admin_can_delete_sector(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $sector = Sector::factory()->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->deleteJson("/api/v1/sectors/{$sector->id}");

        $response->assertNoContent();

        $this->assertSoftDeleted('sectors', [
            'id' => $sector->id,
        ]);
    }

    public function test_delete_requires_authentication(): void
    {
        $sector = Sector::factory()->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->deleteJson("/api/v1/sectors/{$sector->id}");

        $response->assertStatus(401);
    }

    public function test_delete_tenant_isolated(): void
    {
        $otherOrganization = Organization::factory()->create();
        $otherAdmin = User::factory()->create([
            'role_id' => UserRole::where('role_code', 'entity_admin')->first()->id,
        ]);
        $otherAdmin->organizations()->attach($otherOrganization->id);
        $this->actingAs($otherAdmin, 'sanctum');

        $sector = Sector::factory()->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->deleteJson("/api/v1/sectors/{$sector->id}");

        // TenantScope should return 404 — sector still exists in DB
        $response->assertStatus(404);

        $this->assertDatabaseHas('sectors', [
            'id' => $sector->id,
            'deleted_at' => null,
        ]);
    }

    // ==================== TOGGLE STATUS TESTS ====================

    public function test_can_toggle_sector_status_from_active_to_inactive(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $sector = Sector::factory()->active()->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->patchJson("/api/v1/sectors/{$sector->id}/toggle-status");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('sectors', [
            'id' => $sector->id,
            'is_active' => false,
        ]);
    }

    public function test_can_toggle_sector_status_from_inactive_to_active(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        $sector = Sector::factory()->inactive()->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->patchJson("/api/v1/sectors/{$sector->id}/toggle-status");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('sectors', [
            'id' => $sector->id,
            'is_active' => true,
        ]);
    }

    // ==================== ACTIVE ENDPOINT TESTS ====================

    public function test_active_endpoint_returns_only_active_sectors(): void
    {
        $this->actingAs($this->entityAdmin, 'sanctum');

        Sector::factory()->count(3)->active()->create([
            'entity_id' => $this->organization->id,
        ]);
        Sector::factory()->count(2)->inactive()->create([
            'entity_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/sectors/active');

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'message', 'data']);

        foreach ($response->json('data') as $sector) {
            $this->assertTrue($sector['is_active']);
        }
    }

    public function test_active_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/sectors/active');

        $response->assertStatus(401);
    }

    // ==================== PUBLIC ACTIVE ENDPOINT TESTS ====================

    public function test_public_active_endpoint_accessible_without_auth(): void
    {
        // Sectors from different organizations should all appear (no tenant scope)
        $org1 = Organization::factory()->create();
        $org2 = Organization::factory()->create();

        Sector::factory()->active()->create(['entity_id' => $org1->id, 'name' => 'Public Sector One']);
        Sector::factory()->active()->create(['entity_id' => $org2->id, 'name' => 'Public Sector Two']);
        Sector::factory()->inactive()->create(['entity_id' => $org1->id, 'name' => 'Inactive Sector']);

        $response = $this->getJson('/api/v1/public/sectors/active');

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'message', 'data']);

        // Only active sectors should be returned
        foreach ($response->json('data') as $sector) {
            $this->assertTrue($sector['is_active']);
        }
    }

    public function test_public_active_returns_sectors_from_all_organizations(): void
    {
        $org1 = Organization::factory()->create();
        $org2 = Organization::factory()->create();

        Sector::factory()->active()->create(['entity_id' => $org1->id, 'name' => 'Sector Org A']);
        Sector::factory()->active()->create(['entity_id' => $org2->id, 'name' => 'Sector Org B']);

        $response = $this->getJson('/api/v1/public/sectors/active');

        $response->assertStatus(200);
        $names = array_column($response->json('data'), 'name');
        $this->assertContains('Sector Org A', $names);
        $this->assertContains('Sector Org B', $names);
    }
}
