<?php

namespace Database\Seeders;

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
            $this->seedSubtypes();
        });
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
