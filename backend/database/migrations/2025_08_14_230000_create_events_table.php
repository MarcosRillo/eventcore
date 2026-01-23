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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date');

            $table->foreignId('status_id')->constrained('event_statuses');
            $table->foreignId('type_id')->constrained('event_types');

            // Virtual event support
            $table->string('virtual_link')->nullable();

            // Call-to-action configuration
            $table->string('cta_link')->nullable();
            $table->string('cta_text')->nullable();

            // Additional approval workflow metadata
            $table->text('approval_comments')->nullable(); // Comments from approvers/rejectors
            $table->json('approval_history')->nullable(); // Track approval workflow history
            $table->unsignedBigInteger('created_by')->nullable(); // User who created the event
            $table->unsignedBigInteger('approved_by')->nullable(); // User who approved the event
            $table->timestamp('approved_at')->nullable(); // When the event was approved
            $table->string('featured_image')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('max_attendees')->nullable();

            // Relationships
            $table->unsignedBigInteger('category_id')->nullable();

            // Organization relationship - for events created by external organizations
            $table->unsignedBigInteger('organization_id')->nullable();

            // Multi-tenant field - for events supervised by government entities
            $table->unsignedBigInteger('entity_id');

            $table->timestamps();

            // Indexes for performance
            $table->index(['entity_id', 'status_id']);
            $table->index(['entity_id', 'start_date']);
            $table->index(['entity_id', 'type_id']);
            $table->index(['start_date', 'end_date']);
            $table->index(['category_id']);

            // Foreign key constraints
            $table->foreign('entity_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('set null');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
