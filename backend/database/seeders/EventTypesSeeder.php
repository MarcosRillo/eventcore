<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedTypes();
        });
    }

    private function seedTypes(): void
    {
        $types = [
            [
                'type_code' => 'sede_unica',
                'type_name' => 'Sede Única',
                'description' => 'Event held at a single location',
                'allows_multiple_locations' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'type_code' => 'multi_sede',
                'type_name' => 'Multi-Sede',
                'description' => 'Event held across multiple locations',
                'allows_multiple_locations' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('event_types')->insert($types);
    }
}
