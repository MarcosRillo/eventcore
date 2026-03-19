<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Performance indexes v2 — based on query pattern audit.
 *
 * Addresses:
 * - Missing FK indexes on organization_user, organizations, registration_requests, events
 * - Partial indexes for soft-deleted events (status + date queries)
 * - organization_user reverse lookup (user_id) used on every authenticated request
 */
return new class extends Migration
{
    public function up(): void
    {
        // HIGH PRIORITY: Every authenticated request hits this
        Schema::table('organization_user', function (Blueprint $table) {
            $table->index('user_id', 'organization_user_user_id_index');
        });

        // HIGH PRIORITY: Public events — scopePublished() + ORDER BY start_date
        // Partial index excludes soft-deleted rows for smaller, faster index
        DB::statement('
            CREATE INDEX idx_events_status_start_date
            ON events (status_id, start_date)
            WHERE deleted_at IS NULL
        ');

        // HIGH PRIORITY: Dashboard — status + end_date filter (upcoming/past)
        DB::statement('
            CREATE INDEX idx_events_status_end_date
            ON events (status_id, end_date)
            WHERE deleted_at IS NULL
        ');

        // HIGH PRIORITY: OrganizationService — WHERE parent_id = ?
        Schema::table('organizations', function (Blueprint $table) {
            $table->index('parent_id', 'organizations_parent_id_index');
        });

        // MEDIUM PRIORITY: FK indexes on organizations
        Schema::table('organizations', function (Blueprint $table) {
            $table->index('status_id', 'organizations_status_id_index');
            $table->index('type_id', 'organizations_type_id_index');
        });

        // MEDIUM PRIORITY: FK indexes on registration_requests
        Schema::table('registration_requests', function (Blueprint $table) {
            $table->index('organization_id', 'registration_requests_organization_id_index');
            $table->index('user_id', 'registration_requests_user_id_index');
        });

        // LOW PRIORITY: FK indexes on events (detail views only)
        Schema::table('events', function (Blueprint $table) {
            $table->index('created_by', 'events_created_by_index');
            $table->index('approved_by', 'events_approved_by_index');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('events_approved_by_index');
            $table->dropIndex('events_created_by_index');
        });

        Schema::table('registration_requests', function (Blueprint $table) {
            $table->dropIndex('registration_requests_user_id_index');
            $table->dropIndex('registration_requests_organization_id_index');
        });

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropIndex('organizations_type_id_index');
            $table->dropIndex('organizations_status_id_index');
            $table->dropIndex('organizations_parent_id_index');
        });

        DB::statement('DROP INDEX IF EXISTS idx_events_status_end_date');
        DB::statement('DROP INDEX IF EXISTS idx_events_status_start_date');

        Schema::table('organization_user', function (Blueprint $table) {
            $table->dropIndex('organization_user_user_id_index');
        });
    }
};
