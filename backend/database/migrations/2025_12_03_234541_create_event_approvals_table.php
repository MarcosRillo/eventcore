<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create event_approvals table (3NF)
 *
 * This table stores the complete approval history for events.
 * Each approval action (approve_internal, publish, reject, etc.) creates a new record.
 *
 * 3NF Compliance:
 * - 1NF: No repeating groups, all values are atomic
 * - 2NF: All attributes depend on the full primary key
 * - 3NF: No transitive dependencies (all fields depend only on id)
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('event_approvals', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignId('performed_by')->constrained('users')->onDelete('set null');

            // Action type
            // Values: approve_internal, request_public, publish, request_changes, reject
            $table->string('action', 50);

            // Action metadata
            $table->text('comments')->nullable(); // reason/feedback/comments
            $table->timestamp('performed_at');

            // Additional metadata for specific actions
            $table->timestamp('scheduled_publish_at')->nullable(); // only for action='publish'
            $table->json('metadata')->nullable(); // extensibility for future data

            $table->timestamps();

            // Indexes for performance
            $table->index(['event_id', 'performed_at']); // History by event
            $table->index(['event_id', 'action']); // Filter by action
            $table->index('performed_by'); // Audit by user
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_approvals');
    }
};
