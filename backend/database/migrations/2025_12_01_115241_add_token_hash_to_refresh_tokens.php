<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds token_hash column for O(1) token lookup performance.
     * SHA256 is deterministic (unlike bcrypt) so it can be indexed.
     */
    public function up(): void
    {
        Schema::table('refresh_tokens', function (Blueprint $table) {
            // Add SHA256 hash column for fast lookups
            $table->string('token_hash', 64)->nullable()->after('token')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->dropColumn('token_hash');
        });
    }
};
