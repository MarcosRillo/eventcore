<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrganizationTypesSeeder extends Seeder
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
                'type_code' => 'primary_entity',
                'type_name' => 'Primary Entity',
                'description' => 'Government entity or municipality with approval authority',
                'hierarchy_level' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'type_code' => 'event_organizer',
                'type_name' => 'Event Organizer',
                'description' => 'External organization that creates and manages events',
                'hierarchy_level' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('organization_types')->insert($types);
    }
}
