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
        Schema::create('registration_requests', function (Blueprint $table) {
            $table->id();
            $table->string('dni', 20);
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email');
            $table->string('whatsapp', 20);
            $table->string('profile_photo')->nullable();
            $table->string('organization_name');
            $table->string('organization_cuit', 13); // CUIT format: XX-XXXXXXXX-X
            $table->string('organization_sector', 100);
            $table->string('organization_logo')->nullable();
            $table->string('website')->nullable();
            $table->text('motivation');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index(['email', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registration_requests');
    }
};
