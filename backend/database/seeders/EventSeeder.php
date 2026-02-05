<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventFormat;
use App\Models\EventFrequency;
use App\Models\EventOrigin;
use App\Models\EventRotationType;
use App\Models\EventStatus;
use App\Models\EventSubtype;
use App\Models\EventTheme;
use App\Models\EventType;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class EventSeeder extends Seeder
{
    private array $seedImagePool = [];

    /**
     * Run the database seeds.
     * Creates sample events with proper 3NF relationships.
     */
    public function run(): void
    {
        $this->downloadSeedImages();

        DB::transaction(function () {
            $this->seedEvents();
        });
    }

    /**
     * Download seed images from Lorem Picsum before the transaction.
     */
    private function downloadSeedImages(int $count = 15): void
    {
        $disk = Storage::disk('public');
        $disk->deleteDirectory('events/seed');
        $disk->makeDirectory('events/seed');

        for ($i = 0; $i < $count; $i++) {
            try {
                $response = Http::timeout(10)
                    ->connectTimeout(5)
                    ->get('https://picsum.photos/480/360.webp');

                if ($response->successful()) {
                    $filename = "seed_{$i}.webp";
                    $disk->put("events/seed/{$filename}", $response->body());
                    $this->seedImagePool[] = "/storage/events/seed/{$filename}";
                }
            } catch (\Exception $e) {
                if ($i === 0) {
                    $this->command->warn('Could not download seed images from picsum.photos — events will have no images.');

                    return;
                }
            }
        }

        $this->command->info("Downloaded {$count} seed images from picsum.photos");
    }

    /**
     * Get a random image path from the pool, or null if empty.
     */
    private function getRandomSeedImage(): ?string
    {
        if (empty($this->seedImagePool)) {
            return null;
        }

        return $this->seedImagePool[array_rand($this->seedImagePool)];
    }

    /**
     * Seed all events with their relationships.
     */
    private function seedEvents(): void
    {
        // Get event statuses
        $publishedStatus = EventStatus::where('status_code', 'published')->first();
        $approvedInternalStatus = EventStatus::where('status_code', 'approved_internal')->first();
        $pendingInternalStatus = EventStatus::where('status_code', 'pending_internal_approval')->first();
        $pendingPublicStatus = EventStatus::where('status_code', 'pending_public_approval')->first();
        $draftStatus = EventStatus::where('status_code', 'draft')->first();

        // Get event formats
        $multiSedeFormat = EventFormat::where('format_code', 'multi_sede')->first();
        $sedeUnicaFormat = EventFormat::where('format_code', 'sede_unica')->first();

        // Get 3NF lookup values
        $originLocal = EventOrigin::where('code', 'local')->first();
        $originNational = EventOrigin::where('code', 'national')->first();

        $themeGastronomico = EventTheme::where('code', 'gastronomico')->first();
        $themeDeportivo = EventTheme::where('code', 'deportivo')->first();
        $themeNegocios = EventTheme::where('code', 'negocios')->first();

        $frequencyUnico = EventFrequency::where('code', 'unico')->first();
        $frequencyAnual = EventFrequency::where('code', 'anual')->first();

        $rotationFijo = EventRotationType::where('code', 'fijo')->first();
        $rotationRotativo = EventRotationType::where('code', 'rotativo')->first();

        // Get organizations
        $enteDeturismo = Organization::where('slug', 'ente-turismo-tucuman')->first();
        $sheratonHotel = Organization::where('slug', 'sheraton-tucuman')->first();
        $laRural = Organization::where('slug', 'la-rural-tucuman')->first();

        // Get Entity Admin
        $entityAdminTurismo = User::where('email', 'ana.garcia@enteturismo.gov.ar')->first();

        // Get event types and subtypes
        $festivalesType = EventType::where('name', 'Festivales')->first();
        $turismoType = EventType::where('name', 'Turismo')->first();
        $conferenciasType = EventType::where('name', 'Conferencias')->first();

        $gastronomicoSubtype = EventSubtype::where('event_type_id', $festivalesType->id)
            ->where('name', 'Festival Gastronómico')->first();
        $excursionSubtype = EventSubtype::where('event_type_id', $turismoType->id)
            ->where('name', 'Tour Guiado')->first();
        $rutaTuristicaSubtype = EventSubtype::where('event_type_id', $turismoType->id)
            ->where('name', 'Ruta Turística')->first();
        $workshopSubtype = $conferenciasType?->subtypes()
            ->where('name', 'Workshop')->first();

        // Get locations
        $ubicacionesTurismo = Location::where('entity_id', $enteDeturismo->id)->get();

        // Get academic theme for workshops
        $themeAcademico = DB::table('event_themes')->where('name', 'academico')->first();

        // =====================================================
        // EVENTOS PROPIOS DEL ENTE DE TURISMO (3)
        // =====================================================

        $eventoTurismo1 = Event::create([
            'title' => 'Festival Gastronómico de Tucumán 2025',
            'description' => 'Gran festival que celebra la rica tradición culinaria tucumana con la participación de los mejores chefs locales, degustaciones de platos típicos, talleres de cocina y espectáculos musicales folclóricos.',
            'start_date' => Carbon::now()->addDays(30)->setHour(18)->setMinute(0),
            'end_date' => Carbon::now()->addDays(32)->setHour(23)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $multiSedeFormat->id,
            'featured_image' => $this->getRandomSeedImage(),
            'is_featured' => true,
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $gastronomicoSubtype->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeGastronomico->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '15',
        ]);

        if ($ubicacionesTurismo->count() > 0) {
            $locationIds = [];
            $locationIds[$ubicacionesTurismo->first()->id] = ['location_specific_notes' => 'Zona gastronómica principal'];
            if ($ubicacionesTurismo->count() > 1) {
                $locationIds[$ubicacionesTurismo->skip(1)->first()->id] = ['location_specific_notes' => 'Escenario musical'];
            }
            $eventoTurismo1->locations()->attach($locationIds);
        }

        $eventoTurismo2 = Event::create([
            'title' => 'Expedición Aventura - Cerro San Javier',
            'description' => 'Actividad de turismo aventura que incluye trekking, rappel y tirolesa en el hermoso Cerro San Javier. Una experiencia única para conectar con la naturaleza tucumana.',
            'start_date' => Carbon::now()->addDays(15)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(15)->setHour(17)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'featured_image' => $this->getRandomSeedImage(),
            'is_featured' => false,
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $excursionSubtype->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeDeportivo->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '3',
        ]);

        if ($ubicacionesTurismo->count() > 2) {
            $eventoTurismo2->locations()->attach([
                $ubicacionesTurismo->skip(2)->first()->id => ['location_specific_notes' => 'Punto de encuentro'],
            ]);
        }

        $eventoTurismo3 = Event::create([
            'title' => 'Ruta del Dulce Regional',
            'description' => 'Recorrido por las principales fincas productoras de dulces artesanales de Tucumán. Incluye degustación de dulce de cayote, mamón, batata y otros productos tradicionales.',
            'start_date' => Carbon::now()->addDays(45)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(45)->setHour(18)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'featured_image' => $this->getRandomSeedImage(),
            'is_featured' => false,
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $rutaTuristicaSubtype->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeGastronomico->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '8',
        ]);

        if ($ubicacionesTurismo->count() > 0) {
            $eventoTurismo3->locations()->attach([
                $ubicacionesTurismo->first()->id => ['location_specific_notes' => 'Punto de salida del tour'],
            ]);
        }

        // =====================================================
        // EVENTOS DE ORGANIZADORES EXTERNOS (4)
        // =====================================================

        // Event from Sheraton Hotel (pending internal approval)
        if ($sheratonHotel) {
            $eventoSheraton = Event::create([
                'title' => 'Cena de Gala San Valentín 2025',
                'description' => 'Elegante cena de gala para celebrar San Valentín en el hotel más exclusivo de Tucumán. Incluye menú gourmet de cinco tiempos, música en vivo y vista panorámica de la ciudad.',
                'start_date' => Carbon::now()->addDays(25)->setHour(20)->setMinute(0),
                'end_date' => Carbon::now()->addDays(25)->setHour(23)->setMinute(30),
                'status_id' => $pendingInternalStatus->id,
                'format_id' => $sedeUnicaFormat->id,
                'featured_image' => $this->getRandomSeedImage(),
                'is_featured' => false,
                'organization_id' => $sheratonHotel->id,
                'entity_id' => $enteDeturismo->id,
                'created_by' => null,
                'event_type_id' => $festivalesType->id,
                'event_subtype_id' => $gastronomicoSubtype->id,
                'origin_id' => $originLocal->id,
                'theme_id' => $themeGastronomico->id,
                'frequency_id' => $frequencyAnual->id,
                'rotation_type_id' => $rotationFijo->id,
                'edition_number' => '10',
            ]);

            if ($ubicacionesTurismo->count() > 0) {
                $eventoSheraton->locations()->attach([
                    $ubicacionesTurismo->first()->id => [
                        'location_specific_notes' => 'Evento en salón principal del hotel',
                        'max_attendees_for_location' => 150,
                    ],
                ]);
            }
        }

        // Event from La Rural (approved internally)
        if ($laRural) {
            $eventoRural = Event::create([
                'title' => 'Feria Agropecuaria del Norte 2025',
                'description' => 'Gran feria que reúne a productores agropecuarios del norte argentino. Exposición de ganado, maquinaria agrícola, productos regionales y conferencias técnicas del sector.',
                'start_date' => Carbon::now()->addDays(50)->setHour(8)->setMinute(0),
                'end_date' => Carbon::now()->addDays(53)->setHour(18)->setMinute(0),
                'status_id' => $approvedInternalStatus->id,
                'format_id' => $multiSedeFormat->id,
                'featured_image' => $this->getRandomSeedImage(),
                'is_featured' => true,
                'organization_id' => $laRural->id,
                'entity_id' => $enteDeturismo->id,
                'created_by' => null,
                'event_type_id' => $turismoType->id,
                'event_subtype_id' => $rutaTuristicaSubtype->id,
                'origin_id' => $originNational->id,
                'theme_id' => $themeNegocios->id,
                'frequency_id' => $frequencyAnual->id,
                'rotation_type_id' => $rotationRotativo->id,
                'edition_number' => '42',
            ]);

            if ($ubicacionesTurismo->count() > 0) {
                $eventoRural->locations()->attach([
                    $ubicacionesTurismo->first()->id => [
                        'location_specific_notes' => 'Uso completo del predio ferial',
                        'max_attendees_for_location' => 5000,
                    ],
                ]);
            }
        }

        // Draft events from organizers (for testing workflow)
        if ($sheratonHotel && $draftStatus && $conferenciasType && $workshopSubtype) {
            $workshopMarketing = Event::create([
                'title' => 'Workshop de Marketing Digital',
                'description' => 'Taller práctico de estrategias de marketing digital para el sector turístico.',
                'start_date' => Carbon::now()->addDays(20)->setHour(10)->setMinute(0),
                'end_date' => Carbon::now()->addDays(20)->setHour(18)->setMinute(0),
                'status_id' => $draftStatus->id,
                'format_id' => $sedeUnicaFormat->id,
                'featured_image' => $this->getRandomSeedImage(),
                'event_type_id' => $conferenciasType->id,
                'event_subtype_id' => $workshopSubtype->id,
                'organization_id' => $sheratonHotel->id,
                'entity_id' => $enteDeturismo->id,
                'created_by' => null,
                'origin_id' => $originLocal->id,
                'theme_id' => $themeAcademico?->id,
                'frequency_id' => $frequencyUnico->id,
                'rotation_type_id' => $rotationFijo->id,
                'edition_number' => '1',
                'local_attendance' => 50,
                'national_attendance' => 10,
                'event_website' => 'https://ejemplo.com/workshop-marketing',
                'maps_url' => 'https://maps.google.com/?q=Sheraton+Tucuman',
            ]);

            if ($ubicacionesTurismo->count() > 0) {
                $workshopMarketing->locations()->attach([
                    $ubicacionesTurismo->first()->id => [
                        'location_specific_notes' => 'Sala de conferencias nivel 2',
                        'max_attendees_for_location' => 80,
                    ],
                ]);
            }
        }

        if ($laRural && $draftStatus && $festivalesType && $gastronomicoSubtype) {
            $degustacionVinos = Event::create([
                'title' => 'Degustación de Vinos Tucumanos',
                'description' => 'Cata de vinos de las bodegas más prestigiosas de los Valles Calchaquíes.',
                'start_date' => Carbon::now()->addDays(25)->setHour(19)->setMinute(0),
                'end_date' => Carbon::now()->addDays(25)->setHour(22)->setMinute(0),
                'status_id' => $draftStatus->id,
                'format_id' => $sedeUnicaFormat->id,
                'featured_image' => $this->getRandomSeedImage(),
                'event_type_id' => $festivalesType->id,
                'event_subtype_id' => $gastronomicoSubtype->id,
                'organization_id' => $laRural->id,
                'entity_id' => $enteDeturismo->id,
                'created_by' => null,
                'origin_id' => $originLocal->id,
                'theme_id' => $themeGastronomico->id,
                'frequency_id' => $frequencyAnual->id,
                'rotation_type_id' => $rotationRotativo->id,
                'edition_number' => '6',
                'local_attendance' => 80,
                'international_attendance' => 5,
                'virtual_transmission' => false,
            ]);

            if ($ubicacionesTurismo->count() > 0) {
                $degustacionVinos->locations()->attach([
                    $ubicacionesTurismo->first()->id => [
                        'location_specific_notes' => 'Pabellón de degustaciones',
                        'max_attendees_for_location' => 120,
                    ],
                ]);
            }
        }

        // =====================================================
        // EVENTOS POR TIPO (24 total - 4 por cada EventType)
        // Para visualizar colores en calendario público
        // =====================================================

        $this->seedEventsByType(
            $publishedStatus,
            $approvedInternalStatus,
            $pendingInternalStatus,
            $pendingPublicStatus,
            $draftStatus,
            $sedeUnicaFormat,
            $multiSedeFormat,
            $originLocal,
            $originNational,
            $frequencyAnual,
            $frequencyUnico,
            $rotationFijo,
            $rotationRotativo,
            $enteDeturismo,
            $sheratonHotel,
            $laRural,
            $entityAdminTurismo,
            $ubicacionesTurismo
        );

        $this->command->info('Events created successfully!');
        $this->command->info('- 3 events created for Ente de Turismo (Internal)');
        $this->command->info('- 2 events created by Sheraton Hotel');
        $this->command->info('- 2 events created by La Rural Tucumán');
        $this->command->info('- 24 events created by EventType (4 per type, includes pending_public_approval)');
        $this->command->info('- 31 total events across all statuses');
        $this->command->info('- All events have 3NF lookup relationships');
    }

    /**
     * Seed 4 events for each EventType to showcase colors in the calendar.
     */
    private function seedEventsByType(
        EventStatus $publishedStatus,
        EventStatus $approvedInternalStatus,
        EventStatus $pendingInternalStatus,
        ?EventStatus $pendingPublicStatus,
        EventStatus $draftStatus,
        EventFormat $sedeUnicaFormat,
        EventFormat $multiSedeFormat,
        EventOrigin $originLocal,
        EventOrigin $originNational,
        EventFrequency $frequencyAnual,
        EventFrequency $frequencyUnico,
        EventRotationType $rotationFijo,
        EventRotationType $rotationRotativo,
        Organization $enteDeturismo,
        ?Organization $sheratonHotel,
        ?Organization $laRural,
        ?User $entityAdminTurismo,
        $ubicacionesTurismo
    ): void {
        // Get themes
        $themeCultural = EventTheme::where('code', 'cultural')->first();
        $themeMusical = EventTheme::where('code', 'musical')->first();
        $themeDeportivo = EventTheme::where('code', 'deportivo')->first();
        $themeGastronomico = EventTheme::where('code', 'gastronomico')->first();
        $themeNegocios = EventTheme::where('code', 'negocios')->first();
        $themeAcademico = EventTheme::where('code', 'academico')->first();
        $themeSocial = EventTheme::where('code', 'social')->first();

        // Use pending_public_approval for some types, pending_internal for others
        $pendingStatusForDeportes = $pendingPublicStatus ?? $pendingInternalStatus;
        $pendingStatusForCultura = $pendingPublicStatus ?? $pendingInternalStatus;
        $pendingStatusForConferencias = $pendingPublicStatus ?? $pendingInternalStatus;

        // Distribute events across available locations
        $locationCount = $ubicacionesTurismo->count();
        $defaultLocation = $ubicacionesTurismo->first();

        // =====================================================
        // FESTIVALES (4 eventos - #8B5CF6)
        // =====================================================
        $festivalesType = EventType::where('name', 'Festivales')->first();
        $festivalesSubtypes = $festivalesType->subtypes;

        // Helper to get a location by index, cycling through available locations
        $getLocation = function (int $index) use ($ubicacionesTurismo, $locationCount, $defaultLocation) {
            if ($locationCount === 0) {
                return null;
            }

            return $ubicacionesTurismo->values()->get($index % $locationCount) ?? $defaultLocation;
        };

        $locationIndex = 0;

        // 1. Festival de Rock Tucumano 2025 (Festival de Música) - Published
        $festivalRock = Event::create([
            'title' => 'Festival de Rock Tucumano 2025',
            'description' => 'El festival de rock más grande del norte argentino. Bandas locales, nacionales e internacionales en un evento de tres días con múltiples escenarios.',
            'start_date' => Carbon::now()->addDays(20)->setHour(18)->setMinute(0),
            'end_date' => Carbon::now()->addDays(22)->setHour(2)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => true,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesSubtypes->where('name', 'Festival de Música')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'theme_id' => $themeMusical->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '8',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $festivalRock->locations()->attach($loc->id, ['location_specific_notes' => 'Escenario principal']);
        }

        // 2. Fiesta de la Empanada 2025 (Festival Gastronómico) - Approved
        $fiestaEmpanada = Event::create([
            'title' => 'Fiesta de la Empanada 2025',
            'description' => 'Celebración de la empanada tucumana con competencias de cocina, degustaciones y espectáculos folclóricos. El evento gastronómico más importante de la provincia.',
            'start_date' => Carbon::now()->addDays(35)->setHour(11)->setMinute(0),
            'end_date' => Carbon::now()->addDays(36)->setHour(23)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesSubtypes->where('name', 'Festival Gastronómico')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeGastronomico->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '45',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $fiestaEmpanada->locations()->attach($loc->id, ['location_specific_notes' => 'Plaza central']);
        }

        // 3. Festival del Poncho 2025 (Festival Cultural) - Pending
        $festivalPoncho = Event::create([
            'title' => 'Festival del Poncho 2025',
            'description' => 'Celebración de la artesanía textil y la cultura del norte argentino. Exposición de ponchos artesanales, música folclórica y gastronomía regional.',
            'start_date' => Carbon::now()->addDays(50)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(52)->setHour(22)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesSubtypes->where('name', 'Festival Cultural')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'theme_id' => $themeCultural->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '52',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $festivalPoncho->locations()->attach($loc->id, ['location_specific_notes' => 'Predio ferial']);
        }

        // 4. Encuentro de Folclore del NOA (Festival Folclórico) - Draft
        $encuentroFolclore = Event::create([
            'title' => 'Encuentro de Folclore del NOA',
            'description' => 'Gran encuentro de músicos, bailarines y artistas folclóricos de todo el noroeste argentino. Peñas, talleres y espectáculos.',
            'start_date' => Carbon::now()->addDays(65)->setHour(19)->setMinute(0),
            'end_date' => Carbon::now()->addDays(67)->setHour(3)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesSubtypes->where('name', 'Festival Folclórico')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'theme_id' => $themeMusical->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '12',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $encuentroFolclore->locations()->attach($loc->id, ['location_specific_notes' => 'Anfiteatro municipal']);
        }

        // =====================================================
        // DEPORTES (4 eventos - #10B981)
        // =====================================================
        $deportesType = EventType::where('name', 'Deportes')->first();
        $deportesSubtypes = $deportesType->subtypes;

        // 1. Campeonato Regional de Fútbol (Competencia) - Published
        $campeonatoFutbol = Event::create([
            'title' => 'Campeonato Regional de Fútbol 2025',
            'description' => 'Torneo de fútbol que reúne a los mejores equipos del norte argentino. Categorías juveniles y mayores con premios en efectivo.',
            'start_date' => Carbon::now()->addDays(18)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(19)->setHour(20)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => true,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesSubtypes->where('name', 'Competencia')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'theme_id' => $themeDeportivo->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '15',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $campeonatoFutbol->locations()->attach($loc->id, ['location_specific_notes' => 'Estadio municipal']);
        }

        // 2. Maratón Cerro San Javier 2025 (Maratón) - Approved
        $maratonSanJavier = Event::create([
            'title' => 'Maratón Cerro San Javier 2025',
            'description' => 'Carrera de montaña por las laderas del Cerro San Javier. Recorridos de 10K, 21K y 42K con vistas espectaculares de las Yungas tucumanas.',
            'start_date' => Carbon::now()->addDays(28)->setHour(6)->setMinute(30),
            'end_date' => Carbon::now()->addDays(28)->setHour(14)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesSubtypes->where('name', 'Maratón')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeDeportivo->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '7',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $maratonSanJavier->locations()->attach($loc->id, ['location_specific_notes' => 'Punto de partida y llegada']);
        }

        // 3. Torneo de Tenis Amateur (Torneo) - Pending Public Approval
        $torneoTenis = Event::create([
            'title' => 'Torneo de Tenis Amateur Tucumán',
            'description' => 'Competencia de tenis para jugadores amateur de todas las edades. Categorías individuales y dobles.',
            'start_date' => Carbon::now()->addDays(42)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(44)->setHour(19)->setMinute(0),
            'status_id' => $pendingStatusForDeportes->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesSubtypes->where('name', 'Torneo')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeDeportivo->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '3',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $torneoTenis->locations()->attach($loc->id, ['location_specific_notes' => 'Club de tenis local']);
        }

        // 4. Exhibición de Gimnasia Artística (Exhibición Deportiva) - Draft
        $exhibicionGimnasia = Event::create([
            'title' => 'Exhibición de Gimnasia Artística',
            'description' => 'Espectáculo de gimnasia artística con atletas de nivel nacional e internacional. Demostración de técnicas y rutinas de alto rendimiento.',
            'start_date' => Carbon::now()->addDays(58)->setHour(19)->setMinute(0),
            'end_date' => Carbon::now()->addDays(58)->setHour(22)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesSubtypes->where('name', 'Exhibición Deportiva')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'theme_id' => $themeDeportivo->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $exhibicionGimnasia->locations()->attach($loc->id, ['location_specific_notes' => 'Polideportivo municipal']);
        }

        // =====================================================
        // CULTURA (4 eventos - #F59E0B)
        // =====================================================
        $culturaType = EventType::where('name', 'Cultura')->first();
        $culturaSubtypes = $culturaType->subtypes;

        // 1. Muestra de Arte Contemporáneo NOA (Exposición de Arte) - Published
        $muestraArte = Event::create([
            'title' => 'Muestra de Arte Contemporáneo NOA',
            'description' => 'Exposición de obras de artistas contemporáneos del noroeste argentino. Pinturas, esculturas e instalaciones en diálogo con la identidad regional.',
            'start_date' => Carbon::now()->addDays(12)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(42)->setHour(20)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaSubtypes->where('name', 'Exposición de Arte')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'theme_id' => $themeCultural->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '5',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $muestraArte->locations()->attach($loc->id, ['location_specific_notes' => 'Museo provincial de bellas artes']);
        }

        // 2. Teatro al Aire Libre - Clásicos (Teatro) - Approved
        $teatroAireLibre = Event::create([
            'title' => 'Teatro al Aire Libre - Clásicos Argentinos',
            'description' => 'Ciclo de obras de teatro clásico argentino presentadas al aire libre. Funciones gratuitas con los mejores elencos tucumanos.',
            'start_date' => Carbon::now()->addDays(25)->setHour(20)->setMinute(30),
            'end_date' => Carbon::now()->addDays(25)->setHour(23)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaSubtypes->where('name', 'Teatro')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeCultural->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '10',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $teatroAireLibre->locations()->attach($loc->id, ['location_specific_notes' => 'Parque 9 de Julio']);
        }

        // 3. Orquesta Sinfónica de Tucumán (Concierto) - Pending Public Approval
        $orquestaSinfonica = Event::create([
            'title' => 'Orquesta Sinfónica de Tucumán - Gala de Invierno',
            'description' => 'Concierto de gala con la Orquesta Sinfónica Provincial interpretando obras de Beethoven, Tchaikovsky y compositores argentinos.',
            'start_date' => Carbon::now()->addDays(48)->setHour(20)->setMinute(0),
            'end_date' => Carbon::now()->addDays(48)->setHour(23)->setMinute(0),
            'status_id' => $pendingStatusForCultura->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaSubtypes->where('name', 'Concierto')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeMusical->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '25',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $orquestaSinfonica->locations()->attach($loc->id, ['location_specific_notes' => 'Teatro San Martín']);
        }

        // 4. Ballet Folclórico Tucumano (Danza) - Draft
        $balletFolclorico = Event::create([
            'title' => 'Ballet Folclórico Tucumano - Raíces',
            'description' => 'Espectáculo de danza folclórica que recorre las tradiciones del norte argentino. Música en vivo y vestuario tradicional.',
            'start_date' => Carbon::now()->addDays(72)->setHour(21)->setMinute(0),
            'end_date' => Carbon::now()->addDays(72)->setHour(23)->setMinute(30),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaSubtypes->where('name', 'Danza')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeCultural->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $balletFolclorico->locations()->attach($loc->id, ['location_specific_notes' => 'Centro cultural']);
        }

        // =====================================================
        // TURISMO (4 eventos - #3B82F6)
        // =====================================================
        $turismoType = EventType::where('name', 'Turismo')->first();
        $turismoSubtypes = $turismoType->subtypes;

        // 1. City Tour Histórico San Miguel (Tour Guiado) - Published
        $cityTour = Event::create([
            'title' => 'City Tour Histórico San Miguel de Tucumán',
            'description' => 'Recorrido guiado por los sitios históricos más importantes de San Miguel de Tucumán. Casa Histórica, Plaza Independencia y edificios coloniales.',
            'start_date' => Carbon::now()->addDays(10)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(10)->setHour(13)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoSubtypes->where('name', 'Tour Guiado')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeCultural->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '20',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $cityTour->locations()->attach($loc->id, ['location_specific_notes' => 'Punto de encuentro: Plaza Independencia']);
        }

        // 2. Excursión Yungas Tucumanas (Excursión) - Approved
        $excursionYungas = Event::create([
            'title' => 'Excursión Yungas Tucumanas',
            'description' => 'Expedición de un día por la selva de las Yungas. Avistamiento de aves, flora nativa y cascadas escondidas. Incluye almuerzo regional.',
            'start_date' => Carbon::now()->addDays(22)->setHour(7)->setMinute(0),
            'end_date' => Carbon::now()->addDays(22)->setHour(18)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoSubtypes->where('name', 'Excursión')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeDeportivo->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '4',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $excursionYungas->locations()->attach($loc->id, ['location_specific_notes' => 'Salida desde plaza central']);
        }

        // 3. Ruta del Vino Tucumano (Ruta Turística) - Pending
        $rutaVino = Event::create([
            'title' => 'Ruta del Vino Tucumano',
            'description' => 'Recorrido por las bodegas de los Valles Calchaquíes tucumanos. Degustación de vinos de altura y almuerzo en viñedos.',
            'start_date' => Carbon::now()->addDays(38)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(38)->setHour(19)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoSubtypes->where('name', 'Ruta Turística')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeGastronomico->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '6',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $rutaVino->locations()->attach($loc->id, ['location_specific_notes' => 'Punto de partida del tour']);
        }

        // 4. Experiencia Gastronómica Regional (Experiencia Gastronómica) - Draft
        $experienciaGastro = Event::create([
            'title' => 'Experiencia Gastronómica Regional',
            'description' => 'Viaje culinario por los sabores del norte argentino. Visita a productores locales, clase de cocina y cena de degustación.',
            'start_date' => Carbon::now()->addDays(55)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(55)->setHour(22)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoSubtypes->where('name', 'Experiencia Gastronómica')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeGastronomico->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $experienciaGastro->locations()->attach($loc->id, ['location_specific_notes' => 'Mercado regional']);
        }

        // =====================================================
        // FERIAS (4 eventos - #EF4444)
        // =====================================================
        $feriasType = EventType::where('name', 'Ferias')->first();
        $feriasSubtypes = $feriasType->subtypes;

        // 1. Feria de Artesanos del Norte (Feria Artesanal) - Published
        $feriaArtesanos = Event::create([
            'title' => 'Feria de Artesanos del Norte',
            'description' => 'Gran feria de artesanías del noroeste argentino. Tejidos, cerámicas, cueros y joyería de los mejores artesanos de la región.',
            'start_date' => Carbon::now()->addDays(14)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(16)->setHour(21)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => true,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasSubtypes->where('name', 'Feria Artesanal')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'theme_id' => $themeCultural->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '18',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $feriaArtesanos->locations()->attach($loc->id, ['location_specific_notes' => 'Paseo de artesanos']);
        }

        // 2. Feria del Libro Tucumán 2025 (Feria del Libro) - Approved
        $feriaLibro = Event::create([
            'title' => 'Feria del Libro Tucumán 2025',
            'description' => 'El evento literario más importante de la provincia. Editoriales, autores, presentaciones de libros y actividades culturales.',
            'start_date' => Carbon::now()->addDays(32)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(40)->setHour(22)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasSubtypes->where('name', 'Feria del Libro')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeCultural->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '32',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $feriaLibro->locations()->attach($loc->id, ['location_specific_notes' => 'Centro de convenciones']);
        }

        // 3. Expo Productores Locales (Feria Productiva) - Pending
        $expoProductores = Event::create([
            'title' => 'Expo Productores Locales',
            'description' => 'Exposición de productos regionales: miel, dulces artesanales, quesos, embutidos y más. Venta directa del productor al consumidor.',
            'start_date' => Carbon::now()->addDays(45)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(47)->setHour(20)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasSubtypes->where('name', 'Feria Productiva')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeGastronomico->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '8',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $expoProductores->locations()->attach($loc->id, ['location_specific_notes' => 'Predio ferial']);
        }

        // 4. Expo Pyme Regional (Expo Comercial) - Draft
        $expoPyme = Event::create([
            'title' => 'Expo Pyme Regional NOA',
            'description' => 'Exposición comercial para pequeñas y medianas empresas del noroeste argentino. Networking, rondas de negocios y conferencias.',
            'start_date' => Carbon::now()->addDays(68)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(70)->setHour(18)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasSubtypes->where('name', 'Expo Comercial')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'theme_id' => $themeNegocios->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '4',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $expoPyme->locations()->attach($loc->id, ['location_specific_notes' => 'Centro de convenciones']);
        }

        // =====================================================
        // CONFERENCIAS (4 eventos - #6366F1)
        // =====================================================
        $conferenciasType = EventType::where('name', 'Conferencias')->first();
        $conferenciasSubtypes = $conferenciasType->subtypes;

        // 1. Congreso de Turismo Sustentable (Congreso) - Published
        $congresoTurismo = Event::create([
            'title' => 'Congreso de Turismo Sustentable NOA',
            'description' => 'Encuentro de profesionales del turismo para discutir prácticas sustentables. Ponencias, paneles y casos de éxito del turismo responsable.',
            'start_date' => Carbon::now()->addDays(16)->setHour(8)->setMinute(30),
            'end_date' => Carbon::now()->addDays(18)->setHour(18)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasSubtypes->where('name', 'Congreso')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'theme_id' => $themeAcademico->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '5',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $congresoTurismo->locations()->attach($loc->id, ['location_specific_notes' => 'Auditorio principal']);
        }

        // 2. Seminario de Innovación Tecnológica (Seminario) - Approved
        $seminarioTech = Event::create([
            'title' => 'Seminario de Innovación Tecnológica',
            'description' => 'Jornadas de actualización sobre las últimas tendencias tecnológicas aplicadas al sector turístico y empresarial.',
            'start_date' => Carbon::now()->addDays(30)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(30)->setHour(18)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasSubtypes->where('name', 'Seminario')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeNegocios->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '3',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $seminarioTech->locations()->attach($loc->id, ['location_specific_notes' => 'Sala de conferencias']);
        }

        // 3. Workshop de Marketing Digital (Workshop) - Pending Public Approval
        $workshopMktDigital = Event::create([
            'title' => 'Workshop de Marketing Digital para Turismo',
            'description' => 'Taller práctico de estrategias de marketing digital enfocado en el sector turístico. Redes sociales, SEO y publicidad online.',
            'start_date' => Carbon::now()->addDays(52)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(52)->setHour(17)->setMinute(0),
            'status_id' => $pendingStatusForConferencias->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasSubtypes->where('name', 'Workshop')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeNegocios->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $workshopMktDigital->locations()->attach($loc->id, ['location_specific_notes' => 'Aula de capacitación']);
        }

        // 4. Charla sobre Emprendedurismo (Charla) - Draft
        $charlaEmprendedurismo = Event::create([
            'title' => 'Charla: Emprender en Turismo',
            'description' => 'Charla inspiracional sobre emprendedurismo en el sector turístico. Casos de éxito locales y claves para iniciar tu negocio.',
            'start_date' => Carbon::now()->addDays(75)->setHour(18)->setMinute(0),
            'end_date' => Carbon::now()->addDays(75)->setHour(20)->setMinute(30),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $this->getRandomSeedImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasSubtypes->where('name', 'Charla')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'theme_id' => $themeNegocios->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $charlaEmprendedurismo->locations()->attach($loc->id, ['location_specific_notes' => 'Sala de eventos']);
        }
    }
}
