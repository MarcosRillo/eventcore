<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrganizationStatusesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedStatuses();
        });
    }

    private function seedStatuses(): void
    {
        $statuses = [
            [
                'status_code' => 'active',
                'status_name' => 'Active',
                'description' => 'Organization is active and can create events',
                'can_create_events' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status_code' => 'suspended',
                'status_name' => 'Suspended',
                'description' => 'Organization is suspended and cannot create events',
                'can_create_events' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status_code' => 'pending',
                'status_name' => 'Pending Approval',
                'description' => 'Organization awaiting approval to join platform',
                'can_create_events' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('organization_statuses')->insert($statuses);
    }
}
