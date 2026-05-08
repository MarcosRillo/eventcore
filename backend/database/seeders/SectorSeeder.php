<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Sector;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SectorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedSectors();
        });
    }

    private function seedSectors(): void
    {
        // Get the main tourism entity
        $enteTurismo = Organization::where('slug', 'demo-organization')->first();

        if (! $enteTurismo) {
            $this->command->warn('Demo Organization not found. Skipping Sector seeding.');

            return;
        }

        $sectors = [
            'Hotel',
            'Restaurante',
            'Agencia de Turismo',
            'Museo',
            'Centro Cultural',
            'Entretenimiento',
            'Deportes',
            'Educación',
            'Gobierno',
            'ONG',
            'Otro',
        ];

        $count = 0;

        foreach ($sectors as $sectorName) {
            Sector::create([
                'name' => $sectorName,
                'entity_id' => $enteTurismo->id,
                'is_active' => true,
            ]);
            $count++;
        }

        $this->command->info("Sectors created successfully! ({$count} sectors)");
    }
}
