<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\RegistrationRequest;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RegistrationRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates registration requests in all possible states for testing.
     */
    public function run(): void
    {
        // Ensure required lookup data exists
        $this->ensureLookupDataExists();

        $organizerRole = UserRole::where('role_code', 'organizer_admin')->first();
        $entityAdminRole = UserRole::where('role_code', 'entity_admin')->first();

        // Get or create an entity admin for reviewing requests
        $entityAdmin = User::whereHas('role', fn($q) => $q->where('role_code', 'entity_admin'))->first();
        if (!$entityAdmin && $entityAdminRole) {
            $entityAdmin = User::create([
                'name' => 'Admin Revisor',
                'email' => 'admin.revisor@enteturismo.gov.ar',
                'password' => Hash::make('password123'),
                'role_id' => $entityAdminRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
        }

        $activeStatusId = DB::table('organization_statuses')->where('status_code', 'active')->value('id');
        $suspendedStatusId = DB::table('organization_statuses')->where('status_code', 'suspended')->value('id');
        $typeId = DB::table('organization_types')->where('type_code', 'event_organizer')->value('id')
            ?? DB::table('organization_types')->first()?->id
            ?? 1;

        // ============================================
        // CASO 1: Solicitudes PENDIENTES (3)
        // ============================================

        RegistrationRequest::create([
            'dni' => '30111222',
            'first_name' => 'Pedro',
            'last_name' => 'González',
            'email' => 'pedro.gonzalez@hotelplaza.com',
            'whatsapp' => '+5493814001001',
            'organization_name' => 'Hotel Plaza Tucumán',
            'organization_cuit' => '30-70001111-1',
            'organization_sector' => 'Hotelería',
            'website' => 'https://hotelplaza.com.ar',
            'motivation' => 'Somos un hotel 4 estrellas ubicado en el centro de San Miguel de Tucumán. Queremos publicar nuestros eventos gastronómicos y culturales.',
            'status' => 'pending',
            'created_at' => now()->subDays(2),
        ]);

        RegistrationRequest::create([
            'dni' => '30222333',
            'first_name' => 'Lucía',
            'last_name' => 'Martínez',
            'email' => 'lucia@bodegasur.com.ar',
            'whatsapp' => '+5493814002002',
            'organization_name' => 'Bodega del Sur',
            'organization_cuit' => '30-70002222-2',
            'organization_sector' => 'Gastronomía y Vinos',
            'website' => 'https://bodegadelsur.com.ar',
            'motivation' => 'Bodega familiar con más de 50 años de tradición. Organizamos degustaciones, visitas guiadas y eventos especiales durante todo el año.',
            'status' => 'pending',
            'created_at' => now()->subDays(1),
        ]);

        RegistrationRequest::create([
            'dni' => '30333444',
            'first_name' => 'Martín',
            'last_name' => 'Ruiz',
            'email' => 'martin@aventuratucuman.com',
            'whatsapp' => '+5493814003003',
            'organization_name' => 'Aventura Tucumán',
            'organization_cuit' => '30-70003333-3',
            'organization_sector' => 'Turismo Aventura',
            'website' => 'https://aventuratucuman.com',
            'motivation' => 'Empresa de turismo aventura especializada en trekking, rafting y excursiones a las Yungas. Queremos promocionar nuestras salidas grupales.',
            'status' => 'pending',
            'created_at' => now()->subHours(6),
        ]);

        // ============================================
        // CASO 2: Aprobada + Usuario ACTIVO (2)
        // ============================================

        // 2.1 - Centro de Convenciones (activo)
        $orgConvenciones = Organization::create([
            'name' => 'Centro de Convenciones Norte',
            'cuit' => '30-70004444-4',
            'description' => 'Centro de convenciones y eventos corporativos',
            'status_id' => $activeStatusId,
            'type_id' => $typeId,
            'slug' => 'centro-convenciones-norte',
        ]);

        $userConvenciones = User::create([
            'name' => 'Carolina Vega',
            'email' => 'carolina@convencionesnorte.com',
            'password' => Hash::make('password123'),
            'role_id' => $organizerRole->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $userConvenciones->organizations()->attach($orgConvenciones->id);

        RegistrationRequest::create([
            'dni' => '30444555',
            'first_name' => 'Carolina',
            'last_name' => 'Vega',
            'email' => 'carolina@convencionesnorte.com',
            'whatsapp' => '+5493814004004',
            'organization_name' => 'Centro de Convenciones Norte',
            'organization_cuit' => '30-70004444-4',
            'organization_sector' => 'Eventos Corporativos',
            'website' => 'https://convencionesnorte.com',
            'motivation' => 'Somos el principal centro de convenciones del norte argentino. Realizamos eventos corporativos, congresos y exposiciones durante todo el año.',
            'status' => 'approved',
            'reviewed_by' => $entityAdmin?->id,
            'reviewed_at' => now()->subDays(10),
            'user_id' => $userConvenciones->id,
            'organization_id' => $orgConvenciones->id,
            'created_at' => now()->subDays(15),
        ]);

        // 2.2 - Restaurante Gourmet (activo)
        $orgRestaurante = Organization::create([
            'name' => 'Restaurante El Jardín Gourmet',
            'cuit' => '30-70005555-5',
            'description' => 'Restaurante de alta cocina regional',
            'status_id' => $activeStatusId,
            'type_id' => $typeId,
            'slug' => 'restaurante-jardin-gourmet',
        ]);

        $userRestaurante = User::create([
            'name' => 'Fernando Acosta',
            'email' => 'fernando@jardingourmet.com',
            'password' => Hash::make('password123'),
            'role_id' => $organizerRole->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $userRestaurante->organizations()->attach($orgRestaurante->id);

        RegistrationRequest::create([
            'dni' => '30555666',
            'first_name' => 'Fernando',
            'last_name' => 'Acosta',
            'email' => 'fernando@jardingourmet.com',
            'whatsapp' => '+5493814005005',
            'organization_name' => 'Restaurante El Jardín Gourmet',
            'organization_cuit' => '30-70005555-5',
            'organization_sector' => 'Gastronomía',
            'website' => 'https://jardingourmet.com.ar',
            'motivation' => 'Restaurante de alta cocina con especialidad en platos regionales. Organizamos cenas temáticas, clases de cocina y maridajes con vinos locales.',
            'status' => 'approved',
            'reviewed_by' => $entityAdmin?->id,
            'reviewed_at' => now()->subDays(7),
            'user_id' => $userRestaurante->id,
            'organization_id' => $orgRestaurante->id,
            'created_at' => now()->subDays(12),
        ]);

        // ============================================
        // CASO 3: Aprobada + Usuario SUSPENDIDO (2)
        // ============================================

        // 3.1 - Agencia de Viajes (suspendida)
        $orgAgencia = Organization::create([
            'name' => 'Viajes del Norte',
            'cuit' => '30-70006666-6',
            'description' => 'Agencia de viajes y turismo receptivo',
            'status_id' => $suspendedStatusId,
            'type_id' => $typeId,
            'slug' => 'viajes-del-norte',
        ]);

        $userAgencia = User::create([
            'name' => 'Ricardo Paz',
            'email' => 'ricardo@viajesdelnorte.com',
            'password' => Hash::make('password123'),
            'role_id' => $organizerRole->id,
            'status' => 'suspended',
            'email_verified_at' => now(),
        ]);
        $userAgencia->organizations()->attach($orgAgencia->id);

        RegistrationRequest::create([
            'dni' => '30666777',
            'first_name' => 'Ricardo',
            'last_name' => 'Paz',
            'email' => 'ricardo@viajesdelnorte.com',
            'whatsapp' => '+5493814006006',
            'organization_name' => 'Viajes del Norte',
            'organization_cuit' => '30-70006666-6',
            'organization_sector' => 'Turismo',
            'website' => 'https://viajesdelnorte.com.ar',
            'motivation' => 'Agencia de viajes especializada en turismo receptivo. Ofrecemos paquetes turísticos, excursiones y servicios de traslado para visitantes.',
            'status' => 'approved',
            'reviewed_by' => $entityAdmin?->id,
            'reviewed_at' => now()->subDays(20),
            'user_id' => $userAgencia->id,
            'organization_id' => $orgAgencia->id,
            'created_at' => now()->subDays(25),
        ]);

        // 3.2 - Club Deportivo (suspendido)
        $orgClub = Organization::create([
            'name' => 'Club Deportivo Tucumán',
            'cuit' => '30-70007777-7',
            'description' => 'Club deportivo y social',
            'status_id' => $suspendedStatusId,
            'type_id' => $typeId,
            'slug' => 'club-deportivo-tucuman',
        ]);

        $userClub = User::create([
            'name' => 'Gabriela Torres',
            'email' => 'gabriela@clubdeportivo.com.ar',
            'password' => Hash::make('password123'),
            'role_id' => $organizerRole->id,
            'status' => 'suspended',
            'email_verified_at' => now(),
        ]);
        $userClub->organizations()->attach($orgClub->id);

        RegistrationRequest::create([
            'dni' => '30777888',
            'first_name' => 'Gabriela',
            'last_name' => 'Torres',
            'email' => 'gabriela@clubdeportivo.com.ar',
            'whatsapp' => '+5493814007007',
            'organization_name' => 'Club Deportivo Tucumán',
            'organization_cuit' => '30-70007777-7',
            'organization_sector' => 'Deportes',
            'website' => 'https://clubdeportivotucuman.com.ar',
            'motivation' => 'Club con instalaciones deportivas de primer nivel. Organizamos torneos, eventos deportivos y actividades recreativas para toda la familia.',
            'status' => 'approved',
            'reviewed_by' => $entityAdmin?->id,
            'reviewed_at' => now()->subDays(15),
            'user_id' => $userClub->id,
            'organization_id' => $orgClub->id,
            'created_at' => now()->subDays(18),
        ]);

        // ============================================
        // CASO 4: Aprobada + Usuario ELIMINADO (soft delete) (2)
        // ============================================

        // 4.1 - Empresa de Catering (eliminada)
        $orgCatering = Organization::create([
            'name' => 'Catering Delicias',
            'cuit' => '30-70008888-8',
            'description' => 'Servicio de catering para eventos',
            'status_id' => $suspendedStatusId,
            'type_id' => $typeId,
            'slug' => 'catering-delicias',
        ]);

        $userCatering = User::create([
            'name' => 'Silvia Romero',
            'email' => 'silvia@cateringdelicias.com',
            'password' => Hash::make('password123'),
            'role_id' => $organizerRole->id,
            'status' => 'suspended',
            'email_verified_at' => now(),
        ]);
        $userCatering->organizations()->attach($orgCatering->id);

        // Soft delete
        $orgCatering->delete();
        $userCatering->delete();

        RegistrationRequest::create([
            'dni' => '30888999',
            'first_name' => 'Silvia',
            'last_name' => 'Romero',
            'email' => 'silvia@cateringdelicias.com',
            'whatsapp' => '+5493814008008',
            'organization_name' => 'Catering Delicias',
            'organization_cuit' => '30-70008888-8',
            'organization_sector' => 'Gastronomía',
            'website' => 'https://cateringdelicias.com.ar',
            'motivation' => 'Empresa de catering especializada en eventos corporativos y sociales. Ofrecemos menús personalizados y servicio integral de banquetes.',
            'status' => 'approved',
            'reviewed_by' => $entityAdmin?->id,
            'reviewed_at' => now()->subDays(30),
            'user_id' => $userCatering->id,
            'organization_id' => $orgCatering->id,
            'created_at' => now()->subDays(35),
        ]);

        // 4.2 - Productora de Eventos (eliminada)
        $orgProductora = Organization::create([
            'name' => 'Productora Espectáculos NOA',
            'cuit' => '30-70009999-9',
            'description' => 'Productora de eventos y espectáculos',
            'status_id' => $suspendedStatusId,
            'type_id' => $typeId,
            'slug' => 'productora-noa',
        ]);

        $userProductora = User::create([
            'name' => 'Miguel Ángel Sosa',
            'email' => 'miguel@productoranoa.com',
            'password' => Hash::make('password123'),
            'role_id' => $organizerRole->id,
            'status' => 'suspended',
            'email_verified_at' => now(),
        ]);
        $userProductora->organizations()->attach($orgProductora->id);

        // Soft delete
        $orgProductora->delete();
        $userProductora->delete();

        RegistrationRequest::create([
            'dni' => '30999000',
            'first_name' => 'Miguel Ángel',
            'last_name' => 'Sosa',
            'email' => 'miguel@productoranoa.com',
            'whatsapp' => '+5493814009009',
            'organization_name' => 'Productora Espectáculos NOA',
            'organization_cuit' => '30-70009999-9',
            'organization_sector' => 'Entretenimiento',
            'website' => 'https://productoranoa.com',
            'motivation' => 'Productora de espectáculos musicales, teatrales y eventos culturales. Trabajamos con artistas locales y nacionales en toda la región NOA.',
            'status' => 'approved',
            'reviewed_by' => $entityAdmin?->id,
            'reviewed_at' => now()->subDays(45),
            'user_id' => $userProductora->id,
            'organization_id' => $orgProductora->id,
            'created_at' => now()->subDays(50),
        ]);

        // ============================================
        // CASO 5: Solicitudes RECHAZADAS (2)
        // ============================================

        RegistrationRequest::create([
            'dni' => '31000111',
            'first_name' => 'Juan Carlos',
            'last_name' => 'López',
            'email' => 'jclopez@gmail.com',
            'whatsapp' => '+5493814010010',
            'organization_name' => 'Eventos Particulares JC',
            'organization_cuit' => '20-31000111-5',
            'organization_sector' => 'Eventos',
            'website' => null,
            'motivation' => 'Quiero publicar las fiestas que organizo en mi casa para mis amigos y familiares. Sería genial tener más visibilidad.',
            'status' => 'rejected',
            'reviewed_by' => $entityAdmin?->id,
            'reviewed_at' => now()->subDays(5),
            'rejection_reason' => 'La plataforma está destinada a organizaciones con actividad turística comercial. Los eventos particulares privados no califican para el registro.',
            'created_at' => now()->subDays(8),
        ]);

        RegistrationRequest::create([
            'dni' => '31111222',
            'first_name' => 'Roberto',
            'last_name' => 'Fernández',
            'email' => 'roberto.f@empresa.com',
            'whatsapp' => '+5493814011011',
            'organization_name' => 'Empresa Constructora RF',
            'organization_cuit' => '30-71111222-2',
            'organization_sector' => 'Construcción',
            'website' => 'https://constructorarf.com',
            'motivation' => 'Somos una empresa constructora y queremos publicar nuestros proyectos inmobiliarios y eventos de inauguración de obras.',
            'status' => 'rejected',
            'reviewed_by' => $entityAdmin?->id,
            'reviewed_at' => now()->subDays(3),
            'rejection_reason' => 'La actividad principal de la organización (construcción) no está relacionada con el turismo o eventos culturales. Se recomienda contactar a otros portales especializados en el sector inmobiliario.',
            'created_at' => now()->subDays(6),
        ]);

        // ============================================
        // RESUMEN
        // ============================================

        $this->command->info('');
        $this->command->info('╔══════════════════════════════════════════════════════════════╗');
        $this->command->info('║       REGISTRATION REQUEST SEEDER - TEST DATA CREATED        ║');
        $this->command->info('╠══════════════════════════════════════════════════════════════╣');
        $this->command->info('║                                                              ║');
        $this->command->info('║  📋 PENDIENTES (3)                                           ║');
        $this->command->info('║     • Hotel Plaza Tucumán                                    ║');
        $this->command->info('║     • Bodega del Sur                                         ║');
        $this->command->info('║     • Aventura Tucumán                                       ║');
        $this->command->info('║                                                              ║');
        $this->command->info('║  ✅ APROBADAS + ACTIVAS (2)                                  ║');
        $this->command->info('║     • Centro de Convenciones Norte                           ║');
        $this->command->info('║     • Restaurante El Jardín Gourmet                          ║');
        $this->command->info('║                                                              ║');
        $this->command->info('║  ⏸️  APROBADAS + SUSPENDIDAS (2)                              ║');
        $this->command->info('║     • Viajes del Norte                                       ║');
        $this->command->info('║     • Club Deportivo Tucumán                                 ║');
        $this->command->info('║                                                              ║');
        $this->command->info('║  🗑️  APROBADAS + ELIMINADAS (2)                               ║');
        $this->command->info('║     • Catering Delicias (soft deleted)                       ║');
        $this->command->info('║     • Productora Espectáculos NOA (soft deleted)             ║');
        $this->command->info('║                                                              ║');
        $this->command->info('║  ❌ RECHAZADAS (2)                                           ║');
        $this->command->info('║     • Eventos Particulares JC                                ║');
        $this->command->info('║     • Empresa Constructora RF                                ║');
        $this->command->info('║                                                              ║');
        $this->command->info('║  TOTAL: 11 solicitudes de prueba                             ║');
        $this->command->info('║                                                              ║');
        $this->command->info('║  Usuarios creados tienen password: password123               ║');
        $this->command->info('║                                                              ║');
        $this->command->info('╚══════════════════════════════════════════════════════════════╝');
        $this->command->info('');
    }

    /**
     * Ensure required lookup tables have data.
     */
    private function ensureLookupDataExists(): void
    {
        // Organization Statuses
        if (DB::table('organization_statuses')->count() === 0) {
            DB::table('organization_statuses')->insert([
                ['status_code' => 'active', 'status_name' => 'Activo', 'created_at' => now(), 'updated_at' => now()],
                ['status_code' => 'inactive', 'status_name' => 'Inactivo', 'created_at' => now(), 'updated_at' => now()],
                ['status_code' => 'suspended', 'status_name' => 'Suspendido', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // Organization Types
        if (DB::table('organization_types')->count() === 0) {
            DB::table('organization_types')->insert([
                ['type_code' => 'primary_entity', 'type_name' => 'Entidad Principal', 'created_at' => now(), 'updated_at' => now()],
                ['type_code' => 'event_organizer', 'type_name' => 'Organizador de Eventos', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // User Roles
        if (DB::table('user_roles')->count() === 0) {
            DB::table('user_roles')->insert([
                [
                    'role_code' => 'platform_admin',
                    'role_name' => 'Administrador de Plataforma',
                    'description' => 'Full access to platform',
                    'permissions' => json_encode(['manage_platform']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'role_code' => 'entity_admin',
                    'role_name' => 'Administrador del Ente',
                    'description' => 'Entity administrator',
                    'permissions' => json_encode(['manage_entity_events', 'approve_events']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'role_code' => 'organizer_admin',
                    'role_name' => 'Organizador de Eventos',
                    'description' => 'Event organizer',
                    'permissions' => json_encode(['create_events', 'manage_own_events']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }
}
