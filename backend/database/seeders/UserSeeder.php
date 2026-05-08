<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedUsers();
        });
    }

    private function seedUsers(): void
    {
        $demoPassword = env('SEED_DEMO_PASSWORD', 'demo1234');

        // Get role IDs
        $platformAdminRole = UserRole::where('role_code', 'platform_admin')->first();
        $entityAdminRole = UserRole::where('role_code', 'entity_admin')->first();
        $organizerAdminRole = UserRole::where('role_code', 'organizer_admin')->first();
        $entityStaffRole = UserRole::where('role_code', 'entity_staff')->first();

        // Create Platform Admin (project author — kept intentionally)
        User::create([
            'name' => 'Marcos Rillo Cabanne',
            'email' => 'marcos@plataforma.com',
            'role_id' => $platformAdminRole->id,
            'password' => Hash::make($demoPassword),
            'email_verified_at' => now(),
        ]);

        // Get organizations for associating users
        $enteDeturismo = Organization::where('slug', 'demo-organization')->first();
        $hotelCentral = Organization::where('slug', 'hotel-central-demo')->first();
        $centroNorte = Organization::where('slug', 'centro-convenciones-norte')->first();

        // Create Entity Admin for Demo Organization
        $entityAdminTurismo = User::create([
            'name' => 'Ana García',
            'email' => 'admin@example.com',
            'role_id' => $entityAdminRole->id,
            'password' => Hash::make($demoPassword),
            'email_verified_at' => now(),
        ]);
        $entityAdminTurismo->organizations()->attach($enteDeturismo->id);

        // Create Organizer Admins
        $organizerHotelCentral = User::create([
            'name' => 'María Rodriguez',
            'email' => 'organizer@example.com',
            'role_id' => $organizerAdminRole->id,
            'password' => Hash::make($demoPassword),
            'email_verified_at' => now(),
        ]);
        $organizerHotelCentral->organizations()->attach($hotelCentral->id);

        $organizerCentroNorte = User::create([
            'name' => 'Juan Pérez',
            'email' => 'organizer2@example.com',
            'role_id' => $organizerAdminRole->id,
            'password' => Hash::make($demoPassword),
            'email_verified_at' => now(),
        ]);
        $organizerCentroNorte->organizations()->attach($centroNorte->id);

        // Create Entity Staff members for Demo Organization
        $staffTurismo1 = User::create([
            'name' => 'Patricia López',
            'email' => 'staff1@example.com',
            'role_id' => $entityStaffRole->id,
            'password' => Hash::make($demoPassword),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
        $staffTurismo1->organizations()->attach($enteDeturismo->id);

        $staffTurismo2 = User::create([
            'name' => 'Miguel Sánchez',
            'email' => 'staff2@example.com',
            'role_id' => $entityStaffRole->id,
            'password' => Hash::make($demoPassword),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
        $staffTurismo2->organizations()->attach($enteDeturismo->id);

        $staffTurismo3 = User::create([
            'name' => 'Lucía Romero',
            'email' => 'staff3@example.com',
            'role_id' => $entityStaffRole->id,
            'password' => Hash::make($demoPassword),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
        $staffTurismo3->organizations()->attach($enteDeturismo->id);

        // One suspended staff for testing
        $staffTurismoSuspended = User::create([
            'name' => 'Fernando Ruiz (Suspendido)',
            'email' => 'staff-suspended@example.com',
            'role_id' => $entityStaffRole->id,
            'password' => Hash::make($demoPassword),
            'email_verified_at' => now(),
            'status' => 'suspended',
        ]);
        $staffTurismoSuspended->organizations()->attach($enteDeturismo->id);

        $this->command->info('Users created successfully!');
        $this->command->info('- 1 Platform Admin');
        $this->command->info('- 1 Entity Admin (Demo Organization)');
        $this->command->info('- 2 Organizer Admins');
        $this->command->info('- 4 Entity Staff (3 active + 1 suspended)');
        $this->command->info('- All passwords from SEED_DEMO_PASSWORD (default: demo1234)');
    }
}
