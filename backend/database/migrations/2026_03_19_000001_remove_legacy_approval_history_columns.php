<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Remove legacy approval_history (JSON) and approval_comments (text) columns from events.
 *
 * These columns were replaced by the normalized event_approvals table (2025_12_03_234541).
 * All approval operations already write to event_approvals; these columns are never written
 * to and contain stale/empty data.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['approval_history', 'approval_comments']);
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->text('approval_comments')->nullable();
            $table->json('approval_history')->nullable();
        });
    }
};
