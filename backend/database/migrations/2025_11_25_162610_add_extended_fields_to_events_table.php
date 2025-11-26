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
        Schema::table('events', function (Blueprint $table) {
            // Información Básica
            $table->string('edition_number')->nullable()->after('title');
            $table->string('event_type')->nullable()->after('description');
            $table->string('event_subtype')->nullable()->after('event_type');
            $table->string('origin')->nullable()->after('event_subtype');
            $table->string('theme')->nullable()->after('origin');
            $table->string('frequency')->nullable()->after('theme');
            $table->string('rotation_type')->nullable()->after('frequency');

            // Servicios y Catering
            $table->boolean('coffee_break')->default(false)->after('rotation_type');
            $table->boolean('lunch_catering')->default(false)->after('coffee_break');
            $table->boolean('dinner_catering')->default(false)->after('lunch_catering');
            $table->boolean('pre_event_package')->default(false)->after('dinner_catering');
            $table->boolean('post_event_package')->default(false)->after('pre_event_package');

            // Ubicación
            $table->string('venue')->nullable()->after('post_event_package');
            $table->string('city')->nullable()->after('venue');
            $table->string('rooms_used')->nullable()->after('city');
            $table->text('maps_url')->nullable()->after('rooms_used');
            $table->string('previous_venue')->nullable()->after('maps_url');
            $table->string('next_venue')->nullable()->after('previous_venue');

            // Fechas Asincrónicas (JSON array)
            $table->json('asynchronous_dates')->nullable()->after('end_date');

            // Asistencia
            $table->integer('local_attendance')->nullable()->after('asynchronous_dates');
            $table->integer('national_attendance')->nullable()->after('local_attendance');
            $table->integer('international_attendance')->nullable()->after('national_attendance');
            $table->boolean('virtual_transmission')->default(false)->after('international_attendance');

            // Información Adicional
            $table->string('producer')->nullable()->after('virtual_transmission');
            $table->string('event_website')->nullable()->after('producer');

            // Imágenes
            $table->string('logo_url')->nullable()->after('featured_image');
            $table->string('responsive_image_url')->nullable()->after('logo_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Drop columns in reverse order
            $table->dropColumn([
                'responsive_image_url',
                'logo_url',
                'event_website',
                'producer',
                'virtual_transmission',
                'international_attendance',
                'national_attendance',
                'local_attendance',
                'asynchronous_dates',
                'next_venue',
                'previous_venue',
                'maps_url',
                'rooms_used',
                'city',
                'venue',
                'post_event_package',
                'pre_event_package',
                'dinner_catering',
                'lunch_catering',
                'coffee_break',
                'rotation_type',
                'frequency',
                'theme',
                'origin',
                'event_subtype',
                'event_type',
                'edition_number',
            ]);
        });
    }
};
