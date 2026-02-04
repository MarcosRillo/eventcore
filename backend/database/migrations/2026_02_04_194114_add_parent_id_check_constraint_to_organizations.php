<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Event organizer organizations (type_id=2) must have a parent_id.
     * This constraint prevents the bug where new organizers created via
     * web registration would have NULL parent_id, making their events
     * invisible to entity admins due to TenantScope filtering.
     */
    public function up(): void
    {
        DB::statement('
            ALTER TABLE organizations
            ADD CONSTRAINT chk_event_organizer_requires_parent
            CHECK (type_id != 2 OR parent_id IS NOT NULL)
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('
            ALTER TABLE organizations
            DROP CONSTRAINT IF EXISTS chk_event_organizer_requires_parent
        ');
    }
};
