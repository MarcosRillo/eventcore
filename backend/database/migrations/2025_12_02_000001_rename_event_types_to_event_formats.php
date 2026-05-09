<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Rename event_types to event_formats (presencial/virtual/híbrido)
     * Also handles event_subtypes that may have been created with FK to old event_types
     */
    public function up(): void
    {
        // First, drop FK constraints from events table that reference tables we'll modify
        Schema::table('events', function (Blueprint $table) {
            // Drop subtype_id FK if exists (references old event_subtypes)
            if (Schema::hasColumn('events', 'subtype_id')) {
                try {
                    $table->dropForeign(['subtype_id']);
                } catch (Exception $e) {
                    // FK may not exist
                }
            }
        });

        // Now we can safely drop event_subtypes
        Schema::dropIfExists('event_subtypes');

        // Drop the foreign key from events table
        Schema::table('events', function (Blueprint $table) {
            // Drop FK if exists (may not exist in fresh installs)
            if (Schema::hasColumn('events', 'type_id')) {
                $table->dropForeign(['type_id']);
            }
        });

        // Drop index if exists
        if (Schema::hasIndex('events', 'events_entity_id_type_id_index')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropIndex('events_entity_id_type_id_index');
            });
        }

        // Rename the table
        Schema::rename('event_types', 'event_formats');

        // Rename column in event_formats for clarity
        Schema::table('event_formats', function (Blueprint $table) {
            $table->renameColumn('type_code', 'format_code');
            $table->renameColumn('type_name', 'format_name');
        });

        // Rename column in events table
        Schema::table('events', function (Blueprint $table) {
            $table->renameColumn('type_id', 'format_id');
        });

        // Re-add foreign key with new name
        Schema::table('events', function (Blueprint $table) {
            $table->foreign('format_id')->references('id')->on('event_formats');
            $table->index(['entity_id', 'format_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop new foreign key
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['format_id']);
            $table->dropIndex('events_entity_id_format_id_index');
        });

        // Rename column back in events
        Schema::table('events', function (Blueprint $table) {
            $table->renameColumn('format_id', 'type_id');
        });

        // Rename columns back in event_formats
        Schema::table('event_formats', function (Blueprint $table) {
            $table->renameColumn('format_code', 'type_code');
            $table->renameColumn('format_name', 'type_name');
        });

        // Rename table back
        Schema::rename('event_formats', 'event_types');

        // Re-add original foreign key
        Schema::table('events', function (Blueprint $table) {
            $table->foreign('type_id')->references('id')->on('event_types');
            $table->index(['entity_id', 'type_id']);
        });
    }
};
