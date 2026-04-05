<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_types', function (Blueprint $table) {
            $table->string('icon', 50)->nullable()->after('color');
        });
    }

    public function down(): void
    {
        Schema::table('event_types', function (Blueprint $table) {
            $table->dropColumn('icon');
        });
    }
};
