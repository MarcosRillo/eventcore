<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add event_type_id and event_subtype_id to events, remove category_id
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Add new columns (nullable initially for existing data)
            $table->foreignId('event_type_id')
                ->nullable()
                ->after('category_id')
                ->constrained('event_types')
                ->onDelete('restrict');

            $table->foreignId('event_subtype_id')
                ->nullable()
                ->after('event_type_id')
                ->constrained('event_subtypes')
                ->onDelete('restrict');

            // Indexes for performance
            $table->index(['entity_id', 'event_type_id']);
            $table->index(['event_type_id', 'event_subtype_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['event_type_id']);
            $table->dropForeign(['event_subtype_id']);
            $table->dropIndex(['entity_id', 'event_type_id']);
            $table->dropIndex(['event_type_id', 'event_subtype_id']);
            $table->dropColumn(['event_type_id', 'event_subtype_id']);
        });
    }
};
