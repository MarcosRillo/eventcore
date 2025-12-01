<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds foreign key columns to events table for 3NF normalization.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Add new FK columns (nullable for data migration)
            $table->foreignId('subtype_id')->nullable()->after('type_id')->constrained('event_subtypes')->nullOnDelete();
            $table->foreignId('origin_id')->nullable()->after('subtype_id')->constrained('event_origins')->nullOnDelete();
            $table->foreignId('theme_id')->nullable()->after('origin_id')->constrained('event_themes')->nullOnDelete();
            $table->foreignId('frequency_id')->nullable()->after('theme_id')->constrained('event_frequencies')->nullOnDelete();
            $table->foreignId('rotation_type_id')->nullable()->after('frequency_id')->constrained('event_rotation_types')->nullOnDelete();
            $table->foreignId('producer_id')->nullable()->after('rotation_type_id')->constrained('organizations')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Drop foreign key constraints first
            $table->dropForeign(['subtype_id']);
            $table->dropForeign(['origin_id']);
            $table->dropForeign(['theme_id']);
            $table->dropForeign(['frequency_id']);
            $table->dropForeign(['rotation_type_id']);
            $table->dropForeign(['producer_id']);

            // Then drop columns
            $table->dropColumn([
                'subtype_id',
                'origin_id',
                'theme_id',
                'frequency_id',
                'rotation_type_id',
                'producer_id',
            ]);
        });
    }
};
