<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
        $platformAdmin = User::create([
            'name' => 'Marcos Rillo Cabanne',
            'email' => 'marcos@plataforma.com',
            'role_id' => $platformAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        // Get organizations for associating users
        $enteDeturismo = Organization::where('slug', 'ente-turismo-tucuman')->first();
        $secretariaCultura = Organization::where('slug', 'secretaria-cultura')->first();
        $sheraton = Organization::where('slug', 'sheraton-tucuman')->first();
        $laRural = Organization::where('slug', 'la-rural-tucuman')->first();
        $centroVirla = Organization::where('slug', 'centro-cultural-virla')->first();
        $teatroSanMartin = Organization::where('slug', 'teatro-san-martin')->first();

        // Create Entity Admins
        $entityAdminTurismo = User::create([
            'name' => 'Ana García',
            'email' => 'ana.garcia@enteturismo.gov.ar',
            'role_id' => $entityAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $entityAdminTurismo->organizations()->attach($enteDeturismo->id);

        $entityAdminCultura = User::create([
            'name' => 'Carlos Mendoza',
            'email' => 'carlos.mendoza@cultura.gov.ar',
            'role_id' => $entityAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $entityAdminCultura->organizations()->attach($secretariaCultura->id);

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

        $organizerVirla = User::create([
            'name' => 'Laura Fernández',
            'email' => 'laura.fernandez@centrovirla.gov.ar',
            'role_id' => $organizerAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $organizerVirla->organizations()->attach($centroVirla->id);

        $organizerTeatro = User::create([
            'name' => 'Roberto Silva',
            'email' => 'roberto.silva@teatrosanmartin.gov.ar',
            'role_id' => $organizerAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $organizerTeatro->organizations()->attach($teatroSanMartin->id);

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

        // Create Entity Staff members for Secretaría de Cultura
        $staffCultura1 = User::create([
            'name' => 'Diego Martinez',
            'email' => 'diego.martinez@cultura.gov.ar',
            'role_id' => $entityStaffRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
        $staffCultura1->organizations()->attach($secretariaCultura->id);

        $staffCultura2 = User::create([
            'name' => 'Sofía Herrera',
            'email' => 'sofia.herrera@cultura.gov.ar',
            'role_id' => $entityStaffRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
        $staffCultura2->organizations()->attach($secretariaCultura->id);

        $this->command->info('Users created successfully!');
        $this->command->info('- 1 Platform Admin');
        $this->command->info('- 2 Entity Admins');
        $this->command->info('- 4 Organizer Admins');
        $this->command->info('- 6 Entity Staff (4 Turismo + 2 Cultura)');
        $this->command->info('- 1 Suspended user for testing');
        $this->command->info('- All passwords: password123');
    }
}
