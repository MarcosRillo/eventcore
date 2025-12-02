<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds custom_location_name field to allow users to specify
     * a custom location when "Otro" is selected in the form.
     * The maps_url field already exists for the Google Maps URL.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('custom_location_name', 255)->nullable()->after('maps_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('custom_location_name');
        });
    }
};
