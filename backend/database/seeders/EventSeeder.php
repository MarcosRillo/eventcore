<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventApproval;
use App\Models\EventFormat;
use App\Models\EventFrequency;
use App\Models\EventOrigin;
use App\Models\EventRotationType;
use App\Models\EventStatus;
use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Carbon\Carbon;
use Cloudinary\Cloudinary;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

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
            $this->seedAdditionalEvents();
            $this->seedExtraEvents();
            $this->seedDemoEvents();
            $this->seedEventApprovals();
        });
    }

    /**
     * Upload seed images from Lorem Picsum to Cloudinary before the transaction.
     */
    private function downloadSeedImages(int $count = 15): void
    {
        $cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('cloudinary.cloud_name'),
                'api_key' => config('cloudinary.api_key'),
                'api_secret' => config('cloudinary.api_secret'),
            ],
            'url' => ['secure' => true],
        ]);

        for ($i = 0; $i < $count; $i++) {
            try {
                $result = $cloudinary->uploadApi()->upload(
                    "https://picsum.photos/seed/event{$i}/800/450",
                    [
                        'folder' => 'events/seed',
                        'public_id' => "seed_{$i}",
                        'overwrite' => true,
                    ],
                );
                $this->seedImagePool[] = $result['secure_url'];
            } catch (\Exception $e) {
                // Fallback: use picsum direct URL
                $this->seedImagePool[] = "https://picsum.photos/seed/event{$i}/800/450";

                if ($i === 0) {
                    $this->command->warn('Could not upload seed images to Cloudinary — falling back to picsum direct URLs.');
                }
            }
        }

        $this->command->info("Uploaded {$count} seed images to Cloudinary");
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
                    'frequency_id' => $frequencyAnual->id,
                'rotation_type_id' => $rotationRotativo->id,
                'edition_number' => '6',
                'local_attendance' => 80,
                'international_attendance' => 5,
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
            $ubicacionesTurismo,
        );

        $this->command->info('Base events created: 31 events across 6 types');
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
        $ubicacionesTurismo,
    ): void {

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
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $charlaEmprendedurismo->locations()->attach($loc->id, ['location_specific_notes' => 'Sala de eventos']);
        }
    }

    /**
     * Seed ~31 additional events covering all workflow statuses.
     * Includes requires_changes, rejected, and cancelled statuses.
     */
    private function seedAdditionalEvents(): void
    {
        // Get all statuses
        $publishedStatus = EventStatus::where('status_code', 'published')->first();
        $approvedInternalStatus = EventStatus::where('status_code', 'approved_internal')->first();
        $pendingInternalStatus = EventStatus::where('status_code', 'pending_internal_approval')->first();
        $pendingPublicStatus = EventStatus::where('status_code', 'pending_public_approval')->first();
        $draftStatus = EventStatus::where('status_code', 'draft')->first();
        $requiresChangesStatus = EventStatus::where('status_code', 'requires_changes')->first();
        $rejectedStatus = EventStatus::where('status_code', 'rejected')->first();
        $cancelledStatus = EventStatus::where('status_code', 'cancelled')->first();

        // Get formats
        $sedeUnicaFormat = EventFormat::where('format_code', 'sede_unica')->first();
        $multiSedeFormat = EventFormat::where('format_code', 'multi_sede')->first();

        // Get origins
        $originLocal = EventOrigin::where('code', 'local')->first();
        $originNational = EventOrigin::where('code', 'national')->first();
        $originInternational = EventOrigin::where('code', 'international')->first();


        // Get frequencies
        $frequencyUnico = EventFrequency::where('code', 'unico')->first();
        $frequencyAnual = EventFrequency::where('code', 'anual')->first();
        $frequencyMensual = EventFrequency::where('code', 'mensual')->first();
        $frequencySemanal = EventFrequency::where('code', 'semanal')->first();

        // Get rotation types
        $rotationFijo = EventRotationType::where('code', 'fijo')->first();
        $rotationRotativo = EventRotationType::where('code', 'rotativo')->first();
        $rotationItinerante = EventRotationType::where('code', 'itinerante')->first();

        // Get organizations
        $enteDeturismo = Organization::where('slug', 'ente-turismo-tucuman')->first();
        $sheratonHotel = Organization::where('slug', 'sheraton-tucuman')->first();
        $laRural = Organization::where('slug', 'la-rural-tucuman')->first();

        // Get user
        $entityAdminTurismo = User::where('email', 'ana.garcia@enteturismo.gov.ar')->first();

        // Get event types
        $festivalesType = EventType::where('name', 'Festivales')->first();
        $deportesType = EventType::where('name', 'Deportes')->first();
        $culturaType = EventType::where('name', 'Cultura')->first();
        $turismoType = EventType::where('name', 'Turismo')->first();
        $feriasType = EventType::where('name', 'Ferias')->first();
        $conferenciasType = EventType::where('name', 'Conferencias')->first();

        // Get locations
        $ubicacionesTurismo = Location::where('entity_id', $enteDeturismo->id)->get();
        $locationCount = $ubicacionesTurismo->count();
        $defaultLocation = $ubicacionesTurismo->first();

        $getLocation = function (int $index) use ($ubicacionesTurismo, $locationCount, $defaultLocation) {
            if ($locationCount === 0) {
                return null;
            }

            return $ubicacionesTurismo->values()->get($index % $locationCount) ?? $defaultLocation;
        };

        $locationIndex = 15; // Continue from where seedEventsByType left off

        // ~25% null images (every 4th event)
        $imageCounter = 0;
        $getImage = function () use (&$imageCounter) {
            $imageCounter++;

            return ($imageCounter % 4 === 0) ? null : $this->getRandomSeedImage();
        };

        // =====================================================
        // PUBLISHED (5 new events)
        // =====================================================

        // 1. Noche de Museos Tucumán - Cultura/Exposición de Arte - Ente
        $evento = Event::create([
            'title' => 'Noche de Museos Tucumán',
            'description' => 'Recorrido nocturno por los principales museos de San Miguel de Tucumán. Entrada gratuita, intervenciones artísticas y música en vivo en cada espacio cultural.',
            'start_date' => Carbon::now()->addDays(5)->setHour(19)->setMinute(0),
            'end_date' => Carbon::now()->addDays(6)->setHour(1)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Exposición de Arte')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyMensual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '24',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Circuito de museos del centro']);
        }

        // 2. Feria de Cerveza Artesanal del NOA - Ferias/Feria Productiva - Ente
        $evento = Event::create([
            'title' => 'Feria de Cerveza Artesanal del NOA',
            'description' => 'Encuentro de cerveceros artesanales del noroeste argentino. Degustación de más de 50 variedades, food trucks y música en vivo.',
            'start_date' => Carbon::now()->addDays(12)->setHour(17)->setMinute(0),
            'end_date' => Carbon::now()->addDays(14)->setHour(23)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Feria Productiva')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '5',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Explanada principal']);
        }

        // 3. Maratón Nocturna San Miguel - Deportes/Maratón - Ente
        $evento = Event::create([
            'title' => 'Maratón Nocturna San Miguel',
            'description' => 'Carrera nocturna por las calles iluminadas de San Miguel de Tucumán. Recorridos de 5K y 10K abiertos a todo público.',
            'start_date' => Carbon::now()->addDays(7)->setHour(20)->setMinute(0),
            'end_date' => Carbon::now()->addDays(7)->setHour(23)->setMinute(30),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Maratón')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '3',
            'local_attendance' => 2000,
            'national_attendance' => 500,
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Largada y llegada en Plaza Independencia']);
        }

        // 4. Serenata a Tucumán - Festivales/Festival de Música - Ente (null image)
        $evento = Event::create([
            'title' => 'Serenata a Tucumán',
            'description' => 'Festival de música folclórica y popular bajo las estrellas. Artistas locales y nacionales rinden homenaje a la provincia en una noche inolvidable.',
            'start_date' => Carbon::now()->subDays(3)->setHour(20)->setMinute(0),
            'end_date' => Carbon::now()->subDays(2)->setHour(3)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival de Música')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '30',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Escenario al aire libre']);
        }

        // 5. Ruta de los Artesanos Tucumanos - Turismo/Ruta Turística - Sheraton
        $evento = Event::create([
            'title' => 'Ruta de los Artesanos Tucumanos',
            'description' => 'Recorrido guiado por talleres de artesanos en los Valles Calchaquíes. Cerámica, tejidos y tallas en madera de artistas locales.',
            'start_date' => Carbon::now()->addDays(9)->setHour(8)->setMinute(30),
            'end_date' => Carbon::now()->addDays(9)->setHour(18)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Ruta Turística')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencySemanal->id,
            'rotation_type_id' => $rotationItinerante->id,
            'edition_number' => '12',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Punto de salida del recorrido']);
        }

        // =====================================================
        // APPROVED INTERNAL (4 new events)
        // =====================================================

        // 6. Congreso de Gastronomía Regional - Conferencias/Congreso - Sheraton
        $evento = Event::create([
            'title' => 'Congreso de Gastronomía Regional',
            'description' => 'Encuentro de chefs, productores y expertos gastronómicos del NOA. Ponencias sobre identidad culinaria, productos autóctonos y tendencias.',
            'start_date' => Carbon::now()->addDays(25)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(27)->setHour(18)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Congreso')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '2',
            'local_attendance' => 200,
            'national_attendance' => 150,
            'international_attendance' => 20,
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Salón de convenciones']);
        }

        // 7. Torneo de Polo Tucumano - Deportes/Torneo - Ente
        $evento = Event::create([
            'title' => 'Torneo de Polo Tucumano',
            'description' => 'Campeonato de polo con equipos de todo el norte argentino. Jornadas de competencia con actividades sociales y gastronómicas.',
            'start_date' => Carbon::now()->addDays(35)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(37)->setHour(18)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Torneo')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '18',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Campo de polo']);
        }

        // 8. Noche de Tango en el Parque - Cultura/Danza - Ente (null image)
        $evento = Event::create([
            'title' => 'Noche de Tango en el Parque',
            'description' => 'Milonga al aire libre en el Parque 9 de Julio. Clase abierta de tango para principiantes, orquesta en vivo y exhibición de bailarines profesionales.',
            'start_date' => Carbon::now()->addDays(18)->setHour(20)->setMinute(0),
            'end_date' => Carbon::now()->addDays(19)->setHour(1)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Danza')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyMensual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '36',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Glorieta del parque']);
        }

        // 9. Feria del Libro Infantil y Juvenil - Ferias/Feria del Libro - La Rural
        $evento = Event::create([
            'title' => 'Feria del Libro Infantil y Juvenil',
            'description' => 'Espacio dedicado a la literatura infantil y juvenil. Talleres de escritura creativa, cuentacuentos, ilustración y encuentros con autores.',
            'start_date' => Carbon::now()->addDays(40)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(45)->setHour(20)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Feria del Libro')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '10',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Pabellón infantil']);
        }

        // =====================================================
        // PENDING PUBLIC APPROVAL (4 new events)
        // =====================================================

        // 10. Festival de Cine del Norte - Cultura/Teatro - Ente
        $evento = Event::create([
            'title' => 'Festival de Cine del Norte Argentino',
            'description' => 'Muestra competitiva de cortometrajes y largometrajes del norte argentino. Proyecciones al aire libre, charlas con directores y talleres de cine.',
            'start_date' => Carbon::now()->addDays(45)->setHour(18)->setMinute(0),
            'end_date' => Carbon::now()->addDays(50)->setHour(23)->setMinute(0),
            'status_id' => $pendingPublicStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Teatro')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '7',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Sala de proyecciones']);
        }

        // 11. Rally de las Yungas - Deportes/Competencia - Sheraton
        $evento = Event::create([
            'title' => 'Rally de las Yungas',
            'description' => 'Competencia de rally todo terreno por caminos de montaña en las Yungas tucumanas. Categorías 4x4, motos y cuatriciclos.',
            'start_date' => Carbon::now()->addDays(50)->setHour(7)->setMinute(0),
            'end_date' => Carbon::now()->addDays(52)->setHour(18)->setMinute(0),
            'status_id' => $pendingPublicStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Competencia')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationItinerante->id,
            'edition_number' => '6',
            'local_attendance' => 500,
            'national_attendance' => 300,
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Base de operaciones y largada']);
        }

        // 12. Expo Turismo NOA - Ferias/Expo Comercial - La Rural (null image)
        $evento = Event::create([
            'title' => 'Expo Turismo NOA',
            'description' => 'Exposición de destinos y servicios turísticos del noroeste argentino. Operadores, hoteleros y agencias presentan sus ofertas.',
            'start_date' => Carbon::now()->addDays(55)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(57)->setHour(20)->setMinute(0),
            'status_id' => $pendingPublicStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Expo Comercial')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '3',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Pabellón de exposiciones']);
        }

        // 13. Tour Nocturno Tucumán Colonial - Turismo/Tour Guiado - Ente
        $evento = Event::create([
            'title' => 'Tour Nocturno Tucumán Colonial',
            'description' => 'Paseo nocturno por el casco histórico con relatos de la época colonial. Incluye visita a la Casa Histórica y edificios patrimoniales iluminados.',
            'start_date' => Carbon::now()->addDays(14)->setHour(20)->setMinute(0),
            'end_date' => Carbon::now()->addDays(14)->setHour(23)->setMinute(0),
            'status_id' => $pendingPublicStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Tour Guiado')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencySemanal->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '48',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Punto de encuentro: Casa Histórica']);
        }

        // =====================================================
        // PENDING INTERNAL APPROVAL (5 new events)
        // =====================================================

        // 14. Festival de Jazz del Norte - Festivales/Festival de Música - Ente
        $evento = Event::create([
            'title' => 'Festival de Jazz del Norte',
            'description' => 'Tres noches de jazz con músicos nacionales e internacionales. Jam sessions, clínicas musicales y gastronomía en un ambiente íntimo.',
            'start_date' => Carbon::now()->addDays(60)->setHour(20)->setMinute(0),
            'end_date' => Carbon::now()->addDays(62)->setHour(2)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival de Música')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originInternational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Escenario principal de jazz']);
        }

        // 15. Seminario de Turismo Digital - Conferencias/Seminario - Sheraton
        $evento = Event::create([
            'title' => 'Seminario de Turismo Digital',
            'description' => 'Jornada sobre transformación digital en el turismo. Marketing online, plataformas de reserva, inteligencia artificial y experiencias virtuales.',
            'start_date' => Carbon::now()->addDays(30)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(30)->setHour(18)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Seminario')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
            'event_website' => 'https://turismodigital.tucuman.gob.ar',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Sala de conferencias nivel 3']);
        }

        // 16. Excursión a Tafí del Valle - Turismo/Excursión - Ente (null image)
        $evento = Event::create([
            'title' => 'Excursión a Tafí del Valle',
            'description' => 'Viaje de día completo a Tafí del Valle. Visita a los menhires, queso artesanal, almuerzo regional y paseo por el pueblo.',
            'start_date' => Carbon::now()->addDays(20)->setHour(7)->setMinute(0),
            'end_date' => Carbon::now()->addDays(20)->setHour(20)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Excursión')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencySemanal->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '52',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Salida desde terminal de ómnibus']);
        }

        // 17. Exhibición de Artes Marciales - Deportes/Exhibición Deportiva - Ente
        $evento = Event::create([
            'title' => 'Exhibición de Artes Marciales',
            'description' => 'Demostración de karate, taekwondo, judo y jiu-jitsu con atletas provinciales y nacionales. Clases abiertas para todas las edades.',
            'start_date' => Carbon::now()->addDays(65)->setHour(16)->setMinute(0),
            'end_date' => Carbon::now()->addDays(65)->setHour(21)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Exhibición Deportiva')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Polideportivo']);
        }

        // 18. Feria Artesanal Navideña - Ferias/Feria Artesanal - La Rural
        $evento = Event::create([
            'title' => 'Feria Artesanal Navideña',
            'description' => 'Feria especial de artesanías para las fiestas. Regalos artesanales, decoración navideña y gastronomía típica de fin de año.',
            'start_date' => Carbon::now()->addDays(70)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(75)->setHour(22)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Feria Artesanal')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '15',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Paseo de compras artesanales']);
        }

        // =====================================================
        // DRAFT (5 new events)
        // =====================================================

        // 19. Hackathon Tucumán Digital - Conferencias/Workshop - Ente
        $evento = Event::create([
            'title' => 'Hackathon Tucumán Digital',
            'description' => 'Maratón de programación de 48 horas. Equipos de desarrolladores crean soluciones tecnológicas para problemas turísticos reales de la provincia.',
            'start_date' => Carbon::now()->addDays(80)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(82)->setHour(18)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Workshop')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Laboratorio de innovación']);
        }

        // 20. Festival del Locro Tucumano - Festivales/Festival Gastronómico - Ente (null image)
        $evento = Event::create([
            'title' => 'Festival del Locro Tucumano',
            'description' => 'Gran concurso de locro con participantes de toda la provincia. Degustación libre, música folclórica y premios al mejor locro.',
            'start_date' => Carbon::now()->addDays(75)->setHour(11)->setMinute(0),
            'end_date' => Carbon::now()->addDays(75)->setHour(22)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival Gastronómico')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '20',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Patio de comidas al aire libre']);
        }

        // 21. Tour Gastronómico Tucumano - Turismo/Experiencia Gastronómica - Sheraton
        $evento = Event::create([
            'title' => 'Tour Gastronómico Tucumano',
            'description' => 'Recorrido por restaurantes y puestos emblemáticos de San Miguel. Empanadas, humita, tamales y dulces regionales con guía especializado.',
            'start_date' => Carbon::now()->addDays(85)->setHour(11)->setMinute(0),
            'end_date' => Carbon::now()->addDays(85)->setHour(16)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Experiencia Gastronómica')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencySemanal->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Punto de partida: Mercado del Norte']);
        }

        // 22. Muestra Fotográfica Tucumán Natural - Cultura/Exposición de Arte - La Rural
        $evento = Event::create([
            'title' => 'Muestra Fotográfica Tucumán Natural',
            'description' => 'Exposición de fotografías de la naturaleza tucumana. Flora, fauna y paisajes de las Yungas, los Valles y la llanura en imágenes de gran formato.',
            'start_date' => Carbon::now()->addDays(60)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(90)->setHour(20)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Exposición de Arte')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Sala de exposiciones']);
        }

        // 23. Campeonato de Mountain Bike - Deportes/Competencia - Ente
        $evento = Event::create([
            'title' => 'Campeonato de Mountain Bike Tucumán',
            'description' => 'Competencia de ciclismo de montaña en los cerros tucumanos. Categorías amateur y profesional con circuitos de diferentes dificultades.',
            'start_date' => Carbon::now()->addDays(90)->setHour(7)->setMinute(0),
            'end_date' => Carbon::now()->addDays(90)->setHour(17)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Competencia')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationItinerante->id,
            'edition_number' => '2',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Circuito de montaña']);
        }

        // =====================================================
        // REQUIRES CHANGES (4 new events)
        // =====================================================

        // 24. Festival de Danza Contemporánea - Cultura/Danza - Sheraton (null image)
        $evento = Event::create([
            'title' => 'Festival de Danza Contemporánea',
            'description' => 'Encuentro de compañías de danza contemporánea del norte argentino. Funciones, talleres y charlas con coreógrafos reconocidos.',
            'start_date' => Carbon::now()->addDays(40)->setHour(19)->setMinute(0),
            'end_date' => Carbon::now()->addDays(42)->setHour(23)->setMinute(0),
            'status_id' => $requiresChangesStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Danza')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '4',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Teatro principal']);
        }

        // 25. Charla: Innovación en Turismo - Conferencias/Charla - Ente
        $evento = Event::create([
            'title' => 'Charla: Innovación y Tendencias en Turismo',
            'description' => 'Presentación sobre las últimas tendencias en turismo mundial y cómo aplicarlas en Tucumán. Casos de éxito y oportunidades de inversión.',
            'start_date' => Carbon::now()->addDays(35)->setHour(18)->setMinute(30),
            'end_date' => Carbon::now()->addDays(35)->setHour(21)->setMinute(0),
            'status_id' => $requiresChangesStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Charla')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Auditorio']);
        }

        // 26. Encuentro de Peñas Folclóricas - Festivales/Festival Folclórico - Ente
        $evento = Event::create([
            'title' => 'Encuentro de Peñas Folclóricas del NOA',
            'description' => 'Reunión de las peñas más emblemáticas del noroeste argentino. Guitarreadas, zambas, chacareras y comidas criollas en un fin de semana de tradición.',
            'start_date' => Carbon::now()->addDays(55)->setHour(20)->setMinute(0),
            'end_date' => Carbon::now()->addDays(57)->setHour(4)->setMinute(0),
            'status_id' => $requiresChangesStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival Folclórico')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '8',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Predio de peñas']);
        }

        // 27. Expo Inmobiliaria del Norte - Ferias/Expo Comercial - La Rural
        $evento = Event::create([
            'title' => 'Expo Inmobiliaria del Norte',
            'description' => 'Exposición de desarrollos inmobiliarios, terrenos y propiedades del NOA. Charlas sobre inversión, créditos hipotecarios y arquitectura sustentable.',
            'start_date' => Carbon::now()->addDays(50)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(52)->setHour(20)->setMinute(0),
            'status_id' => $requiresChangesStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Expo Comercial')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '12',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Centro de exposiciones']);
        }

        // =====================================================
        // REJECTED (3 new events)
        // =====================================================

        // 28. Torneo de eSports Tucumán - Deportes/Torneo - Sheraton (null image)
        $evento = Event::create([
            'title' => 'Torneo de eSports Tucumán',
            'description' => 'Competencia de videojuegos con torneos de League of Legends, Valorant y FIFA. Premios en efectivo y streaming en vivo.',
            'start_date' => Carbon::now()->addDays(25)->setHour(14)->setMinute(0),
            'end_date' => Carbon::now()->addDays(26)->setHour(22)->setMinute(0),
            'status_id' => $rejectedStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Torneo')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Sala gaming']);
        }

        // 29. Festival de Reggaetón del Norte - Festivales/Festival de Música - La Rural
        $evento = Event::create([
            'title' => 'Festival de Reggaetón del Norte',
            'description' => 'Festival de música urbana con artistas nacionales. Shows en vivo, DJs, zona VIP y food trucks.',
            'start_date' => Carbon::now()->addDays(30)->setHour(18)->setMinute(0),
            'end_date' => Carbon::now()->addDays(30)->setHour(4)->setMinute(0),
            'status_id' => $rejectedStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival de Música')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Predio al aire libre']);
        }

        // 30. Feria de Antigüedades - Ferias/Feria Artesanal - Ente
        $evento = Event::create([
            'title' => 'Feria de Antigüedades y Coleccionismo',
            'description' => 'Feria mensual de antigüedades, vinilos, libros usados y objetos de colección. Espacio para coleccionistas y curiosos.',
            'start_date' => Carbon::now()->addDays(45)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(45)->setHour(18)->setMinute(0),
            'status_id' => $rejectedStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Feria Artesanal')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyMensual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '36',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Plaza de antigüedades']);
        }

        // =====================================================
        // CANCELLED (1 new event)
        // =====================================================

        // 31. Concierto de Verano al Aire Libre - Cultura/Concierto - Ente (null image)
        $evento = Event::create([
            'title' => 'Concierto de Verano al Aire Libre',
            'description' => 'Concierto gratuito con artistas populares argentinos en el Parque 9 de Julio. Evento cancelado por condiciones climáticas adversas.',
            'start_date' => Carbon::now()->addDays(15)->setHour(20)->setMinute(0),
            'end_date' => Carbon::now()->addDays(15)->setHour(23)->setMinute(30),
            'status_id' => $cancelledStatus?->id ?? $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Concierto')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '5',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Anfiteatro del parque']);
        }

        $this->command->info('Additional events created: 31 events (requires_changes, rejected, cancelled included)');
    }

    /**
     * Seed ~62 extra events to expand the dataset for demo.
     * Covers all workflow statuses with realistic Tucumán events.
     */
    private function seedExtraEvents(): void
    {
        // Get all statuses
        $publishedStatus = EventStatus::where('status_code', 'published')->first();
        $approvedInternalStatus = EventStatus::where('status_code', 'approved_internal')->first();
        $pendingInternalStatus = EventStatus::where('status_code', 'pending_internal_approval')->first();
        $pendingPublicStatus = EventStatus::where('status_code', 'pending_public_approval')->first();
        $draftStatus = EventStatus::where('status_code', 'draft')->first();
        $requiresChangesStatus = EventStatus::where('status_code', 'requires_changes')->first();
        $rejectedStatus = EventStatus::where('status_code', 'rejected')->first();
        $cancelledStatus = EventStatus::where('status_code', 'cancelled')->first();

        // Get formats
        $sedeUnicaFormat = EventFormat::where('format_code', 'sede_unica')->first();
        $multiSedeFormat = EventFormat::where('format_code', 'multi_sede')->first();

        // Get origins
        $originLocal = EventOrigin::where('code', 'local')->first();
        $originNational = EventOrigin::where('code', 'national')->first();
        $originInternational = EventOrigin::where('code', 'international')->first();


        // Get frequencies
        $frequencyUnico = EventFrequency::where('code', 'unico')->first();
        $frequencyAnual = EventFrequency::where('code', 'anual')->first();
        $frequencyMensual = EventFrequency::where('code', 'mensual')->first();
        $frequencySemanal = EventFrequency::where('code', 'semanal')->first();
        $frequencyTrimestral = EventFrequency::where('code', 'trimestral')->first();
        $frequencySemestral = EventFrequency::where('code', 'semestral')->first();

        // Get rotation types
        $rotationFijo = EventRotationType::where('code', 'fijo')->first();
        $rotationRotativo = EventRotationType::where('code', 'rotativo')->first();
        $rotationItinerante = EventRotationType::where('code', 'itinerante')->first();

        // Get organizations
        $enteDeturismo = Organization::where('slug', 'ente-turismo-tucuman')->first();
        $sheratonHotel = Organization::where('slug', 'sheraton-tucuman')->first();
        $laRural = Organization::where('slug', 'la-rural-tucuman')->first();

        // Get user
        $entityAdminTurismo = User::where('email', 'ana.garcia@enteturismo.gov.ar')->first();

        // Get event types
        $festivalesType = EventType::where('name', 'Festivales')->first();
        $deportesType = EventType::where('name', 'Deportes')->first();
        $culturaType = EventType::where('name', 'Cultura')->first();
        $turismoType = EventType::where('name', 'Turismo')->first();
        $feriasType = EventType::where('name', 'Ferias')->first();
        $conferenciasType = EventType::where('name', 'Conferencias')->first();

        // Get locations
        $ubicacionesTurismo = Location::where('entity_id', $enteDeturismo->id)->get();
        $locationCount = $ubicacionesTurismo->count();
        $defaultLocation = $ubicacionesTurismo->first();

        $getLocation = function (int $index) use ($ubicacionesTurismo, $locationCount, $defaultLocation) {
            if ($locationCount === 0) {
                return null;
            }

            return $ubicacionesTurismo->values()->get($index % $locationCount) ?? $defaultLocation;
        };

        $locationIndex = 46; // Continue from where seedAdditionalEvents left off

        // ~25% null images (every 4th event)
        $imageCounter = 0;
        $getImage = function () use (&$imageCounter) {
            $imageCounter++;

            return ($imageCounter % 4 === 0) ? null : $this->getRandomSeedImage();
        };

        // =====================================================
        // PUBLISHED (10 new events)
        // =====================================================

        // 1. Fiesta del Queso Taficeño - Festivales/Festival Gastronómico - Ente
        $evento = Event::create([
            'title' => 'Fiesta del Queso Taficeño',
            'description' => 'Celebración del queso artesanal de Tafí del Valle con degustaciones, concursos de producción y espectáculos folclóricos en la plaza central.',
            'start_date' => Carbon::now()->addDays(8)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(9)->setHour(22)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival Gastronómico')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '18',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Plaza central de Tafí']);
        }

        // 2. Congreso Internacional de Biodiversidad - Conferencias/Congreso - Ente
        $evento = Event::create([
            'title' => 'Congreso Internacional de Biodiversidad del NOA',
            'description' => 'Encuentro científico con investigadores de América Latina sobre conservación de las Yungas, ecosistemas áridos y fauna autóctona del noroeste.',
            'start_date' => Carbon::now()->addDays(22)->setHour(8)->setMinute(30),
            'end_date' => Carbon::now()->addDays(24)->setHour(18)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Congreso')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originInternational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '12',
            'local_attendance' => 300,
            'national_attendance' => 200,
            'international_attendance' => 50,
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Auditorio principal UNT']);
        }

        // 3. Feria de Economía Social y Solidaria - Ferias/Feria Productiva - Ente
        $evento = Event::create([
            'title' => 'Feria de Economía Social y Solidaria',
            'description' => 'Encuentro de cooperativas, emprendedores sociales y productores familiares del NOA. Venta directa, talleres de gestión y networking solidario.',
            'start_date' => Carbon::now()->addDays(11)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(13)->setHour(20)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Feria Productiva')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyMensual->id,
            'rotation_type_id' => $rotationItinerante->id,
            'edition_number' => '36',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Explanada del centro cultural']);
        }

        // 4. Triatlón de las Yungas - Deportes/Competencia - Ente (null image)
        $evento = Event::create([
            'title' => 'Triatlón de las Yungas',
            'description' => 'Competencia de triatlón en entorno natural: natación en el Dique El Cadillal, ciclismo por rutas serranas y carrera por senderos de montaña.',
            'start_date' => Carbon::now()->addDays(17)->setHour(6)->setMinute(0),
            'end_date' => Carbon::now()->addDays(17)->setHour(16)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Competencia')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '5',
            'local_attendance' => 800,
            'national_attendance' => 400,
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Base de competencia en el Dique']);
        }

        // 5. Ciclo de Cine Argentino al Aire Libre - Cultura/Teatro - Ente
        $evento = Event::create([
            'title' => 'Ciclo de Cine Argentino al Aire Libre',
            'description' => 'Proyecciones de películas argentinas clásicas y contemporáneas en pantalla gigante bajo las estrellas. Entrada gratuita con pochoclos artesanales.',
            'start_date' => Carbon::now()->addDays(6)->setHour(20)->setMinute(30),
            'end_date' => Carbon::now()->addDays(6)->setHour(23)->setMinute(30),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Teatro')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencySemanal->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '10',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Pantalla en el parque']);
        }

        // 6. Tour Avistaje de Aves en Yungas - Turismo/Excursión - Sheraton
        $evento = Event::create([
            'title' => 'Tour Avistaje de Aves en Yungas',
            'description' => 'Excursión guiada por ornitólogos expertos por la Reserva de las Yungas. Avistamiento de tucanes, cóndores y más de 100 especies registradas.',
            'start_date' => Carbon::now()->addDays(10)->setHour(5)->setMinute(30),
            'end_date' => Carbon::now()->addDays(10)->setHour(14)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Excursión')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencySemanal->id,
            'rotation_type_id' => $rotationItinerante->id,
            'edition_number' => '30',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Entrada a la reserva']);
        }

        // 7. Expo Vitivinícola de los Valles - Ferias/Expo Comercial - Sheraton
        $evento = Event::create([
            'title' => 'Expo Vitivinícola de los Valles Calchaquíes',
            'description' => 'Exposición de bodegas y productores vitivinícolas de los Valles Calchaquíes. Catas profesionales, maridajes y rondas de negocios internacionales.',
            'start_date' => Carbon::now()->addDays(28)->setHour(11)->setMinute(0),
            'end_date' => Carbon::now()->addDays(30)->setHour(21)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Expo Comercial')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originInternational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '8',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Salón de eventos principal']);
        }

        // 8. Gala Benéfica por la Educación Rural - Cultura/Concierto - La Rural (null image)
        $evento = Event::create([
            'title' => 'Gala Benéfica por la Educación Rural',
            'description' => 'Cena de gala con subasta de obras de arte y show musical para recaudar fondos destinados a escuelas rurales de Tucumán.',
            'start_date' => Carbon::now()->subDays(5)->setHour(20)->setMinute(0),
            'end_date' => Carbon::now()->subDays(4)->setHour(1)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Concierto')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '7',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Salón principal de gala']);
        }

        // 9. Carrera de Regularidad Autos Clásicos - Deportes/Competencia - La Rural
        $evento = Event::create([
            'title' => 'Carrera de Regularidad Autos Clásicos',
            'description' => 'Rally de regularidad para vehículos clásicos anteriores a 1980 por rutas históricas de Tucumán. Exhibición y premiación en plaza central.',
            'start_date' => Carbon::now()->addDays(19)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(19)->setHour(18)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Competencia')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationItinerante->id,
            'edition_number' => '15',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Largada en plaza principal']);
        }

        // 10. Workshop de Fotografía de Naturaleza - Conferencias/Workshop - Sheraton
        $evento = Event::create([
            'title' => 'Workshop de Fotografía de Naturaleza',
            'description' => 'Taller intensivo de fotografía de naturaleza con salida de campo a las Yungas. Técnicas de macro, paisaje y fauna silvestre con fotógrafos profesionales.',
            'start_date' => Carbon::now()->addDays(15)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(16)->setHour(18)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Workshop')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyTrimestral?->id ?? $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '4',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Sala de capacitación y campo']);
        }

        // =====================================================
        // APPROVED INTERNAL (9 new events)
        // =====================================================

        // 11. Festival de Títeres y Marionetas - Cultura/Teatro - Ente
        $evento = Event::create([
            'title' => 'Festival de Títeres y Marionetas del NOA',
            'description' => 'Encuentro de titiriteros del noroeste argentino con funciones para niños y adultos, talleres de construcción de títeres y pasacalles artísticos.',
            'start_date' => Carbon::now()->addDays(33)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(35)->setHour(20)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Teatro')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '6',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Teatro infantil y plaza']);
        }

        // 12. Ruta del Azúcar Histórica - Turismo/Ruta Turística - Ente (null image)
        $evento = Event::create([
            'title' => 'Ruta del Azúcar Histórica',
            'description' => 'Recorrido por los ingenios azucareros históricos de Tucumán. Visita a fábricas en funcionamiento, museos y degustación de productos derivados.',
            'start_date' => Carbon::now()->addDays(26)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(26)->setHour(18)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Ruta Turística')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencySemanal->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '20',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Punto de partida del tour']);
        }

        // 13. Torneo Interprovincial de Natación - Deportes/Torneo - Ente
        $evento = Event::create([
            'title' => 'Torneo Interprovincial de Natación',
            'description' => 'Competencia de natación con nadadores de las provincias del NOA. Categorías por edad en todas las especialidades olímpicas.',
            'start_date' => Carbon::now()->addDays(40)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(41)->setHour(18)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Torneo')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '22',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Natatorio olímpico']);
        }

        // 14. Feria del Dulce Tucumano - Ferias/Feria Productiva - La Rural
        $evento = Event::create([
            'title' => 'Feria del Dulce Tucumano',
            'description' => 'Exposición y venta de dulces artesanales: cayote, membrillo, batata, mamón y otros clásicos tucumanos. Talleres de producción artesanal.',
            'start_date' => Carbon::now()->addDays(32)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(34)->setHour(21)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Feria Productiva')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '10',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Pabellón de productores']);
        }

        // 15. Seminario de Hotelería Sustentable - Conferencias/Seminario - Sheraton (null image)
        $evento = Event::create([
            'title' => 'Seminario de Hotelería Sustentable',
            'description' => 'Jornada sobre prácticas sustentables en hotelería y turismo. Eficiencia energética, gestión de residuos y certificaciones verdes.',
            'start_date' => Carbon::now()->addDays(38)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(38)->setHour(17)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Seminario')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originInternational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '3',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Sala de conferencias nivel 1']);
        }

        // 16. Festival de Murga y Comparsa - Festivales/Festival Cultural - Ente
        $evento = Event::create([
            'title' => 'Festival de Murga y Comparsa Tucumana',
            'description' => 'Desfile y competencia de murgas y comparsas por las calles del centro. Color, música, baile y alegría popular con premios por categoría.',
            'start_date' => Carbon::now()->addDays(42)->setHour(18)->setMinute(0),
            'end_date' => Carbon::now()->addDays(42)->setHour(23)->setMinute(30),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival Cultural')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '14',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Circuito de desfile']);
        }

        // 17. Excursión Fotográfica Ruinas de Quilmes - Turismo/Excursión - Sheraton
        $evento = Event::create([
            'title' => 'Excursión Fotográfica Ruinas de Quilmes',
            'description' => 'Viaje fotográfico guiado a las Ruinas de Quilmes al amanecer. Técnicas de fotografía de paisaje y patrimonio arqueológico con equipo profesional.',
            'start_date' => Carbon::now()->addDays(29)->setHour(4)->setMinute(30),
            'end_date' => Carbon::now()->addDays(29)->setHour(15)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Excursión')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyMensual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '15',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Entrada a las ruinas']);
        }

        // 18. Charla: Gastronomía e Identidad Tucumana - Conferencias/Charla - Ente
        $evento = Event::create([
            'title' => 'Charla: Gastronomía e Identidad Tucumana',
            'description' => 'Conversatorio con chefs y antropólogos sobre el rol de la gastronomía en la identidad cultural tucumana. Degustación de platos tradicionales.',
            'start_date' => Carbon::now()->addDays(21)->setHour(18)->setMinute(30),
            'end_date' => Carbon::now()->addDays(21)->setHour(21)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Charla')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Sala de charlas']);
        }

        // 19. Encuentro de Escultores del Norte - Cultura/Exposición de Arte - La Rural (null image)
        $evento = Event::create([
            'title' => 'Encuentro de Escultores del Norte',
            'description' => 'Simposio de escultura con artistas trabajando en vivo. Piedra, madera y metal transformados en obras que quedarán como patrimonio de la ciudad.',
            'start_date' => Carbon::now()->addDays(48)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(55)->setHour(19)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Exposición de Arte')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '9',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Espacio de escultura al aire libre']);
        }

        // =====================================================
        // PENDING PUBLIC APPROVAL (8 new events)
        // =====================================================

        // 20. Festival del Humita y el Tamal - Festivales/Festival Gastronómico - Ente
        $evento = Event::create([
            'title' => 'Festival del Humita y el Tamal',
            'description' => 'Celebración de dos íconos de la gastronomía tucumana. Concurso de las mejores humitas y tamales, show de cocina en vivo y música folclórica.',
            'start_date' => Carbon::now()->addDays(46)->setHour(11)->setMinute(0),
            'end_date' => Carbon::now()->addDays(47)->setHour(22)->setMinute(0),
            'status_id' => $pendingPublicStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => true,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival Gastronómico')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '12',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Zona gastronómica del predio']);
        }

        // 21. Jornada de Yoga y Meditación en la Montaña - Deportes/Exhibición Deportiva - Ente
        $evento = Event::create([
            'title' => 'Jornada de Yoga y Meditación en la Montaña',
            'description' => 'Retiro de un día en el Cerro San Javier con sesiones de yoga al amanecer, meditación guiada y almuerzo saludable con vistas panorámicas.',
            'start_date' => Carbon::now()->addDays(36)->setHour(6)->setMinute(0),
            'end_date' => Carbon::now()->addDays(36)->setHour(17)->setMinute(0),
            'status_id' => $pendingPublicStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Exhibición Deportiva')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyMensual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '8',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Mirador del cerro']);
        }

        // 22. Ruta del Citrus Tucumano - Turismo/Ruta Turística - Ente
        $evento = Event::create([
            'title' => 'Ruta del Citrus Tucumano',
            'description' => 'Recorrido por fincas citrícolas de la llanura tucumana. Cosecha de limones, naranjas y pomelos, visita a plantas empacadoras y degustación.',
            'start_date' => Carbon::now()->addDays(52)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(52)->setHour(17)->setMinute(0),
            'status_id' => $pendingPublicStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Ruta Turística')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencySemestral?->id ?? $frequencyAnual->id,
            'rotation_type_id' => $rotationItinerante->id,
            'edition_number' => '5',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Primera finca del recorrido']);
        }

        // 23. Feria del Libro Universitario - Ferias/Feria del Libro - Sheraton (null image)
        $evento = Event::create([
            'title' => 'Feria del Libro Universitario',
            'description' => 'Exposición de editoriales universitarias del NOA con presentaciones de publicaciones académicas, talleres de escritura científica y mesas de debate.',
            'start_date' => Carbon::now()->addDays(56)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(58)->setHour(20)->setMinute(0),
            'status_id' => $pendingPublicStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Feria del Libro')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '14',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Pabellón de editoriales']);
        }

        // 24. Noche de Poesía y Candombe - Cultura/Concierto - Ente
        $evento = Event::create([
            'title' => 'Noche de Poesía y Candombe',
            'description' => 'Velada que fusiona poesía en vivo con percusión de candombe. Poetas locales, tamborileros y artistas visuales en una experiencia multisensorial.',
            'start_date' => Carbon::now()->addDays(44)->setHour(21)->setMinute(0),
            'end_date' => Carbon::now()->addDays(45)->setHour(1)->setMinute(0),
            'status_id' => $pendingPublicStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Concierto')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyMensual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '12',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Patio cultural']);
        }

        // 25. Congreso de Arquitectura Sustentable - Conferencias/Congreso - Sheraton
        $evento = Event::create([
            'title' => 'Congreso de Arquitectura Sustentable del NOA',
            'description' => 'Encuentro de arquitectos y urbanistas para debatir sobre construcción sustentable adaptada al clima del noroeste. Casos de estudio y nuevas normativas.',
            'start_date' => Carbon::now()->addDays(60)->setHour(8)->setMinute(30),
            'end_date' => Carbon::now()->addDays(62)->setHour(17)->setMinute(0),
            'status_id' => $pendingPublicStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Congreso')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '7',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Salón de congresos']);
        }

        // 26. Copa de Golf Tucumán - Deportes/Torneo - La Rural
        $evento = Event::create([
            'title' => 'Copa de Golf Tucumán',
            'description' => 'Torneo de golf amateur y profesional en el campo del Jockey Club. Categorías por handicap con premios y cena de gala de premiación.',
            'start_date' => Carbon::now()->addDays(49)->setHour(7)->setMinute(0),
            'end_date' => Carbon::now()->addDays(50)->setHour(19)->setMinute(0),
            'status_id' => $pendingPublicStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Torneo')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '25',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Campo de golf']);
        }

        // 27. Tour Estrellas del Hemisferio Sur - Turismo/Tour Guiado - La Rural (null image)
        $evento = Event::create([
            'title' => 'Tour Estrellas del Hemisferio Sur',
            'description' => 'Experiencia de astroturismo en Amaicha del Valle. Observación del cielo nocturno con telescopios profesionales y charla de astronomía.',
            'start_date' => Carbon::now()->addDays(54)->setHour(19)->setMinute(0),
            'end_date' => Carbon::now()->addDays(55)->setHour(2)->setMinute(0),
            'status_id' => $pendingPublicStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Tour Guiado')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyMensual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '6',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Observatorio de Amaicha']);
        }

        // =====================================================
        // PENDING INTERNAL APPROVAL (10 new events)
        // =====================================================

        // 28. Festival de Cumbia Norteña - Festivales/Festival de Música - Ente
        $evento = Event::create([
            'title' => 'Festival de Cumbia Norteña',
            'description' => 'Gran festival de cumbia con las bandas más populares del norte argentino. Dos escenarios, zona de comidas y área de baile.',
            'start_date' => Carbon::now()->addDays(66)->setHour(18)->setMinute(0),
            'end_date' => Carbon::now()->addDays(67)->setHour(4)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival de Música')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '3',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Predio de recitales']);
        }

        // 29. Muestra de Cerámica Precolombina - Cultura/Exposición de Arte - Ente
        $evento = Event::create([
            'title' => 'Muestra de Cerámica Precolombina del NOA',
            'description' => 'Exhibición de piezas cerámicas de las culturas Condorhuasi, Aguada y Santa María. Réplicas interactivas y talleres de alfarería ancestral.',
            'start_date' => Carbon::now()->addDays(58)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(88)->setHour(18)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Exposición de Arte')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Sala de arqueología']);
        }

        // 30. Experiencia Gastronómica de Altura - Turismo/Experiencia Gastronómica - Sheraton
        $evento = Event::create([
            'title' => 'Experiencia Gastronómica de Altura',
            'description' => 'Cena exclusiva en una terraza con vista a los valles. Menú de pasos con ingredientes autóctonos maridados con vinos de altura calchaquíes.',
            'start_date' => Carbon::now()->addDays(72)->setHour(19)->setMinute(0),
            'end_date' => Carbon::now()->addDays(72)->setHour(23)->setMinute(30),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Experiencia Gastronómica')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyMensual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '6',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Terraza panorámica']);
        }

        // 31. Expo Agro Tucumán - Ferias/Expo Comercial - La Rural (null image)
        $evento = Event::create([
            'title' => 'Expo Agro Tucumán',
            'description' => 'Exposición agroindustrial con maquinaria, semillas, agroquímicos y tecnología rural. Charlas técnicas y rondas de negocios para el sector productivo.',
            'start_date' => Carbon::now()->addDays(68)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(71)->setHour(19)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Expo Comercial')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '28',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Predio ferial zona rural']);
        }

        // 32. Campeonato de Escalada Deportiva - Deportes/Competencia - Ente
        $evento = Event::create([
            'title' => 'Campeonato de Escalada Deportiva',
            'description' => 'Competencia de escalada en roca natural y muro artificial. Categorías boulder, lead y speed con escaladores del NOA y Cuyo.',
            'start_date' => Carbon::now()->addDays(74)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(75)->setHour(18)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Competencia')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '4',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Muro de escalada']);
        }

        // 33. Workshop de Diseño de Experiencias Turísticas - Conferencias/Workshop - Ente
        $evento = Event::create([
            'title' => 'Workshop de Diseño de Experiencias Turísticas',
            'description' => 'Taller práctico para operadores turísticos sobre creación de experiencias memorables. Design thinking, storytelling y herramientas digitales.',
            'start_date' => Carbon::now()->addDays(63)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(63)->setHour(17)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Workshop')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Sala de workshops']);
        }

        // 34. Festival del Folclore Infantil - Festivales/Festival Folclórico - Ente
        $evento = Event::create([
            'title' => 'Festival del Folclore Infantil',
            'description' => 'Festival de folclore dedicado a niños y jóvenes. Competencias de malambo, zamba y chacarera con categorías por edad y talleres de instrumentos.',
            'start_date' => Carbon::now()->addDays(76)->setHour(14)->setMinute(0),
            'end_date' => Carbon::now()->addDays(77)->setHour(21)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival Folclórico')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '9',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Escenario infantil']);
        }

        // 35. Maratón Solidaria por la Salud - Deportes/Maratón - Sheraton (null image)
        $evento = Event::create([
            'title' => 'Maratón Solidaria por la Salud',
            'description' => 'Carrera benéfica de 5K y 10K para recaudar fondos para hospitales públicos. Caminata familiar, hidratación y medalla para todos los participantes.',
            'start_date' => Carbon::now()->addDays(70)->setHour(7)->setMinute(0),
            'end_date' => Carbon::now()->addDays(70)->setHour(12)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Maratón')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '5',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Circuito de carrera']);
        }

        // 36. Feria de Diseño y Moda del NOA - Ferias/Feria Artesanal - Sheraton
        $evento = Event::create([
            'title' => 'Feria de Diseño y Moda del NOA',
            'description' => 'Exposición de diseñadores de moda y textiles del noroeste. Pasarela, workshops de diseño sustentable y venta directa de indumentaria de autor.',
            'start_date' => Carbon::now()->addDays(78)->setHour(16)->setMinute(0),
            'end_date' => Carbon::now()->addDays(80)->setHour(22)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Feria Artesanal')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencySemestral?->id ?? $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '6',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Salón de moda y pasarela']);
        }

        // 37. Experiencia Termal en Tafí Viejo - Turismo/Experiencia Gastronómica - La Rural
        $evento = Event::create([
            'title' => 'Experiencia Termal y Gastronómica',
            'description' => 'Jornada de relax en aguas termales con almuerzo gourmet de cocina regional. Masajes, sauna y caminata por senderos naturales.',
            'start_date' => Carbon::now()->addDays(64)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(64)->setHour(18)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Experiencia Gastronómica')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyMensual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '12',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Complejo termal']);
        }

        // =====================================================
        // DRAFT (10 new events)
        // =====================================================

        // 38. Festival de Electrónica en la Montaña - Festivales/Festival de Música - Ente
        $evento = Event::create([
            'title' => 'Festival de Electrónica en la Montaña',
            'description' => 'Festival de música electrónica en una locación serrana única. DJs nacionales e internacionales, mapping visual y experiencia inmersiva en la naturaleza.',
            'start_date' => Carbon::now()->addDays(85)->setHour(16)->setMinute(0),
            'end_date' => Carbon::now()->addDays(86)->setHour(6)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival de Música')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originInternational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Predio en la montaña']);
        }

        // 39. Taller de Cerámica Calchaquí - Cultura/Exposición de Arte - Ente
        $evento = Event::create([
            'title' => 'Taller de Cerámica Calchaquí',
            'description' => 'Workshop de cerámica con técnicas ancestrales de los pueblos calchaquíes. Modelado a mano, cocción a leña y decoración con pigmentos naturales.',
            'start_date' => Carbon::now()->addDays(82)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(83)->setHour(17)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Exposición de Arte')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Taller de artesanías']);
        }

        // 40. Tour en Bicicleta por la Ciudad - Turismo/Tour Guiado - Ente
        $evento = Event::create([
            'title' => 'Tour en Bicicleta por la Ciudad',
            'description' => 'Recorrido guiado en bicicleta por los monumentos y parques de San Miguel de Tucumán. Incluye bicicleta, casco y guía bilingüe.',
            'start_date' => Carbon::now()->addDays(88)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(88)->setHour(12)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Tour Guiado')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencySemanal->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Punto de partida en plaza']);
        }

        // 41. Expo Tecnológica del Norte - Ferias/Expo Comercial - Sheraton (null image)
        $evento = Event::create([
            'title' => 'Expo Tecnológica del Norte',
            'description' => 'Exposición de startups, empresas tech y centros de investigación del NOA. Demos de productos, pitch competition y rondas de inversión.',
            'start_date' => Carbon::now()->addDays(92)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(94)->setHour(19)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Expo Comercial')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '2',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Centro de exposiciones tech']);
        }

        // 42. Torneo de Ajedrez Provincial - Deportes/Torneo - Ente
        $evento = Event::create([
            'title' => 'Torneo de Ajedrez Provincial',
            'description' => 'Campeonato provincial de ajedrez con categorías para todas las edades. Sistema suizo, arbitraje FIDE y premios en efectivo.',
            'start_date' => Carbon::now()->addDays(80)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(81)->setHour(19)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Torneo')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '35',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Sala de torneos']);
        }

        // 43. Seminario de Coctelería y Mixología - Conferencias/Seminario - Sheraton
        $evento = Event::create([
            'title' => 'Seminario de Coctelería y Mixología Regional',
            'description' => 'Jornada de capacitación en coctelería con ingredientes autóctonos del NOA. Bartenders internacionales enseñan técnicas con frutas y hierbas locales.',
            'start_date' => Carbon::now()->addDays(95)->setHour(14)->setMinute(0),
            'end_date' => Carbon::now()->addDays(95)->setHour(21)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Seminario')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originInternational->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Bar del hotel']);
        }

        // 44. Feria de Plantas Nativas - Ferias/Feria Productiva - La Rural
        $evento = Event::create([
            'title' => 'Feria de Plantas Nativas y Jardinería',
            'description' => 'Exposición y venta de plantas nativas de las Yungas y valles tucumanos. Charlas de paisajismo sustentable y huerta urbana.',
            'start_date' => Carbon::now()->addDays(86)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(87)->setHour(18)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Feria Productiva')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyTrimestral?->id ?? $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '8',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Vivero y jardín botánico']);
        }

        // 45. Cabalgata por los Valles Calchaquíes - Turismo/Excursión - La Rural (null image)
        $evento = Event::create([
            'title' => 'Cabalgata por los Valles Calchaquíes',
            'description' => 'Cabalgata de dos días por los senderos de los Valles Calchaquíes. Pernocte en estancia, asado criollo y avistaje de cóndores.',
            'start_date' => Carbon::now()->addDays(100)->setHour(7)->setMinute(0),
            'end_date' => Carbon::now()->addDays(101)->setHour(17)->setMinute(0),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Excursión')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyMensual->id,
            'rotation_type_id' => $rotationItinerante->id,
            'edition_number' => '4',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Estancia de partida']);
        }

        // 46. Ballet Contemporáneo del Norte - Cultura/Danza - Ente
        $evento = Event::create([
            'title' => 'Ballet Contemporáneo del Norte',
            'description' => 'Espectáculo de danza contemporánea con coreografías que fusionan técnica clásica con elementos del folclore norteño. Música original en vivo.',
            'start_date' => Carbon::now()->addDays(96)->setHour(20)->setMinute(30),
            'end_date' => Carbon::now()->addDays(96)->setHour(22)->setMinute(30),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Danza')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Teatro principal']);
        }

        // 47. Charla: Emprendimientos Gastronómicos - Conferencias/Charla - Ente
        $evento = Event::create([
            'title' => 'Charla: Cómo Montar un Emprendimiento Gastronómico',
            'description' => 'Encuentro con emprendedores gastronómicos exitosos de Tucumán. Claves de negocio, habilitaciones, marketing y diferenciación en el mercado local.',
            'start_date' => Carbon::now()->addDays(91)->setHour(18)->setMinute(0),
            'end_date' => Carbon::now()->addDays(91)->setHour(20)->setMinute(30),
            'status_id' => $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Charla')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Auditorio de emprendedores']);
        }

        // =====================================================
        // REQUIRES CHANGES (8 new events)
        // =====================================================

        // 48. Festival de la Vendimia Tucumana - Festivales/Festival Gastronómico - Ente
        $evento = Event::create([
            'title' => 'Festival de la Vendimia Tucumana',
            'description' => 'Celebración de la cosecha de uvas en los Valles Calchaquíes. Pisada de uvas, degustación de mostos y vinos nuevos, y elección de la Reina de la Vendimia.',
            'start_date' => Carbon::now()->addDays(43)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(44)->setHour(23)->setMinute(0),
            'status_id' => $requiresChangesStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival Gastronómico')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '7',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Viñedos del valle']);
        }

        // 49. Concierto de Rock Sinfónico - Cultura/Concierto - Sheraton
        $evento = Event::create([
            'title' => 'Concierto de Rock Sinfónico',
            'description' => 'La Orquesta Sinfónica Provincial interpreta clásicos del rock nacional con arreglos sinfónicos. Sui Generis, Spinetta y Charly García reimaginados.',
            'start_date' => Carbon::now()->addDays(47)->setHour(20)->setMinute(30),
            'end_date' => Carbon::now()->addDays(47)->setHour(23)->setMinute(30),
            'status_id' => $requiresChangesStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Concierto')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Teatro sinfónico']);
        }

        // 50. Enduro de Montaña San Javier - Deportes/Competencia - Ente
        $evento = Event::create([
            'title' => 'Enduro de Montaña San Javier',
            'description' => 'Competencia de enduro en mountain bike por los senderos técnicos del Cerro San Javier. Categorías amateur y elite con cronometraje electrónico.',
            'start_date' => Carbon::now()->addDays(53)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(53)->setHour(17)->setMinute(0),
            'status_id' => $requiresChangesStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Competencia')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '3',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Sendero de montaña']);
        }

        // 51. Tour Nocturno de Leyendas - Turismo/Tour Guiado - La Rural (null image)
        $evento = Event::create([
            'title' => 'Tour Nocturno de Leyendas Tucumanas',
            'description' => 'Paseo teatralizado por el casco histórico con actores que representan leyendas y personajes míticos tucumanos. La Telesita, el Familiar y más.',
            'start_date' => Carbon::now()->addDays(39)->setHour(21)->setMinute(0),
            'end_date' => Carbon::now()->addDays(39)->setHour(23)->setMinute(30),
            'status_id' => $requiresChangesStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Tour Guiado')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencySemanal->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '20',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Inicio en Casa Histórica']);
        }

        // 52. Congreso de Medicina Rural - Conferencias/Congreso - Ente
        $evento = Event::create([
            'title' => 'Congreso de Medicina Rural del NOA',
            'description' => 'Encuentro de profesionales de la salud que trabajan en zonas rurales del noroeste. Telemedicina, salud comunitaria y casos clínicos.',
            'start_date' => Carbon::now()->addDays(57)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(59)->setHour(17)->setMinute(0),
            'status_id' => $requiresChangesStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Congreso')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationRotativo->id,
            'edition_number' => '11',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Auditorio médico']);
        }

        // 53. Feria de Comidas del Mundo - Ferias/Feria Productiva - Sheraton
        $evento = Event::create([
            'title' => 'Feria de Comidas del Mundo en Tucumán',
            'description' => 'Festival gastronómico multicultural con puestos de comida árabe, japonesa, peruana, italiana y regional. Música del mundo y talleres de cocina.',
            'start_date' => Carbon::now()->addDays(48)->setHour(11)->setMinute(0),
            'end_date' => Carbon::now()->addDays(49)->setHour(23)->setMinute(0),
            'status_id' => $requiresChangesStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Feria Productiva')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originInternational->id,
            'frequency_id' => $frequencyMensual->id,
            'rotation_type_id' => $rotationItinerante->id,
            'edition_number' => '12',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Patio gastronómico']);
        }

        // 54. Festival Cultural de la Pachamama - Festivales/Festival Cultural - Ente
        $evento = Event::create([
            'title' => 'Festival Cultural de la Pachamama',
            'description' => 'Celebración de la Madre Tierra con rituales ancestrales, música andina, danzas autóctonas y feria de productos orgánicos de la tierra.',
            'start_date' => Carbon::now()->addDays(51)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(52)->setHour(22)->setMinute(0),
            'status_id' => $requiresChangesStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $multiSedeFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival Cultural')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '40',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Espacio ceremonial']);
        }

        // 55. Olimpíadas de Matemática - Deportes/Torneo - La Rural (null image)
        $evento = Event::create([
            'title' => 'Olimpíadas Provinciales de Matemática',
            'description' => 'Competencia de matemática para estudiantes de secundaria de toda la provincia. Pruebas individuales y por equipo con clasificación a nacionales.',
            'start_date' => Carbon::now()->addDays(56)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(56)->setHour(17)->setMinute(0),
            'status_id' => $requiresChangesStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Torneo')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '32',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Aulas de competencia']);
        }

        // =====================================================
        // REJECTED (5 new events)
        // =====================================================

        // 56. Fiesta de la Cerveza Sin Alcohol - Festivales/Festival Gastronómico - Sheraton
        $evento = Event::create([
            'title' => 'Fiesta de la Cerveza Sin Alcohol',
            'description' => 'Festival dedicado a cervezas sin alcohol y bebidas artesanales saludables. Food trucks veganos y música acústica en ambiente familiar.',
            'start_date' => Carbon::now()->addDays(33)->setHour(16)->setMinute(0),
            'end_date' => Carbon::now()->addDays(34)->setHour(22)->setMinute(0),
            'status_id' => $rejectedStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival Gastronómico')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Explanada del hotel']);
        }

        // 57. Karaoke Masivo al Aire Libre - Cultura/Concierto - La Rural
        $evento = Event::create([
            'title' => 'Karaoke Masivo al Aire Libre',
            'description' => 'Evento de karaoke masivo con pantalla gigante y sonido profesional. Competencia por categorías y premios al mejor intérprete de la noche.',
            'start_date' => Carbon::now()->addDays(37)->setHour(19)->setMinute(0),
            'end_date' => Carbon::now()->addDays(37)->setHour(23)->setMinute(30),
            'status_id' => $rejectedStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $culturaType->subtypes->where('name', 'Concierto')->first()->id,
            'organization_id' => $laRural?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Escenario de karaoke']);
        }

        // 58. Expo Mascotas del Norte - Ferias/Feria Artesanal - Ente (null image)
        $evento = Event::create([
            'title' => 'Expo Mascotas del Norte',
            'description' => 'Exposición de mascotas con stands de productos, servicios veterinarios, concursos de disfraces y jornada de adopción responsable.',
            'start_date' => Carbon::now()->addDays(41)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(41)->setHour(19)->setMinute(0),
            'status_id' => $rejectedStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $feriasType->id,
            'event_subtype_id' => $feriasType->subtypes->where('name', 'Feria Artesanal')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '2',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Predio de exposición']);
        }

        // 59. Competencia de Drones - Deportes/Competencia - Sheraton
        $evento = Event::create([
            'title' => 'Competencia de Drones FPV Tucumán',
            'description' => 'Carrera de drones FPV con circuito de obstáculos. Categorías amateur y profesional con transmisión en vivo y zona de exhibición tecnológica.',
            'start_date' => Carbon::now()->addDays(44)->setHour(15)->setMinute(0),
            'end_date' => Carbon::now()->addDays(44)->setHour(20)->setMinute(0),
            'status_id' => $rejectedStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $deportesType->id,
            'event_subtype_id' => $deportesType->subtypes->where('name', 'Competencia')->first()->id,
            'organization_id' => $sheratonHotel?->id ?? $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => null,
            'origin_id' => $originNational->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Circuito de drones']);
        }

        // 60. Workshop de Cocina Molecular - Conferencias/Workshop - Ente
        $evento = Event::create([
            'title' => 'Workshop de Cocina Molecular',
            'description' => 'Taller avanzado de técnicas de cocina molecular con chefs internacionales. Esferificación, sous vide, nitrógeno líquido y nuevas texturas.',
            'start_date' => Carbon::now()->addDays(46)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(46)->setHour(18)->setMinute(0),
            'status_id' => $rejectedStatus?->id ?? $pendingInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $conferenciasType->id,
            'event_subtype_id' => $conferenciasType->subtypes->where('name', 'Workshop')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originInternational->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '1',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Cocina de capacitación']);
        }

        // =====================================================
        // CANCELLED (2 new events)
        // =====================================================

        // 61. Festival de Cometa en San Javier - Festivales/Festival Cultural - Ente (null image)
        $evento = Event::create([
            'title' => 'Festival de Cometas en San Javier',
            'description' => 'Festival familiar de cometas y barriletes en la cumbre del Cerro San Javier. Cancelado por pronóstico de vientos extremos.',
            'start_date' => Carbon::now()->addDays(23)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(23)->setHour(17)->setMinute(0),
            'status_id' => $cancelledStatus?->id ?? $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $festivalesType->id,
            'event_subtype_id' => $festivalesType->subtypes->where('name', 'Festival Cultural')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '3',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Cumbre del cerro']);
        }

        // 62. Caminata Histórica del 9 de Julio - Turismo/Tour Guiado - Ente
        $evento = Event::create([
            'title' => 'Caminata Histórica del 9 de Julio',
            'description' => 'Recorrido peatonal guiado por los sitios vinculados a la Declaración de la Independencia. Cancelado por obras de restauración en la Casa Histórica.',
            'start_date' => Carbon::now()->addDays(27)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(27)->setHour(12)->setMinute(0),
            'status_id' => $cancelledStatus?->id ?? $draftStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'is_featured' => false,
            'featured_image' => $getImage(),
            'event_type_id' => $turismoType->id,
            'event_subtype_id' => $turismoType->subtypes->where('name', 'Tour Guiado')->first()->id,
            'organization_id' => $enteDeturismo->id,
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo?->id,
            'origin_id' => $originLocal->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '10',
        ]);
        $loc = $getLocation($locationIndex++);
        if ($loc) {
            $evento->locations()->attach($loc->id, ['location_specific_notes' => 'Casa Histórica de la Independencia']);
        }

        $this->command->info('Extra events created: 62 events for expanded dataset');
    }

    /**
     * Seed 30 demo events concentrated between 30-60 days from now.
     * Half published, half approved_internal. Distributed across 3 orgs.
     */
    private function seedDemoEvents(): void
    {
        $publishedStatus = EventStatus::where('status_code', 'published')->first();
        $approvedInternalStatus = EventStatus::where('status_code', 'approved_internal')->first();

        $sedeUnicaFormat = EventFormat::where('format_code', 'sede_unica')->first();
        $multiSedeFormat = EventFormat::where('format_code', 'multi_sede')->first();

        $originLocal = EventOrigin::where('code', 'local')->first();
        $originNational = EventOrigin::where('code', 'national')->first();


        $frequencyUnico = EventFrequency::where('code', 'unico')->first();
        $frequencyAnual = EventFrequency::where('code', 'anual')->first();
        $frequencyMensual = EventFrequency::where('code', 'mensual')->first();

        $rotationFijo = EventRotationType::where('code', 'fijo')->first();
        $rotationRotativo = EventRotationType::where('code', 'rotativo')->first();
        $rotationItinerante = EventRotationType::where('code', 'itinerante')->first();

        $enteDeturismo = Organization::where('slug', 'ente-turismo-tucuman')->first();
        $sheratonHotel = Organization::where('slug', 'sheraton-tucuman')->first();
        $laRural = Organization::where('slug', 'la-rural-tucuman')->first();

        $entityAdminTurismo = User::where('email', 'ana.garcia@enteturismo.gov.ar')->first();

        $festivalesType = EventType::where('name', 'Festivales')->first();
        $deportesType = EventType::where('name', 'Deportes')->first();
        $culturaType = EventType::where('name', 'Cultura')->first();
        $turismoType = EventType::where('name', 'Turismo')->first();
        $feriasType = EventType::where('name', 'Ferias')->first();
        $conferenciasType = EventType::where('name', 'Conferencias')->first();

        $ubicacionesTurismo = Location::where('entity_id', $enteDeturismo->id)->get();
        $locationCount = $ubicacionesTurismo->count();
        $defaultLocation = $ubicacionesTurismo->first();

        $getLocation = function (int $index) use ($ubicacionesTurismo, $locationCount, $defaultLocation) {
            if ($locationCount === 0) {
                return null;
            }

            return $ubicacionesTurismo->values()->get($index % $locationCount) ?? $defaultLocation;
        };

        $locationIndex = 108;

        $imageCounter = 0;
        $getImage = function () use (&$imageCounter) {
            $imageCounter++;

            return ($imageCounter % 4 === 0) ? null : $this->getRandomSeedImage();
        };

        $orgs = [$enteDeturismo, $sheratonHotel, $laRural];
        $statuses = [$publishedStatus, $approvedInternalStatus];

        // 30 demo events: days 30-60, alternating published/approved_internal
        $demoEvents = [
            // === FESTIVALES (5) ===
            ['Noche de las Peñas Tucumanas', 'Gran encuentro de peñas folclóricas con música en vivo, empanadas y vino patero en la Plaza Independencia.', 30, 18, 31, 2, $festivalesType, 'Festival Folclórico', $frequencyAnual, $rotationFijo, $originLocal, $sedeUnicaFormat, 0, 'Escenario principal Plaza Independencia'],
            ['Festival de la Empanada Artesanal', 'Concurso de la mejor empanada tucumana con degustación libre, shows en vivo y feria de productores locales.', 33, 11, 34, 22, $festivalesType, 'Festival Gastronómico', $frequencyAnual, $rotationFijo, $originLocal, $multiSedeFormat, 1, 'Zona de degustación'],
            ['Festival de Jazz del NOA', 'Tres días de jazz con bandas nacionales e internacionales en el Teatro San Martín y espacios al aire libre.', 35, 20, 37, 23, $festivalesType, 'Festival de Música', $frequencyAnual, $rotationRotativo, $originNational, $multiSedeFormat, 2, 'Escenario Teatro San Martín'],
            ['Fiesta del Limón Tucumano', 'Celebración de la cosecha citrícola con carrozas, elección de la reina y espectáculos folclóricos en Famaillá.', 45, 10, 47, 22, $festivalesType, 'Festival Cultural', $frequencyAnual, $rotationFijo, $originLocal, $sedeUnicaFormat, 0, 'Ruta del Limón - Famaillá'],
            ['Encuentro Nacional de Folklore', 'Festival folclórico con delegaciones de todo el país, peñas, artesanías y gastronomía regional.', 55, 18, 57, 23, $festivalesType, 'Festival Folclórico', $frequencyAnual, $rotationRotativo, $originNational, $multiSedeFormat, 1, 'Anfiteatro Municipal'],

            // === DEPORTES (5) ===
            ['Maratón Cerro San Javier', 'Carrera de montaña de 21km por los senderos del Cerro San Javier con categorías amateur y profesional.', 31, 6, 31, 14, $deportesType, 'Maratón', $frequencyAnual, $rotationFijo, $originLocal, $sedeUnicaFormat, 2, 'Punto de largada: base del cerro'],
            ['Torneo Interprovincial de Vóley Playa', 'Competencia de vóley playa con equipos del NOA en las canchas del Parque 9 de Julio.', 35, 9, 36, 19, $deportesType, 'Torneo', $frequencyAnual, $rotationRotativo, $originNational, $sedeUnicaFormat, 0, 'Canchas Parque 9 de Julio'],
            ['Exhibición de Artes Marciales', 'Demostración de karate, judo, taekwondo y artes marciales mixtas con maestros invitados.', 42, 16, 42, 21, $deportesType, 'Exhibición Deportiva', $frequencyUnico, $rotationFijo, $originLocal, $sedeUnicaFormat, 1, 'Gimnasio Municipal'],
            ['Competencia de Mountain Bike Yungas', 'Circuito de mountain bike por las Yungas tucumanas, 45km de senderos naturales.', 50, 7, 50, 16, $deportesType, 'Competencia', $frequencyAnual, $rotationFijo, $originLocal, $sedeUnicaFormat, 2, 'Sendero de las Yungas'],
            ['Copa Tucumán de Natación', 'Torneo de natación en pileta olímpica con categorías infantil, juvenil y adultos.', 53, 8, 54, 18, $deportesType, 'Torneo', $frequencyAnual, $rotationFijo, $originLocal, $sedeUnicaFormat, 0, 'Natatorio Provincial'],

            // === CULTURA (5) ===
            ['Exposición Pintores del NOA', 'Muestra colectiva de artistas plásticos del Noroeste Argentino en el Museo Timoteo Navarro.', 35, 10, 50, 20, $culturaType, 'Exposición de Arte', $frequencyAnual, $rotationFijo, $originNational, $sedeUnicaFormat, 1, 'Sala principal del museo'],
            ['Noche de Teatro Independiente', 'Ciclo de obras cortas de compañías independientes tucumanas en el Teatro Alberdi.', 37, 21, 37, 23, $culturaType, 'Teatro', $frequencyMensual, $rotationFijo, $originLocal, $sedeUnicaFormat, 2, 'Teatro Alberdi - Sala A'],
            ['Concierto Sinfónica de Tucumán', 'Programa especial con obras de Ginastera, Piazzolla y Guastavino interpretado por la Orquesta Sinfónica.', 35, 20, 35, 22, $culturaType, 'Concierto', $frequencyMensual, $rotationFijo, $originLocal, $sedeUnicaFormat, 0, 'Teatro San Martín - Sala Principal'],
            ['Festival de Danza Contemporánea', 'Presentaciones de danza contemporánea y ballet con compañías locales y nacionales invitadas.', 50, 19, 51, 22, $culturaType, 'Danza', $frequencyAnual, $rotationRotativo, $originNational, $sedeUnicaFormat, 1, 'Centro Cultural Virla'],
            ['Muestra Fotográfica Tucumán Antiguo', 'Fotografías históricas de Tucumán del siglo XIX y XX con piezas de archivo nunca antes exhibidas.', 56, 10, 60, 18, $culturaType, 'Exposición de Arte', $frequencyUnico, $rotationFijo, $originLocal, $sedeUnicaFormat, 2, 'Casa de Gobierno - Salón Blanco'],

            // === TURISMO (5) ===
            ['Ruta de los Artesanos de Tafí', 'Recorrido guiado por talleres artesanales de Tafí del Valle con demostraciones de tejido y cerámica.', 34, 9, 34, 17, $turismoType, 'Ruta Turística', $frequencyAnual, $rotationFijo, $originLocal, $sedeUnicaFormat, 0, 'Punto de salida: Plaza de Tafí'],
            ['Excursión Ruinas de Quilmes', 'Visita guiada a la Ciudad Sagrada de los Quilmes con guías especializados en historia precolombina.', 39, 8, 39, 18, $turismoType, 'Excursión', $frequencyMensual, $rotationFijo, $originLocal, $sedeUnicaFormat, 1, 'Ruinas de Quilmes'],
            ['Tour Gastronómico Yerba Buena', 'Recorrido por restaurantes y bodegas de Yerba Buena con degustación de platos regionales y vinos.', 44, 12, 44, 20, $turismoType, 'Experiencia Gastronómica', $frequencyMensual, $rotationFijo, $originLocal, $sedeUnicaFormat, 2, 'Zona gastronómica Yerba Buena'],
            ['Avistaje de Aves en Reserva Horco Molle', 'Excursión de avistaje con guías ornitólogos en la Reserva Natural de Horco Molle, binoculares incluidos.', 50, 6, 50, 12, $turismoType, 'Tour Guiado', $frequencyMensual, $rotationFijo, $originLocal, $sedeUnicaFormat, 0, 'Entrada Reserva Horco Molle'],
            ['Trekking Cascada del Río Noque', 'Caminata guiada de dificultad media hasta la cascada del Río Noque con almuerzo campestre.', 58, 7, 58, 17, $turismoType, 'Excursión', $frequencyUnico, $rotationFijo, $originLocal, $sedeUnicaFormat, 1, 'Base del sendero Río Noque'],

            // === FERIAS (5) ===
            ['Feria de Artesanías del Norte', 'Artesanos de Tucumán, Salta y Jujuy exhiben y venden sus creaciones en madera, cuero y tejidos.', 35, 10, 36, 20, $feriasType, 'Feria Artesanal', $frequencyAnual, $rotationRotativo, $originNational, $sedeUnicaFormat, 2, 'Paseo de artesanos'],
            ['Expo Vinos del NOA', 'Feria de bodegas del Noroeste con cata de vinos, maridajes y charlas con enólogos reconocidos.', 40, 11, 41, 21, $feriasType, 'Expo Comercial', $frequencyAnual, $rotationRotativo, $originNational, $multiSedeFormat, 0, 'Centro de Convenciones'],
            ['Feria del Libro Tucumán', 'Edición anual de la feria del libro con presentaciones de autores locales, talleres y actividades infantiles.', 50, 10, 52, 20, $feriasType, 'Feria del Libro', $frequencyAnual, $rotationFijo, $originLocal, $sedeUnicaFormat, 1, 'Centro Cultural Virla'],
            ['Mercado Productivo Regional', 'Feria de productores locales con frutas, verduras, dulces artesanales, quesos y miel de la región.', 51, 8, 51, 16, $feriasType, 'Feria Productiva', $frequencyMensual, $rotationFijo, $originLocal, $sedeUnicaFormat, 2, 'Mercado del Norte'],
            ['Expo Turismo Tucumán', 'Feria de turismo con stands de prestadores, sorteos de paquetes turísticos y shows en vivo.', 59, 10, 60, 20, $feriasType, 'Expo Comercial', $frequencyAnual, $rotationFijo, $originNational, $multiSedeFormat, 0, 'Centro de Convenciones Tucumán'],

            // === CONFERENCIAS (5) ===
            ['Congreso de Innovación Turística', 'Congreso con ponencias sobre tecnología aplicada al turismo, marketing digital y sostenibilidad.', 33, 9, 34, 18, $conferenciasType, 'Congreso', $frequencyAnual, $rotationRotativo, $originNational, $sedeUnicaFormat, 1, 'Hotel Sheraton - Salón Imperial'],
            ['Seminario de Gastronomía Sustentable', 'Seminario sobre cocina con productos locales, reducción de desperdicios y cadenas de valor cortas.', 50, 10, 50, 18, $conferenciasType, 'Seminario', $frequencyUnico, $rotationFijo, $originLocal, $sedeUnicaFormat, 2, 'Universidad Nacional de Tucumán'],
            ['Workshop Fotografía de Naturaleza', 'Taller práctico de fotografía de paisajes y fauna en las Yungas con fotógrafos profesionales.', 47, 9, 47, 17, $conferenciasType, 'Workshop', $frequencyUnico, $rotationFijo, $originLocal, $sedeUnicaFormat, 0, 'Reserva Experimental Horco Molle'],
            ['Charla: Historia Viva de Tucumán', 'Ciclo de charlas sobre la historia de Tucumán desde la independencia hasta la actualidad.', 50, 19, 50, 21, $conferenciasType, 'Charla', $frequencyMensual, $rotationFijo, $originLocal, $sedeUnicaFormat, 1, 'Casa Histórica de la Independencia'],
            ['Congreso Patrimonio Cultural del NOA', 'Encuentro de especialistas en preservación del patrimonio cultural e histórico del Noroeste Argentino.', 57, 9, 58, 18, $conferenciasType, 'Congreso', $frequencyAnual, $rotationRotativo, $originNational, $multiSedeFormat, 2, 'Facultad de Filosofía y Letras'],
        ];

        $eventIndex = 0;
        foreach ($demoEvents as $data) {
            [$title, $description, $startDay, $startHour, $endDay, $endHour, $type, $subtypeName, $frequency, $rotation, $origin, $format, $orgIdx, $locationNote] = $data;

            $org = $orgs[$orgIdx];
            $status = $statuses[$eventIndex % 2]; // alternating published / approved_internal

            $evento = Event::create([
                'title' => $title,
                'description' => $description,
                'start_date' => Carbon::now()->addDays($startDay)->setHour($startHour)->setMinute(0),
                'end_date' => Carbon::now()->addDays($endDay)->setHour($endHour)->setMinute(0),
                'status_id' => $status->id,
                'format_id' => $format->id,
                'is_featured' => ($eventIndex % 5 === 0),
                'featured_image' => $getImage(),
                'event_type_id' => $type->id,
                'event_subtype_id' => $type->subtypes->where('name', $subtypeName)->first()->id,
                'organization_id' => $org->id,
                'entity_id' => $enteDeturismo->id,
                'created_by' => $entityAdminTurismo->id,
                'origin_id' => $origin->id,
                'frequency_id' => $frequency->id,
                'rotation_type_id' => $rotation->id,
                'edition_number' => (string) rand(1, 12),
            ]);

            $loc = $getLocation($locationIndex++);
            if ($loc) {
                $evento->locations()->attach($loc->id, ['location_specific_notes' => $locationNote]);
            }

            $eventIndex++;
        }

        $this->command->info('Demo events created: 30 events for calendar demo (days 30-60)');
    }

    /**
     * Create EventApproval audit trail for all non-draft events.
     */
    private function seedEventApprovals(): void
    {
        $entityAdmin = User::where('email', 'ana.garcia@enteturismo.gov.ar')->first();
        $entityStaff1 = User::where('email', 'patricia.lopez@enteturismo.gov.ar')->first();
        $entityStaff2 = User::where('email', 'miguel.sanchez@enteturismo.gov.ar')->first();
        $entityStaff3 = User::where('email', 'lucia.romero@enteturismo.gov.ar')->first();

        $staffUsers = collect([$entityAdmin, $entityStaff1, $entityStaff2, $entityStaff3])->filter()->values();
        $staffIndex = 0;

        $getStaffUser = function () use ($staffUsers, &$staffIndex) {
            $user = $staffUsers->get($staffIndex % $staffUsers->count());
            $staffIndex++;

            return $user;
        };

        // Comment pools for variety
        $approveInternalComments = [
            'Aprobado internamente. Evento cumple con los requisitos del ente.',
            'Revisión interna completada. Datos y documentación verificados.',
            'Aprobación interna otorgada. Evento cumple normativa vigente.',
            'Evento verificado y aprobado. Cumple con los estándares de calidad.',
            'Aprobado tras revisión. Información completa y correcta.',
        ];
        $requestPublicComments = [
            'Solicitud de publicación enviada para aprobación final.',
            'Enviado a revisión pública. Datos verificados y listos para publicar.',
            'Evento listo para publicación. Se solicita aprobación final.',
            'Remitido para aprobación pública. Todo en orden.',
        ];
        $publishComments = [
            'Publicado. Evento visible en el calendario público.',
            'Publicación confirmada. Evento activo y visible al público.',
            'Evento publicado exitosamente en la plataforma.',
            'Aprobación final otorgada. Evento publicado.',
        ];
        $requestChangesComments = [
            'Se requieren modificaciones en la descripción del evento.',
            'Revisar datos de contacto y ubicación. Información incompleta.',
            'La descripción no cumple con los estándares. Reformular y reenviar.',
            'Falta documentación de respaldo. Adjuntar permisos necesarios.',
        ];
        $rejectComments = [
            'Evento rechazado. No cumple con los requisitos mínimos de documentación.',
            'Rechazado. El evento no se alinea con la agenda cultural del ente.',
            'No aprobado. Se recomienda reformular la propuesta para futuras convocatorias.',
        ];

        $events = Event::with('status')->get();
        $commentIndex = 0;

        foreach ($events as $event) {
            $statusCode = $event->status->status_code;

            // Skip statuses that don't generate approvals
            if (in_array($statusCode, ['draft', 'cancelled', 'pending_internal_approval'])) {
                continue;
            }

            $baseTime = $event->created_at ?? Carbon::now()->subDays(7);
            $approvals = [];

            switch ($statusCode) {
                case 'approved_internal':
                    $approvals[] = [
                        'action' => EventApproval::ACTION_APPROVE_INTERNAL,
                        'comments' => $approveInternalComments[$commentIndex % count($approveInternalComments)],
                        'hours_offset' => rand(2, 8),
                    ];
                    break;

                case 'pending_public_approval':
                    $approvals[] = [
                        'action' => EventApproval::ACTION_APPROVE_INTERNAL,
                        'comments' => $approveInternalComments[$commentIndex % count($approveInternalComments)],
                        'hours_offset' => rand(2, 8),
                    ];
                    $approvals[] = [
                        'action' => EventApproval::ACTION_REQUEST_PUBLIC,
                        'comments' => $requestPublicComments[$commentIndex % count($requestPublicComments)],
                        'hours_offset' => rand(12, 36),
                    ];
                    break;

                case 'published':
                    $approvals[] = [
                        'action' => EventApproval::ACTION_APPROVE_INTERNAL,
                        'comments' => $approveInternalComments[$commentIndex % count($approveInternalComments)],
                        'hours_offset' => rand(2, 8),
                    ];
                    $approvals[] = [
                        'action' => EventApproval::ACTION_REQUEST_PUBLIC,
                        'comments' => $requestPublicComments[$commentIndex % count($requestPublicComments)],
                        'hours_offset' => rand(12, 36),
                    ];
                    $approvals[] = [
                        'action' => EventApproval::ACTION_PUBLISH,
                        'comments' => $publishComments[$commentIndex % count($publishComments)],
                        'hours_offset' => rand(24, 72),
                    ];
                    break;

                case 'requires_changes':
                    $approvals[] = [
                        'action' => EventApproval::ACTION_REQUEST_CHANGES,
                        'comments' => $requestChangesComments[$commentIndex % count($requestChangesComments)],
                        'hours_offset' => rand(4, 12),
                    ];
                    break;

                case 'rejected':
                    $approvals[] = [
                        'action' => EventApproval::ACTION_REJECT,
                        'comments' => $rejectComments[$commentIndex % count($rejectComments)],
                        'hours_offset' => rand(6, 24),
                    ];
                    break;
            }

            $commentIndex++;
            $lastApproval = null;

            foreach ($approvals as $approvalData) {
                $lastApproval = EventApproval::create([
                    'event_id' => $event->id,
                    'performed_by' => $getStaffUser()->id,
                    'action' => $approvalData['action'],
                    'comments' => $approvalData['comments'],
                    'performed_at' => $baseTime->copy()->addHours($approvalData['hours_offset']),
                ]);
            }

            // Set published_at for published events
            if ($statusCode === 'published' && $lastApproval) {
                $event->update(['published_at' => $lastApproval->performed_at]);
            }
        }

        $eventCount = Event::count();
        $approvalCount = EventApproval::count();
        $this->command->info("Seeding complete: {$eventCount} events, {$approvalCount} approval records");
        $this->command->info('- Events include requires_changes, rejected, and cancelled statuses');
        $this->command->info('- EventApproval audit trail created for all non-draft events');
    }
}
