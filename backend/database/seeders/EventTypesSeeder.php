<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds event_formats table (previously event_types)
 * Contains format types: presencial, virtual, híbrido, sede única, multi-sede
 */
class EventTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedFormats();
        });
    }

    private function seedFormats(): void
    {
        $formats = [
            [
                'format_code' => 'sede_unica',
                'format_name' => 'Sede Única',
                'description' => 'Event held at a single location',
                'allows_multiple_locations' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'format_code' => 'multi_sede',
                'format_name' => 'Multi-Sede',
                'description' => 'Event held across multiple locations',
                'allows_multiple_locations' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('event_formats')->insert($formats);
    }
}
