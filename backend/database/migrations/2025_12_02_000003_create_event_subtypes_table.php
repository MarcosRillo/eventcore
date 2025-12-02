<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Create event_subtypes table (children of event_types)
     * Uses dropIfExists in case old table structure exists
     */
    public function up(): void
    {
        // Drop if exists (handles case where old structure was created)
        Schema::dropIfExists('event_subtypes');

        Schema::create('event_subtypes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('event_type_id')->constrained('event_types')->onDelete('cascade');
            $table->foreignId('entity_id')->constrained('organizations')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Indexes for common queries
            $table->index(['event_type_id', 'is_active']);
            $table->index(['entity_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_subtypes');
    }
};
