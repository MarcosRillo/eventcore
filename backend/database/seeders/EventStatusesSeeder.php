<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventStatusesSeeder extends Seeder
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
                'status_code' => 'draft',
                'status_name' => 'Draft',
                'description' => 'Event is being created, not visible to public',
                'is_public' => false,
                'workflow_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status_code' => 'pending_internal_approval',
                'status_name' => 'Pending Internal Approval',
                'description' => 'Event submitted for internal approval by entity admin',
                'is_public' => false,
                'workflow_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status_code' => 'approved_internal',
                'status_name' => 'Approved Internal',
                'description' => 'Event approved internally, ready for public approval',
                'is_public' => false,
                'workflow_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status_code' => 'pending_public_approval',
                'status_name' => 'Pending Public Approval',
                'description' => 'Event pending final public approval',
                'is_public' => false,
                'workflow_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status_code' => 'published',
                'status_name' => 'Published',
                'description' => 'Event is live and visible to public',
                'is_public' => true,
                'workflow_order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status_code' => 'requires_changes',
                'status_name' => 'Requires Changes',
                'description' => 'Event needs modifications before approval',
                'is_public' => false,
                'workflow_order' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status_code' => 'rejected',
                'status_name' => 'Rejected',
                'description' => 'Event rejected and will not be published',
                'is_public' => false,
                'workflow_order' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status_code' => 'cancelled',
                'status_name' => 'Cancelled',
                'description' => 'Event was cancelled by organizer',
                'is_public' => false,
                'workflow_order' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('event_statuses')->insert($statuses);
    }
}
