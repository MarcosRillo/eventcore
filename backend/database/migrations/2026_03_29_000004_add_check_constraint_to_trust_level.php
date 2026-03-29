<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * trust_level values: 1=Nuevo, 2=Confiable, 3=Premium
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE organizations ADD CONSTRAINT chk_trust_level CHECK (trust_level BETWEEN 1 AND 3)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE organizations DROP CONSTRAINT chk_trust_level');
    }
};
