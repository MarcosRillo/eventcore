<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drop dead columns from events.
 *
 * - subtype_id: orphaned FK-less column, superseded by event_subtype_id
 * - virtual_transmission: boolean not removed with other service flags;
 *   data already lives in the event_service pivot table
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['subtype_id', 'virtual_transmission']);
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->unsignedBigInteger('subtype_id')->nullable();
            $table->boolean('virtual_transmission')->default(false);
        });
    }
};
