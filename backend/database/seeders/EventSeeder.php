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

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates sample events with proper 3NF relationships.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedEvents();
        });
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
            'featured_image' => 'https://example.com/images/festival-gastronomico.jpg',
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
            'featured_image' => 'https://example.com/images/cerro-san-javier.jpg',
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
            'featured_image' => 'https://example.com/images/ruta-dulce.jpg',
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
                'featured_image' => 'https://example.com/images/cena-san-valentin.jpg',
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
                'featured_image' => 'https://example.com/images/feria-agropecuaria.jpg',
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

        $this->command->info('Events created successfully!');
        $this->command->info('- 3 events created for Ente de Turismo (Internal)');
        $this->command->info('- 2 events created by Sheraton Hotel');
        $this->command->info('- 2 events created by La Rural Tucumán');
        $this->command->info('- All events have 3NF lookup relationships');
    }
}
