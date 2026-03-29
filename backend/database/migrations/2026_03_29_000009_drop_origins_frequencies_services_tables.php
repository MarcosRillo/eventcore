<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drop event_origins, event_frequencies, and event_services (plus pivot).
 *
 * All three were dead code — no UI ever used them and the concepts they
 * modelled are either covered by other fields or simply not needed.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Remove FKs and columns from events first
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['origin_id']);
            $table->dropForeign(['frequency_id']);
            $table->dropColumn(['origin_id', 'frequency_id']);
        });

        // Drop pivot table before the lookup table it references
        Schema::dropIfExists('event_service');

        // Drop the lookup tables
        Schema::dropIfExists('event_origins');
        Schema::dropIfExists('event_frequencies');
        Schema::dropIfExists('event_services');
    }

    public function down(): void
    {
        Schema::create('event_origins', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('event_frequencies', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('event_services', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('event_service', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('event_services')->cascadeOnDelete();
            $table->boolean('is_included')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('origin_id')->nullable()->constrained('event_origins')->nullOnDelete();
            $table->foreignId('frequency_id')->nullable()->constrained('event_frequencies')->nullOnDelete();
        });
    }
};
