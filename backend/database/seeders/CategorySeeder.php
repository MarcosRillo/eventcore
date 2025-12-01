<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Organization;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedCategories();
        });
    }

    private function seedCategories(): void
    {
        // Get organizations
        $enteDeturismo = Organization::where('slug', 'ente-turismo-tucuman')->first();
        $secretariaCultura = Organization::where('slug', 'secretaria-cultura')->first();

        // Categories for Ente de Turismo de Tucumán
        Category::create([
            'name' => 'Turismo Aventura',
            'slug' => 'turismo-aventura',
            'entity_id' => $enteDeturismo->id,
            'color' => '#FF6B35',
            'description' => 'Actividades de turismo aventura y deportes extremos',
            'is_active' => true,
        ]);

        Category::create([
            'name' => 'Turismo Gastronómico',
            'slug' => 'turismo-gastronomico',
            'entity_id' => $enteDeturismo->id,
            'color' => '#F7931E',
            'description' => 'Eventos relacionados con gastronomía y tradiciones culinarias',
            'is_active' => true,
        ]);

        Category::create([
            'name' => 'Turismo Rural',
            'slug' => 'turismo-rural',
            'entity_id' => $enteDeturismo->id,
            'color' => '#8BC34A',
            'description' => 'Actividades de turismo rural y experiencias en el campo',
            'is_active' => true,
        ]);

        // Categories for Secretaría de Cultura
        Category::create([
            'name' => 'Artes Escénicas',
            'slug' => 'artes-escenicas',
            'entity_id' => $secretariaCultura->id,
            'color' => '#9C27B0',
            'description' => 'Teatro, danza, música y otras artes escénicas',
            'is_active' => true,
        ]);

        Category::create([
            'name' => 'Patrimonio Cultural',
            'slug' => 'patrimonio-cultural',
            'entity_id' => $secretariaCultura->id,
            'color' => '#795548',
            'description' => 'Eventos relacionados con patrimonio histórico y cultural',
            'is_active' => true,
        ]);

        $this->command->info('Categories created successfully!');
        $this->command->info('- 3 categories created for Ente de Turismo');
        $this->command->info('- 2 categories created for Secretaría de Cultura');
        $this->command->info('- All categories are properly linked to their entities');
    }
}
