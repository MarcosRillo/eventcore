<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * users.status valid values: 'active', 'suspended'
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_user_status CHECK (status IN ('active', 'suspended'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE users DROP CONSTRAINT chk_user_status');
    }
};
