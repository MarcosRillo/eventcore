<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drop event_rotation_types and remove rotation_type_id FK from events.
 *
 * event_rotation_types was dead code — no UI used it and the concept of
 * venue rotation is already covered by previous_venue / next_venue fields.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['rotation_type_id']);
            $table->dropColumn('rotation_type_id');
        });

        Schema::dropIfExists('event_rotation_types');
    }

    public function down(): void
    {
        Schema::create('event_rotation_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('rotation_type_id')->nullable()->constrained('event_rotation_types')->nullOnDelete();
        });
    }
};
