<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Performance Migration: Add missing indexes
 *
 * Addresses database audit findings:
 * - events.organization_id: FK without index (slow JOINs)
 * - events.is_featured: Used in scopeFeatured() without index
 * - users.role_id: FK without index
 */
return new class extends Migration
{
    public function up(): void
    {
        // Add index for organization_id FK on events
        Schema::table('events', function (Blueprint $table) {
            $table->index('organization_id', 'events_organization_id_index');
        });

        // Add index for is_featured (used by scopeFeatured)
        Schema::table('events', function (Blueprint $table) {
            $table->index('is_featured', 'events_is_featured_index');
        });

        // Add index for role_id FK on users
        Schema::table('users', function (Blueprint $table) {
            $table->index('role_id', 'users_role_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('events_organization_id_index');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('events_is_featured_index');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_role_id_index');
        });
    }
};
