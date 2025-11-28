<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Security improvement: Split token into selector (for lookup) and validator (hashed).
     * This prevents token theft if the database is compromised.
     */
    public function up(): void
    {
        Schema::table('invitations', function (Blueprint $table) {
            // Add selector column for fast lookups (not hashed)
            $table->string('selector', 32)->unique()->after('email');

            // Drop the unique constraint on token since it now stores a hash
            // Hashes are unique by nature of the input being unique
            $table->dropUnique(['token']);

            // Change token to store the hash (255 chars for bcrypt compatibility)
            $table->string('token', 255)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invitations', function (Blueprint $table) {
            $table->dropColumn('selector');
            $table->string('token', 64)->unique()->change();
        });
    }
};
