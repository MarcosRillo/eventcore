<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\OrganizationStatus;
use App\Models\OrganizationType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedOrganizations();
        });
    }

    private function seedOrganizations(): void
    {
        // Get status and type IDs
        $activeStatus = OrganizationStatus::where('status_code', 'active')->first();
        $primaryEntityType = OrganizationType::where('type_code', 'primary_entity')->first();
        $eventOrganizerType = OrganizationType::where('type_code', 'event_organizer')->first();

        // Create Primary Entities (Entidades Principales)
        $enteDeturismo = Organization::create([
            'name' => 'Ente de Turismo de Tucumán',
            'cuit' => '30-70000001-5',
            'description' => 'Organismo público encargado de promover el turismo en la provincia de Tucumán',
            'status_id' => $activeStatus->id,
            'type_id' => $primaryEntityType->id,
            'slug' => 'ente-turismo-tucuman',
        ]);

        $secretariaCultura = Organization::create([
            'name' => 'Secretaría de Cultura',
            'cuit' => '30-70000002-3',
            'description' => 'Organismo público encargado de la gestión cultural provincial',
            'status_id' => $activeStatus->id,
            'type_id' => $primaryEntityType->id,
            'slug' => 'secretaria-cultura',
        ]);

        // Create Event Organizers for Ente de Turismo
        Organization::create([
            'name' => 'Sheraton Tucumán Hotel',
            'cuit' => '30-70000003-1',
            'description' => 'Hotel cinco estrellas que organiza eventos corporativos y sociales',
            'status_id' => $activeStatus->id,
            'type_id' => $eventOrganizerType->id,
            'parent_id' => $enteDeturismo->id,
            'slug' => 'sheraton-tucuman',
        ]);

        Organization::create([
            'name' => 'La Rural Tucumán',
            'cuit' => '30-70000004-9',
            'description' => 'Sociedad Rural organizadora de ferias agropecuarias y eventos del sector',
            'status_id' => $activeStatus->id,
            'type_id' => $eventOrganizerType->id,
            'parent_id' => $enteDeturismo->id,
            'slug' => 'la-rural-tucuman',
        ]);

        // Create Event Organizers for Secretaría de Cultura
        Organization::create([
            'name' => 'Centro Cultural Virla',
            'cuit' => '30-70000005-7',
            'description' => 'Centro cultural que organiza eventos artísticos y culturales',
            'status_id' => $activeStatus->id,
            'type_id' => $eventOrganizerType->id,
            'parent_id' => $secretariaCultura->id,
            'slug' => 'centro-cultural-virla',
        ]);

        Organization::create([
            'name' => 'Teatro San Martín',
            'cuit' => '30-70000006-5',
            'description' => 'Teatro oficial de la provincia que presenta obras y espectáculos',
            'status_id' => $activeStatus->id,
            'type_id' => $eventOrganizerType->id,
            'parent_id' => $secretariaCultura->id,
            'slug' => 'teatro-san-martin',
        ]);

        $this->command->info('Organizations created successfully!');
        $this->command->info('- 2 Primary Entities created');
        $this->command->info('- 4 Event Organizers created (2 for each entity)');
    }
}
