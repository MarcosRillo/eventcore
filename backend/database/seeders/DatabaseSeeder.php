<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting database seeding...');
        $this->command->info('📋 Creating complete test dataset with modular seeders');
        $this->command->newLine();

        // Run seeders in correct order (respecting foreign key dependencies)
        $this->call([
            // 1. Lookup tables first (no dependencies)
            UserRolesSeeder::class,
            OrganizationStatusesSeeder::class,
            OrganizationTypesSeeder::class,
            EventStatusesSeeder::class,
            EventTypesSeeder::class,
            EventLookupSeeder::class,   // 3NF lookup tables (origins, themes, frequencies, etc.)

            // 2. Main tables with foreign key dependencies
            OrganizationSeeder::class,  // Uses org statuses and types
            UserSeeder::class,          // Uses user roles and organizations
            LocationSeeder::class,      // Uses organizations
            EventTypeSeeder::class,     // Creates hierarchical EventTypes and EventSubtypes
            EventSeeder::class,         // Uses EventType/EventSubtype (3NF)

            // 3. Optional: Additional test data for UI testing
            LandingTestSeeder::class,  // 6 featured + 20 published events (uses EventType/EventSubtype)
        ]);

        $this->command->newLine();
        $this->command->info('✅ Database seeding completed successfully!');
        $this->command->info('📊 Complete dataset created with consistent relationships');
        $this->command->newLine();

        $this->command->info('🔑 LOGIN CREDENTIALS:');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('Platform Admin: marcos@plataforma.com / password123');
        $this->command->info('Entity Admin (Turismo): ana.garcia@enteturismo.gov.ar / password123');
        $this->command->info('Entity Admin (Cultura): carlos.mendoza@cultura.gov.ar / password123');
        $this->command->info('All other users also have password: password123');
        $this->command->newLine();

        $this->command->info('📈 DATASET SUMMARY:');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('• 2 Primary Entities + 4 Event Organizers');
        $this->command->info('• 13 Users: 1 platform_admin, 2 entity_admin, 4 organizer_admin, 6 entity_staff');
        $this->command->info('• 6 EventTypes with 24 EventSubtypes (3NF structure)');
        $this->command->info('• 5 Locations (3 Tourism + 2 Culture)');
        $this->command->info('• 34 Events total (8 base + 26 landing test events)');
        $this->command->info('• 1 Suspended user (fernando.ruiz@enteturismo.gov.ar) for testing');
        $this->command->info('• Complete entity-tenant isolation for multi-tenant testing');
        $this->command->newLine();

        $this->command->info('👥 PANEL /users TEST:');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('Login as ana.garcia@enteturismo.gov.ar to see 4 entity_staff');
        $this->command->info('Login as carlos.mendoza@cultura.gov.ar to see 2 entity_staff');
        $this->command->newLine();

        $this->command->info('💡 TIP: For landing page UI testing with more events:');
        $this->command->info('   php artisan db:seed --class=LandingTestSeeder');
        $this->command->info('   (Adds 6 featured + 20 published events)');
        $this->command->newLine();
    }
}
