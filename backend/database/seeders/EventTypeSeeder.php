<?php

namespace Database\Seeders;

use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedEventTypesAndSubtypes();
        });
    }

    private function seedEventTypesAndSubtypes(): void
    {
        // Get the main tourism entity
        $enteTurismo = Organization::where('slug', 'ente-turismo-tucuman')->first();

        if (! $enteTurismo) {
            $this->command->warn('Ente de Turismo not found. Skipping EventType seeding.');

            return;
        }

        // Define event types with their colors and subtypes
        $typesWithSubtypes = [
            'Festivales' => [
                'color' => '#8B5CF6',  // Purple
                'subtypes' => [
                    'Festival de Música',
                    'Festival Gastronómico',
                    'Festival Cultural',
                    'Festival Folclórico',
                ],
            ],
            'Deportes' => [
                'color' => '#10B981',  // Green
                'subtypes' => [
                    'Competencia',
                    'Maratón',
                    'Torneo',
                    'Exhibición Deportiva',
                ],
            ],
            'Cultura' => [
                'color' => '#F59E0B',  // Orange
                'subtypes' => [
                    'Exposición de Arte',
                    'Teatro',
                    'Concierto',
                    'Danza',
                ],
            ],
            'Turismo' => [
                'color' => '#3B82F6',  // Blue
                'subtypes' => [
                    'Tour Guiado',
                    'Excursión',
                    'Ruta Turística',
                    'Experiencia Gastronómica',
                ],
            ],
            'Ferias' => [
                'color' => '#EF4444',  // Red
                'subtypes' => [
                    'Feria Artesanal',
                    'Feria del Libro',
                    'Feria Productiva',
                    'Expo Comercial',
                ],
            ],
            'Conferencias' => [
                'color' => '#6366F1',  // Indigo
                'subtypes' => [
                    'Congreso',
                    'Seminario',
                    'Workshop',
                    'Charla',
                ],
            ],
        ];

        $typesCreated = 0;
        $subtypesCreated = 0;

        foreach ($typesWithSubtypes as $typeName => $typeData) {
            // Create event type
            $eventType = EventType::create([
                'name' => $typeName,
                'entity_id' => $enteTurismo->id,
                'color' => $typeData['color'],
                'is_active' => true,
            ]);
            $typesCreated++;

            // Create subtypes for this type
            foreach ($typeData['subtypes'] as $subtypeName) {
                EventSubtype::create([
                    'name' => $subtypeName,
                    'event_type_id' => $eventType->id,
                    'entity_id' => $enteTurismo->id,
                    'is_active' => true,
                ]);
                $subtypesCreated++;
            }
        }

        $this->command->info('Event Types and Subtypes created successfully!');
        $this->command->info("- {$typesCreated} event types created");
        $this->command->info("- {$subtypesCreated} event subtypes created");
    }
}
