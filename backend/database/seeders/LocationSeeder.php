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
        $organization = Organization::where('slug', 'demo-organization')->first();

        $locations = [
            [
                'name' => 'Centro de Convenciones Norte',
                'address' => 'Av. Principal 1234',
                'city' => 'San Miguel de Tucumán',
                'postal_code' => '1000',
                'latitude' => -34.6037,
                'longitude' => -58.3816,
                'description' => 'Centro de convenciones moderno con capacidad para grandes eventos',
                'phone' => '+54 11 5555-0101',
                'email' => 'info@example.com',
                'additional_info' => [
                    'capacity' => 2000,
                    'has_parking' => true,
                    'has_wifi' => true,
                    'has_audio_system' => true,
                    'accessibility' => true,
                ],
            ],
            [
                'name' => 'Auditorio Principal',
                'address' => 'Calle Demo 567',
                'city' => 'San Miguel de Tucumán',
                'postal_code' => '1001',
                'latitude' => -34.5895,
                'longitude' => -58.3974,
                'description' => 'Auditorio principal con excelente acústica',
                'phone' => '+54 11 5555-0102',
                'email' => 'eventos@example.org',
                'additional_info' => [
                    'capacity' => 800,
                    'has_audio_system' => true,
                    'accessibility' => true,
                ],
            ],
            [
                'name' => 'Estadio Demo',
                'address' => 'Av. Principal 2000',
                'city' => 'San Miguel de Tucumán',
                'postal_code' => '1002',
                'latitude' => -34.6150,
                'longitude' => -58.4000,
                'description' => 'Estadio multipropósito para eventos deportivos y recitales',
                'phone' => '+54 11 5555-0103',
                'email' => 'info@example.com',
                'additional_info' => [
                    'capacity' => 30000,
                    'has_parking' => true,
                    'sports_venue' => true,
                    'concert_venue' => true,
                    'accessibility' => true,
                ],
            ],
            [
                'name' => 'Teatro Municipal',
                'address' => 'Calle Demo 100',
                'city' => 'San Miguel de Tucumán',
                'postal_code' => '1003',
                'latitude' => -34.6080,
                'longitude' => -58.3850,
                'description' => 'Teatro histórico sede de espectáculos culturales',
                'phone' => '+54 11 5555-0104',
                'email' => 'eventos@example.org',
                'additional_info' => [
                    'capacity' => 600,
                    'has_audio_system' => true,
                    'accessibility' => true,
                ],
            ],
            [
                'name' => 'Hotel Central Demo',
                'address' => 'Av. Principal 500',
                'city' => 'San Miguel de Tucumán',
                'postal_code' => '1004',
                'latitude' => -34.6000,
                'longitude' => -58.3900,
                'description' => 'Hotel céntrico con salones para eventos corporativos',
                'phone' => '+54 11 5555-0105',
                'email' => 'info@example.com',
                'additional_info' => [
                    'capacity' => 400,
                    'has_parking' => true,
                    'has_accommodation' => true,
                    'has_catering' => true,
                    'accessibility' => true,
                ],
            ],
            [
                'name' => 'Salón de Conferencias Sur',
                'address' => 'Calle Demo 890',
                'city' => 'San Miguel de Tucumán',
                'postal_code' => '1005',
                'latitude' => -34.6400,
                'longitude' => -58.4200,
                'description' => 'Salón equipado para conferencias y reuniones empresariales',
                'phone' => '+54 11 5555-0106',
                'email' => 'eventos@example.org',
                'additional_info' => [
                    'capacity' => 300,
                    'has_parking' => true,
                    'has_audio_system' => true,
                    'accessibility' => true,
                ],
            ],
            [
                'name' => 'Centro Cultural Plaza',
                'address' => 'Av. Principal 750',
                'city' => 'San Miguel de Tucumán',
                'postal_code' => '1006',
                'latitude' => -34.5950,
                'longitude' => -58.3800,
                'description' => 'Centro cultural con salas de exposición y auditorio',
                'phone' => '+54 11 5555-0107',
                'email' => 'info@example.com',
                'additional_info' => [
                    'capacity' => 350,
                    'cultural_events' => true,
                    'has_audio_system' => true,
                    'accessibility' => true,
                ],
            ],
            [
                'name' => 'Anfiteatro al Aire Libre',
                'address' => 'Calle Demo 1200',
                'city' => 'San Miguel de Tucumán',
                'postal_code' => '1007',
                'latitude' => -34.5900,
                'longitude' => -58.4100,
                'description' => 'Anfiteatro al aire libre rodeado de naturaleza, ideal para festivales',
                'phone' => '+54 11 5555-0108',
                'email' => 'eventos@example.org',
                'additional_info' => [
                    'capacity' => 4000,
                    'outdoor_space' => true,
                    'has_stage' => true,
                    'accessibility' => true,
                ],
            ],
            [
                'name' => 'Sala Polifuncional A',
                'address' => 'Av. Principal 1800',
                'city' => 'San Miguel de Tucumán',
                'postal_code' => '1008',
                'latitude' => -34.6250,
                'longitude' => -58.3700,
                'description' => 'Sala polifuncional para eventos sociales, talleres y reuniones',
                'phone' => '+54 11 5555-0109',
                'email' => 'info@example.com',
                'additional_info' => [
                    'capacity' => 200,
                    'has_audio_system' => true,
                    'accessibility' => true,
                ],
            ],
            [
                'name' => 'Espacio Eventos Río',
                'address' => 'Calle Demo 2500',
                'city' => 'San Miguel de Tucumán',
                'postal_code' => '1009',
                'latitude' => -34.6500,
                'longitude' => -58.4450,
                'description' => 'Espacio para eventos con vista panorámica y áreas verdes',
                'phone' => '+54 11 5555-0110',
                'email' => 'eventos@example.org',
                'additional_info' => [
                    'capacity' => 500,
                    'has_parking' => true,
                    'outdoor_space' => true,
                    'accessibility' => true,
                ],
            ],
        ];

        foreach ($locations as $locationData) {
            Location::create(array_merge($locationData, [
                'state' => 'Tucumán',
                'country' => 'Argentina',
                'is_active' => true,
                'entity_id' => $organization->id,
            ]));
        }

        $this->command->info('Locations created successfully!');
        $this->command->info('- 10 demo locations created');
    }
}
