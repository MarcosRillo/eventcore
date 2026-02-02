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
        // Get role IDs
        $platformAdminRole = UserRole::where('role_code', 'platform_admin')->first();
        $entityAdminRole = UserRole::where('role_code', 'entity_admin')->first();
        $organizerAdminRole = UserRole::where('role_code', 'organizer_admin')->first();
        $entityStaffRole = UserRole::where('role_code', 'entity_staff')->first();

        // Create Platform Admin
        User::create([
            'name' => 'Marcos Rillo Cabanne',
            'email' => 'marcos@plataforma.com',
            'role_id' => $platformAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        // Get organizations for associating users
        $enteDeturismo = Organization::where('slug', 'ente-turismo-tucuman')->first();
        $sheraton = Organization::where('slug', 'sheraton-tucuman')->first();
        $laRural = Organization::where('slug', 'la-rural-tucuman')->first();

        // Create Entity Admin for Ente de Turismo
        $entityAdminTurismo = User::create([
            'name' => 'Ana García',
            'email' => 'ana.garcia@enteturismo.gov.ar',
            'role_id' => $entityAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $entityAdminTurismo->organizations()->attach($enteDeturismo->id);

        // Create Organizer Admins
        $organizerSheraton = User::create([
            'name' => 'María Rodriguez',
            'email' => 'maria.rodriguez@sheraton.com',
            'role_id' => $organizerAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $organizerSheraton->organizations()->attach($sheraton->id);

        $organizerLaRural = User::create([
            'name' => 'Juan Pérez',
            'email' => 'juan.perez@larural.com.ar',
            'role_id' => $organizerAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $organizerLaRural->organizations()->attach($laRural->id);

        // Create Entity Staff members for Ente de Turismo
        $staffTurismo1 = User::create([
            'name' => 'Patricia López',
            'email' => 'patricia.lopez@enteturismo.gov.ar',
            'role_id' => $entityStaffRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
        $staffTurismo1->organizations()->attach($enteDeturismo->id);

        $staffTurismo2 = User::create([
            'name' => 'Miguel Sánchez',
            'email' => 'miguel.sanchez@enteturismo.gov.ar',
            'role_id' => $entityStaffRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
        $staffTurismo2->organizations()->attach($enteDeturismo->id);

        $staffTurismo3 = User::create([
            'name' => 'Lucía Romero',
            'email' => 'lucia.romero@enteturismo.gov.ar',
            'role_id' => $entityStaffRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
        $staffTurismo3->organizations()->attach($enteDeturismo->id);

        // One suspended staff for testing
        $staffTurismoSuspended = User::create([
            'name' => 'Fernando Ruiz (Suspendido)',
            'email' => 'fernando.ruiz@enteturismo.gov.ar',
            'role_id' => $entityStaffRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
            'status' => 'suspended',
        ]);
        $staffTurismoSuspended->organizations()->attach($enteDeturismo->id);

        $this->command->info('Users created successfully!');
        $this->command->info('- 1 Platform Admin');
        $this->command->info('- 1 Entity Admin (Ente de Turismo)');
        $this->command->info('- 2 Organizer Admins (Sheraton + La Rural)');
        $this->command->info('- 4 Entity Staff (3 active + 1 suspended)');
        $this->command->info('- All passwords: password123');
    }
}
