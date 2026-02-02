<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedLocations();
        });
    }

    private function seedLocations(): void
    {
        // Get organization
        $enteDeturismo = Organization::where('slug', 'ente-turismo-tucuman')->first();

        // Locations for Ente de Turismo de Tucumán
        Location::create([
            'name' => 'Centro de Convenciones Tucumán',
            'address' => 'Av. Soldati 330',
            'city' => 'San Miguel de Tucumán',
            'state' => 'Tucumán',
            'country' => 'Argentina',
            'postal_code' => '4000',
            'latitude' => -26.8083,
            'longitude' => -65.2176,
            'description' => 'Moderno centro de convenciones con capacidad para grandes eventos',
            'phone' => '+54 381 4300000',
            'email' => 'info@centroconvenciones.tuc.gov.ar',
            'is_active' => true,
            'entity_id' => $enteDeturismo->id,
            'additional_info' => [
                'capacity' => 2000,
                'parking_spaces' => 500,
                'has_wifi' => true,
                'has_audio_system' => true,
                'accessibility' => true,
            ],
        ]);

        Location::create([
            'name' => 'Parque 9 de Julio',
            'address' => 'Av. Aconquija s/n',
            'city' => 'San Miguel de Tucumán',
            'state' => 'Tucumán',
            'country' => 'Argentina',
            'postal_code' => '4000',
            'latitude' => -26.8167,
            'longitude' => -65.2167,
            'description' => 'Amplio parque urbano ideal para eventos al aire libre y festivales',
            'phone' => '+54 381 4300001',
            'email' => 'eventos@parque9julio.tuc.gov.ar',
            'is_active' => true,
            'entity_id' => $enteDeturismo->id,
            'additional_info' => [
                'capacity' => 10000,
                'outdoor_space' => true,
                'has_stage' => true,
                'has_restrooms' => true,
                'accessibility' => true,
            ],
        ]);

        Location::create([
            'name' => 'Complejo Turístico Tafí del Valle',
            'address' => 'Ruta Provincial 307 Km 5',
            'city' => 'Tafí del Valle',
            'state' => 'Tucumán',
            'country' => 'Argentina',
            'postal_code' => '4137',
            'latitude' => -26.8556,
            'longitude' => -65.7086,
            'description' => 'Complejo turístico en las montañas, perfecto para eventos de turismo rural',
            'phone' => '+54 3867 421000',
            'email' => 'eventos@tafiturismo.tuc.gov.ar',
            'is_active' => true,
            'entity_id' => $enteDeturismo->id,
            'additional_info' => [
                'capacity' => 300,
                'mountain_location' => true,
                'has_accommodation' => true,
                'outdoor_activities' => true,
                'accessibility' => false,
            ],
        ]);

        $this->command->info('Locations created successfully!');
        $this->command->info('- 3 locations created for Ente de Turismo');
    }
}
