<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates lookup tables for 3NF normalization of events table.
     */
    public function up(): void
    {
        // 1. event_origins - Origin of the event (local, national, international)
        Schema::create('event_origins', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        // 2. event_themes - Event themes (cultural, sports, business, etc.)
        Schema::create('event_themes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        // 3. event_frequencies - Event frequency (unique, daily, weekly, etc.)
        Schema::create('event_frequencies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        // 4. event_rotation_types - Rotation types (fixed, rotating, itinerant)
        Schema::create('event_rotation_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        // 5. event_subtypes - Subtypes linked to event_types
        Schema::create('event_subtypes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_type_id')->constrained('event_types')->onDelete('cascade');
            $table->string('code', 50);
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
            $table->unique(['event_type_id', 'code']);
        });

        // 6. event_services - Available services (catering, packages, etc.)
        Schema::create('event_services', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        // 7. event_rooms - Rooms linked to locations
        Schema::create('event_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->onDelete('cascade');
            $table->string('code', 50);
            $table->string('name', 100);
            $table->integer('capacity')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['location_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_rooms');
        Schema::dropIfExists('event_services');
        Schema::dropIfExists('event_subtypes');
        Schema::dropIfExists('event_rotation_types');
        Schema::dropIfExists('event_frequencies');
        Schema::dropIfExists('event_themes');
        Schema::dropIfExists('event_origins');
    }
};
