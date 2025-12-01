<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Removes denormalized columns from events table after data migration.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                // String fields now replaced by FKs
                'event_type',      // Redundant with type_id
                'event_subtype',   // Now subtype_id
                'origin',          // Now origin_id
                'theme',           // Now theme_id
                'frequency',       // Now frequency_id
                'rotation_type',   // Now rotation_type_id
                'producer',        // Now producer_id
                'city',            // Use locations.city
                'venue',           // Use location relationship
                'rooms_used',      // Now pivot event_room

                // Boolean service fields (now in event_service pivot)
                'coffee_break',
                'lunch_catering',
                'dinner_catering',
                'pre_event_package',
                'post_event_package',

                // JSON field (now in event_async_dates table)
                'asynchronous_dates',

                // Unused columns
                'virtual_link',
                'cta_link',
                'cta_text',
                'max_attendees',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     * Recreates the denormalized columns (without data).
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // String fields
            $table->string('event_type')->nullable();
            $table->string('event_subtype')->nullable();
            $table->string('origin')->nullable();
            $table->string('theme')->nullable();
            $table->string('frequency')->nullable();
            $table->string('rotation_type')->nullable();
            $table->string('producer')->nullable();
            $table->string('city')->nullable();
            $table->string('venue')->nullable();
            $table->string('rooms_used')->nullable();

            // Boolean fields
            $table->boolean('coffee_break')->default(false);
            $table->boolean('lunch_catering')->default(false);
            $table->boolean('dinner_catering')->default(false);
            $table->boolean('pre_event_package')->default(false);
            $table->boolean('post_event_package')->default(false);

            // JSON field
            $table->json('asynchronous_dates')->nullable();

            // Unused columns
            $table->string('virtual_link')->nullable();
            $table->string('cta_link')->nullable();
            $table->string('cta_text')->nullable();
            $table->integer('max_attendees')->nullable();
        });
    }
};
