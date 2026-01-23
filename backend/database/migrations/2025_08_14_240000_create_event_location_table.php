<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('event_location', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('location_id');

            // Additional pivot data
            $table->text('location_specific_notes')->nullable();
            $table->integer('max_attendees_for_location')->nullable();
            $table->json('location_metadata')->nullable();

            $table->timestamps();

            // Unique constraint to prevent duplicate event-location pairs
            $table->unique(['event_id', 'location_id']);

            // Indexes
            $table->index('event_id');
            $table->index('location_id');

            // Foreign key constraints
            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_location');
    }
};
