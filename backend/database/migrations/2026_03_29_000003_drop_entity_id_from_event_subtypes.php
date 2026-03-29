<?php

use Illuminate\Database\Migrations\Migration;

/**
 * SKIPPED — entity_id cannot be dropped from event_subtypes yet.
 *
 * Reason: TenantScope (app/Models/Scopes/TenantScope.php, lines 50-66) filters
 * EventSubtype records by `entity_id` directly:
 *
 *   $builder->where('entity_id', $entityId);
 *
 * entity_id IS derivable via event_type_id → event_types.entity_id, but until
 * TenantScope is updated to join through event_types, dropping this column would
 * break multi-tenant isolation for organizer_admin users browsing subtypes.
 *
 * Pre-requisite before re-enabling this migration:
 *   1. Update TenantScope to resolve entity_id through the event_types join:
 *      $builder->whereHas('eventType', fn ($q) => $q->where('entity_id', $entityId));
 *   2. Verify all subtype queries still respect tenant boundaries.
 *   3. Remove entity_id from EventSubtype::$fillable.
 *   4. Re-enable up()/down() below and run this migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        // No-op — see class docblock above.
    }

    public function down(): void
    {
        // No-op — nothing was changed in up().
    }
};
