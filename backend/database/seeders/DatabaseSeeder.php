<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('Starting database seeding...');
        $this->command->info('Creating dataset for Demo Organization');
        $this->command->newLine();

        // Run seeders in correct order (respecting foreign key dependencies)
        $this->call([
            // 1. Lookup tables first (no dependencies)
            UserRolesSeeder::class,
            OrganizationStatusesSeeder::class,
            OrganizationTypesSeeder::class,
            EventStatusesSeeder::class,
            EventTypesSeeder::class,
            EventLookupSeeder::class,

            // 2. Main tables with foreign key dependencies
            OrganizationSeeder::class,
            UserSeeder::class,
            LocationSeeder::class,
            EventTypeSeeder::class,
            SectorSeeder::class,
            EventSeeder::class,
        ]);

        $this->command->newLine();
        $this->command->info('Database seeding completed successfully!');
        $this->command->newLine();

        $this->command->info('LOGIN CREDENTIALS:');
        $this->command->info('-------------------------------------------------------');
        $this->command->info('Platform Admin: marcos@plataforma.com');
        $this->command->info('Entity Admin: admin@example.com');
        $this->command->info('Organizer (Hotel Central Demo): organizer@example.com');
        $this->command->info('Organizer (Centro de Convenciones Norte): organizer2@example.com');
        $this->command->info('All passwords from SEED_DEMO_PASSWORD env var (default: demo1234)');
        $this->command->newLine();

        $this->command->info('DATASET SUMMARY:');
        $this->command->info('-------------------------------------------------------');
        $this->command->info('- 1 Primary Entity (Demo Organization)');
        $this->command->info('- 2 Event Organizers (Hotel Central Demo + Centro de Convenciones Norte)');
        $this->command->info('- 8 Users: 1 platform_admin, 1 entity_admin, 2 organizer_admin, 4 entity_staff');
        $this->command->info('- 60 Locations');
        $this->command->info('- ~154 Events (all workflow statuses + EventApproval audit trail)');
        $this->command->info('- 1 Suspended user (staff-suspended@example.com) for testing');
        $this->command->newLine();
    }
}
