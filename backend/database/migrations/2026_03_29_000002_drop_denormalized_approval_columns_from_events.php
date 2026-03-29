<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drop denormalized approval columns from events.
 *
 * - approved_by: duplicates event_approvals.performed_by
 * - approved_at: duplicates event_approvals.performed_at
 *
 * Both columns were superseded by the event_approvals table (2025_12_03_234541).
 * The performance index added in 2026_03_18_000001 must be dropped first.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('events_approved_by_index');
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['approved_by', 'approved_at']);
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->index('approved_by', 'events_approved_by_index');
        });
    }
};
