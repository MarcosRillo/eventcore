<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\Organization;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixOrphanOrganizations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'organizations:fix-orphans {--dry-run : Show what would be changed without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Asigna parent_id a organizaciones huérfanas (type=event_organizer sin parent)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Get default primary entity (Ente de Turismo)
        $defaultEntity = Organization::whereNull('parent_id')
            ->whereHas('type', fn ($q) => $q->where('type_code', 'primary_entity'))
            ->first();

        if (! $defaultEntity) {
            $this->error('No se encontró entidad primaria por defecto');

            return 1;
        }

        $this->info("Entidad primaria por defecto: {$defaultEntity->name} (ID: {$defaultEntity->id})");

        // Find orphan organizations (event_organizer without parent_id)
        $orphans = Organization::whereNull('parent_id')
            ->whereHas('type', fn ($q) => $q->where('type_code', 'event_organizer'))
            ->get();

        if ($orphans->isEmpty()) {
            $this->info('No hay organizaciones huérfanas para corregir');

            return 0;
        }

        $this->info("Encontradas {$orphans->count()} organizaciones huérfanas");

        if ($this->option('dry-run')) {
            $this->warn('Modo dry-run: no se realizarán cambios');
            $this->newLine();

            foreach ($orphans as $org) {
                $eventCount = Event::where('organization_id', $org->id)->count();
                $this->line("  - {$org->name} (ID: {$org->id}) → parent_id: {$defaultEntity->id}");
                $this->line("    Eventos a actualizar: {$eventCount}");
            }

            return 0;
        }

        // Update organizations and their events
        DB::transaction(function () use ($orphans, $defaultEntity) {
            foreach ($orphans as $org) {
                // 1. Update organization's parent_id
                $org->update(['parent_id' => $defaultEntity->id]);

                // 2. Update entity_id for events of this organization
                $updatedEvents = Event::where('organization_id', $org->id)
                    ->update(['entity_id' => $defaultEntity->id]);

                $this->info("✓ {$org->name}: parent_id actualizado, {$updatedEvents} eventos corregidos");
            }
        });

        $this->newLine();
        $this->info('Proceso completado exitosamente');

        return 0;
    }
}
