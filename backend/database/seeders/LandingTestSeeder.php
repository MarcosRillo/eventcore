<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventFormat;
use App\Models\EventStatus;
use App\Models\EventType;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Landing Test Seeder
 *
 * Creates additional events specifically for landing page UI testing
 * Generates featured events and published events with realistic data
 * Uses EventFactory for data generation
 */
class LandingTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedLandingTestData();
        });
    }

    private function seedLandingTestData(): void
    {
        $this->command->info('🎨 Seeding data for Landing Page UI testing...');

        // Get required relationships
        $publishedStatus = EventStatus::where('status_code', 'published')->first();
        $enteDeturismo = Organization::where('slug', 'ente-turismo-tucuman')->first();
        $locations = Location::where('entity_id', $enteDeturismo->id)->get();
        $entityAdmin = User::where('email', 'ana.garcia@enteturismo.gov.ar')->first();

        // Get event format (what was previously called "type")
        $sedeUnicaFormat = EventFormat::where('format_code', 'sede_unica')->first();

        // Get event types and subtypes for deterministic assignment
        $eventTypes = EventType::with('subtypes')->where('is_active', true)->get();

        if (! $publishedStatus || ! $enteDeturismo || $locations->isEmpty() || $eventTypes->isEmpty()) {
            $this->command->error('❌ Missing required data. Run DatabaseSeeder first.');

            return;
        }

        // 1. CREATE 6 FEATURED EVENTS (for landing featured section)
        $this->command->info('📌 Creating 6 featured published events...');

        for ($i = 0; $i < 6; $i++) {
            $startDate = Carbon::now()->addDays(rand(5, 90))->setHour(rand(10, 20))->setMinute(0);
            $endDate = (clone $startDate)->addHours(rand(2, 8));

            // Cycle through event types and subtypes deterministically
            $typeIndex = $i % $eventTypes->count();
            $selectedType = $eventTypes[$typeIndex];
            $subtypes = $selectedType->subtypes;
            $subtypeIndex = $i % $subtypes->count();
            $selectedSubtype = $subtypes[$subtypeIndex];

            $event = Event::factory()
                ->published()
                ->featured()
                ->create([
                    'status_id' => $publishedStatus->id,
                    'entity_id' => $enteDeturismo->id,
                    'organization_id' => $enteDeturismo->id,
                    'event_type_id' => $selectedType->id,
                    'event_subtype_id' => $selectedSubtype->id,
                    'created_by' => $entityAdmin->id,
                    'format_id' => $sedeUnicaFormat->id,
                    'is_featured' => true,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'published_at' => Carbon::now()->subDays(rand(1, 10)),
                ]);

            // Attach random location
            $event->locations()->attach(
                $locations->random()->id,
                ['location_specific_notes' => 'Sede principal del evento'],
            );
        }

        // 2. CREATE 20 PUBLISHED EVENTS (non-featured, for calendar variety)
        $this->command->info('📅 Creating 20 published events (non-featured)...');

        for ($i = 0; $i < 20; $i++) {
            $startDate = Carbon::now()->addDays(rand(1, 120))->setHour(rand(8, 21))->setMinute(0);
            $endDate = (clone $startDate)->addHours(rand(1, 10));

            // Cycle through event types and subtypes deterministically
            $typeIndex = $i % $eventTypes->count();
            $selectedType = $eventTypes[$typeIndex];
            $subtypes = $selectedType->subtypes;
            $subtypeIndex = $i % $subtypes->count();
            $selectedSubtype = $subtypes[$subtypeIndex];

            $event = Event::factory()
                ->published()
                ->create([
                    'status_id' => $publishedStatus->id,
                    'entity_id' => $enteDeturismo->id,
                    'organization_id' => $enteDeturismo->id,
                    'event_type_id' => $selectedType->id,
                    'event_subtype_id' => $selectedSubtype->id,
                    'created_by' => $entityAdmin->id,
                    'format_id' => $sedeUnicaFormat->id,
                    'is_featured' => false,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'published_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);

            // Attach 1-2 random locations
            $numLocations = rand(1, 2);
            $selectedLocations = $locations->random(min($numLocations, $locations->count()));

            foreach ($selectedLocations as $location) {
                $event->locations()->attach(
                    $location->id,
                    ['location_specific_notes' => null],
                );
            }
        }

        $this->command->newLine();
        $this->command->info('✅ Landing test data created successfully!');
        $this->command->info('📊 Summary:');
        $this->command->info('  • 6 featured + published events (for landing featured section)');
        $this->command->info('  • 20 published events (for calendar and variety)');
        $this->command->info('  • All events have realistic titles, descriptions, and dates');
        $this->command->info('  • Events distributed across next 3-4 months');
        $this->command->info('  • Multiple categories and locations assigned');
        $this->command->newLine();
    }
}
