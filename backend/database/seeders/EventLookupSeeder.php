<?php

namespace Database\Seeders;

use App\Models\EventFrequency;
use App\Models\EventOrigin;
use App\Models\EventService;
use App\Models\EventSubtype;
use App\Models\EventType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventLookupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seeds all lookup tables for 3NF normalization.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedOrigins();
            $this->seedFrequencies();
            $this->seedServices();
            $this->seedSubtypes();
        });
    }

    /**
     * Seed event origins.
     */
    private function seedOrigins(): void
    {
        $origins = [
            ['code' => 'local', 'name' => 'Local', 'description' => 'Evento de origen local', 'display_order' => 1],
            ['code' => 'national', 'name' => 'Nacional', 'description' => 'Evento de origen nacional', 'display_order' => 2],
            ['code' => 'international', 'name' => 'Internacional', 'description' => 'Evento de origen internacional', 'display_order' => 3],
        ];

        foreach ($origins as $origin) {
            EventOrigin::updateOrCreate(
                ['code' => $origin['code']],
                $origin,
            );
        }
    }

    /**
     * Seed event frequencies.
     */
    private function seedFrequencies(): void
    {
        $frequencies = [
            ['code' => 'unico', 'name' => 'Único', 'description' => 'Evento que ocurre una sola vez', 'display_order' => 1],
            ['code' => 'diario', 'name' => 'Diario', 'description' => 'Evento que ocurre todos los días', 'display_order' => 2],
            ['code' => 'semanal', 'name' => 'Semanal', 'description' => 'Evento que ocurre semanalmente', 'display_order' => 3],
            ['code' => 'mensual', 'name' => 'Mensual', 'description' => 'Evento que ocurre mensualmente', 'display_order' => 4],
            ['code' => 'trimestral', 'name' => 'Trimestral', 'description' => 'Evento que ocurre trimestralmente', 'display_order' => 5],
            ['code' => 'semestral', 'name' => 'Semestral', 'description' => 'Evento que ocurre semestralmente', 'display_order' => 6],
            ['code' => 'anual', 'name' => 'Anual', 'description' => 'Evento que ocurre anualmente', 'display_order' => 7],
        ];

        foreach ($frequencies as $frequency) {
            EventFrequency::updateOrCreate(
                ['code' => $frequency['code']],
                $frequency,
            );
        }
    }

    /**
     * Seed event services.
     */
    private function seedServices(): void
    {
        $services = [
            ['code' => 'coffee_break', 'name' => 'Coffee Break', 'description' => 'Servicio de refrigerio', 'display_order' => 1],
            ['code' => 'lunch', 'name' => 'Almuerzo', 'description' => 'Servicio de almuerzo', 'display_order' => 2],
            ['code' => 'dinner', 'name' => 'Cena', 'description' => 'Servicio de cena', 'display_order' => 3],
            ['code' => 'pre_event', 'name' => 'Paquete Pre-evento', 'description' => 'Servicios previos al evento', 'display_order' => 4],
            ['code' => 'post_event', 'name' => 'Paquete Post-evento', 'description' => 'Servicios posteriores al evento', 'display_order' => 5],
            ['code' => 'virtual', 'name' => 'Transmisión Virtual', 'description' => 'Transmisión en línea del evento', 'display_order' => 6],
        ];

        foreach ($services as $service) {
            EventService::updateOrCreate(
                ['code' => $service['code']],
                $service,
            );
        }
    }

    /**
     * Seed event subtypes based on event types.
     */
    private function seedSubtypes(): void
    {
        // Get existing event types
        $eventTypes = EventType::all()->keyBy('name');

        // Define subtypes for each event type
        $subtypesByType = [
            'Congreso' => [
                ['code' => 'congreso_cientifico', 'name' => 'Congreso Científico', 'display_order' => 1],
                ['code' => 'congreso_medico', 'name' => 'Congreso Médico', 'display_order' => 2],
                ['code' => 'congreso_empresarial', 'name' => 'Congreso Empresarial', 'display_order' => 3],
            ],
            'Festival' => [
                ['code' => 'festival_musica', 'name' => 'Festival de Música', 'display_order' => 1],
                ['code' => 'festival_cine', 'name' => 'Festival de Cine', 'display_order' => 2],
                ['code' => 'festival_gastronomico', 'name' => 'Festival Gastronómico', 'display_order' => 3],
                ['code' => 'festival_cultural', 'name' => 'Festival Cultural', 'display_order' => 4],
            ],
            'Feria' => [
                ['code' => 'feria_artesanal', 'name' => 'Feria Artesanal', 'display_order' => 1],
                ['code' => 'feria_comercial', 'name' => 'Feria Comercial', 'display_order' => 2],
                ['code' => 'feria_turistica', 'name' => 'Feria Turística', 'display_order' => 3],
            ],
            'Conferencia' => [
                ['code' => 'conferencia_magistral', 'name' => 'Conferencia Magistral', 'display_order' => 1],
                ['code' => 'conferencia_tecnica', 'name' => 'Conferencia Técnica', 'display_order' => 2],
                ['code' => 'conferencia_prensa', 'name' => 'Conferencia de Prensa', 'display_order' => 3],
            ],
            'Exposición' => [
                ['code' => 'exposicion_arte', 'name' => 'Exposición de Arte', 'display_order' => 1],
                ['code' => 'exposicion_industrial', 'name' => 'Exposición Industrial', 'display_order' => 2],
                ['code' => 'exposicion_fotografica', 'name' => 'Exposición Fotográfica', 'display_order' => 3],
            ],
        ];

        foreach ($subtypesByType as $typeName => $subtypes) {
            $eventType = $eventTypes->get($typeName);
            if (! $eventType) {
                continue;
            }

            foreach ($subtypes as $subtype) {
                EventSubtype::updateOrCreate(
                    [
                        'event_type_id' => $eventType->id,
                        'code' => $subtype['code'],
                    ],
                    array_merge($subtype, ['event_type_id' => $eventType->id]),
                );
            }
        }
    }
}
