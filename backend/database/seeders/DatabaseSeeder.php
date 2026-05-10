<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Three-tier idempotency:
     * 1. Empty DB → run all seeders (first deploy).
     * 2. Users exist but no future events → wipe events + re-run EventSeeder
     *    (refreshes stale demo dates without duplicating users/orgs/locations).
     * 3. Users + future events exist → skip (data is fresh).
     */
    public function run(): void
    {
        $hasUsers = User::query()->exists();
        $hasFutureEvents = Event::query()->where('start_date', '>=', now())->exists();

        if ($hasUsers && $hasFutureEvents) {
            $this->command->info('Database has fresh demo data (future events present), skipping.');

            return;
        }

        if ($hasUsers && ! $hasFutureEvents) {
            $this->command->info('Demo events are stale (all in the past). Refreshing event data only.');
            // Wipe events + dependent pivot/audit tables to avoid FK violations.
            foreach (['event_approvals', 'event_location', 'event_service', 'event_room', 'event_async_dates'] as $table) {
                try {
                    DB::table($table)->delete();
                } catch (\Throwable $e) {
                    // Table may not exist in older deploys — safe to skip.
                }
            }
            Event::query()->delete();

            $this->call([EventSeeder::class]);
            $this->command->info('Event data refreshed with future dates.');

            return;
        }

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
