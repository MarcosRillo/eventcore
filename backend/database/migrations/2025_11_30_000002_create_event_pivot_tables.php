<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates pivot tables for event relationships (services, rooms, async dates).
     */
    public function up(): void
    {
        // 1. event_service - Pivot table for events and services
        Schema::create('event_service', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('service_id')->constrained('event_services')->onDelete('cascade');
            $table->boolean('is_included')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['event_id', 'service_id']);
        });

        // 2. event_room - Pivot table for events and rooms
        Schema::create('event_room', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->constrained('event_rooms')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['event_id', 'room_id']);
        });

        // 3. event_async_dates - Table for asynchronous event dates
        Schema::create('event_async_dates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->date('date_value');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['event_id', 'date_value']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_async_dates');
        Schema::dropIfExists('event_room');
        Schema::dropIfExists('event_service');
    }
};
