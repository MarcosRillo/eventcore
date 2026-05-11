<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $ids = DB::table('events')
            ->where('start_date', '>=', now())
            ->where('is_featured', false)
            ->orderBy('start_date')
            ->limit(6)
            ->pluck('id');

        if ($ids->isNotEmpty()) {
            DB::table('events')->whereIn('id', $ids)->update(['is_featured' => true]);
        }
    }

    public function down(): void
    {
        // No-op: featuring an event is a content decision, not a schema one.
    }
};
