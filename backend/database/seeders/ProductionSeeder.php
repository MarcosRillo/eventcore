<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\OrganizationStatus;
use App\Models\OrganizationType;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ProductionSeeder extends Seeder
{
    /**
     * Run production seeder.
     * Creates the primary entity and initial admin from environment variables.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedProductionData();
        });
    }

    private function seedProductionData(): void
    {
        $activeStatus = OrganizationStatus::where('status_code', 'active')->first();
        $primaryEntityType = OrganizationType::where('type_code', 'primary_entity')->first();

        // Create primary entity from config
        $organization = Organization::create([
            'name' => config('app.primary_entity_name', 'Demo Organization'),
            'cuit' => config('app.primary_entity_cuit', '30-00000000-0'),
            'description' => 'Organismo público de turismo',
            'status_id' => $activeStatus->id,
            'type_id' => $primaryEntityType->id,
            'slug' => 'ente-turismo',
        ]);

        $this->command->info("Primary entity created: {$organization->name}");

        // Create initial admin if credentials are provided
        $adminEmail = config('app.initial_admin_email');
        $adminPassword = config('app.initial_admin_password');

        if ($adminEmail && $adminPassword) {
            $adminRole = UserRole::where('role_code', 'entity_admin')->first();

            $admin = User::create([
                'name' => config('app.initial_admin_name', 'Administrador'),
                'email' => $adminEmail,
                'role_id' => $adminRole->id,
                'password' => Hash::make($adminPassword),
                'email_verified_at' => now(),
            ]);

            $admin->organizations()->attach($organization->id);

            $this->command->info("Admin user created: {$adminEmail}");
        } else {
            $this->command->warn('Environment variables INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD not configured.');
            $this->command->warn('No admin user was created. Configure these variables and run the seeder again.');
        }
    }
}
