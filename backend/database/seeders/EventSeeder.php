<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventFormat;
use App\Models\EventFrequency;
use App\Models\EventOrigin;
use App\Models\EventRotationType;
use App\Models\EventStatus;
use App\Models\EventTheme;
use App\Models\Organization;
use App\Models\User;
use App\Models\EventType;
use App\Models\EventSubtype;
use App\Models\Location;
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

        // Get event formats (previously event types)
        $multiSedeFormat = EventFormat::where('format_code', 'multi_sede')->first();
        $sedeUnicaFormat = EventFormat::where('format_code', 'sede_unica')->first();

        // Get 3NF lookup values
        $originLocal = EventOrigin::where('code', 'local')->first();
        $originNational = EventOrigin::where('code', 'national')->first();
        $originInternational = EventOrigin::where('code', 'international')->first();

        $themeCultural = EventTheme::where('code', 'cultural')->first();
        $themeGastronomico = EventTheme::where('code', 'gastronomico')->first();
        $themeDeportivo = EventTheme::where('code', 'deportivo')->first();
        $themeNegocios = EventTheme::where('code', 'negocios')->first();

        $frequencyUnico = EventFrequency::where('code', 'unico')->first();
        $frequencyAnual = EventFrequency::where('code', 'anual')->first();

        $rotationFijo = EventRotationType::where('code', 'fijo')->first();
        $rotationRotativo = EventRotationType::where('code', 'rotativo')->first();

        // Get organizations and their admins
        $enteDeturismo = Organization::where('slug', 'ente-turismo-tucuman')->first();
        $secretariaCultura = Organization::where('slug', 'secretaria-cultura')->first();

        // Get Entity Admins
        $entityAdminTurismo = User::where('email', 'ana.garcia@enteturismo.gov.ar')->first();
        $entityAdminCultura = User::where('email', 'carlos.mendoza@cultura.gov.ar')->first();

        // Get event types and subtypes
        $festivalesType = EventType::where('name', 'Festivales')->first();
        $turismoType = EventType::where('name', 'Turismo')->first();
        $culturaType = EventType::where('name', 'Cultura')->first();

        $gastronomicoSubtype = EventSubtype::where('event_type_id', $festivalesType->id)
            ->where('name', 'Festival Gastronómico')->first();
        $excursionSubtype = EventSubtype::where('event_type_id', $turismoType->id)
            ->where('name', 'Tour Guiado')->first();
        $rutaTuristicaSubtype = EventSubtype::where('event_type_id', $turismoType->id)
            ->where('name', 'Ruta Turística')->first();
        $danzaSubtype = EventSubtype::where('event_type_id', $culturaType->id)
            ->where('name', 'Danza')->first();
        $exposicionSubtype = EventSubtype::where('event_type_id', $culturaType->id)
            ->where('name', 'Exposición de Arte')->first();

        // Get locations for each entity
        $ubicacionesTurismo = Location::where('entity_id', $enteDeturismo->id)->get();
        $ubicacionesCultura = Location::where('entity_id', $secretariaCultura->id)->get();

        // Events for Ente de Turismo
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
            // 3NF fields
            'origin_id' => $originLocal->id,
            'theme_id' => $themeGastronomico->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '15',
        ]);

        // Associate locations with the first tourism event
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
            // 3NF fields
            'origin_id' => $originLocal->id,
            'theme_id' => $themeDeportivo->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '3',
        ]);

        // Associate location with the second tourism event
        if ($ubicacionesTurismo->count() > 2) {
            $eventoTurismo2->locations()->attach([
                $ubicacionesTurismo->skip(2)->first()->id => ['location_specific_notes' => 'Punto de encuentro']
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
            // 3NF fields
            'origin_id' => $originLocal->id,
            'theme_id' => $themeGastronomico->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '8',
        ]);

        // Associate location with the third tourism event
        if ($ubicacionesTurismo->count() > 0) {
            $eventoTurismo3->locations()->attach([
                $ubicacionesTurismo->first()->id => ['location_specific_notes' => 'Punto de salida del tour']
            ]);
        }

        // Events for Secretaría de Cultura
        $eventoCultura1 = Event::create([
            'title' => 'Gala de Danza Folclórica Argentina',
            'description' => 'Espectacular gala que presenta los mejores exponentes de la danza folclórica argentina, con la participación de grupos locales y nacionales. Una celebración de nuestras tradiciones culturales.',
            'start_date' => Carbon::now()->addDays(20)->setHour(20)->setMinute(0),
            'end_date' => Carbon::now()->addDays(20)->setHour(22)->setMinute(30),
            'status_id' => $publishedStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'featured_image' => 'https://example.com/images/gala-folklorica.jpg',
            'is_featured' => true,
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $danzaSubtype->id,
            'organization_id' => $secretariaCultura->id,
            'entity_id' => $secretariaCultura->id,
            'created_by' => $entityAdminCultura->id,
            // 3NF fields
            'origin_id' => $originNational->id,
            'theme_id' => $themeCultural->id,
            'frequency_id' => $frequencyAnual->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '20',
        ]);

        // Associate location with the first culture event
        if ($ubicacionesCultura->count() > 0) {
            $eventoCultura1->locations()->attach([
                $ubicacionesCultura->first()->id => ['location_specific_notes' => 'Salón principal']
            ]);
        }

        $eventoCultura2 = Event::create([
            'title' => 'Exposición: "Tesoros del Patrimonio Tucumano"',
            'description' => 'Muestra extraordinaria que reúne piezas históricas y arqueológicas que narran la rica historia de Tucumán desde la época precolombina hasta la actualidad.',
            'start_date' => Carbon::now()->addDays(10)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(40)->setHour(18)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'format_id' => $sedeUnicaFormat->id,
            'featured_image' => 'https://example.com/images/exposicion-patrimonio.jpg',
            'is_featured' => false,
            'event_type_id' => $culturaType->id,
            'event_subtype_id' => $exposicionSubtype->id,
            'organization_id' => $secretariaCultura->id,
            'entity_id' => $secretariaCultura->id,
            'created_by' => $entityAdminCultura->id,
            // 3NF fields
            'origin_id' => $originLocal->id,
            'theme_id' => $themeCultural->id,
            'frequency_id' => $frequencyUnico->id,
            'rotation_type_id' => $rotationFijo->id,
            'edition_number' => '5',
        ]);

        // Associate location with the second culture event
        if ($ubicacionesCultura->count() > 1) {
            $eventoCultura2->locations()->attach([
                $ubicacionesCultura->skip(1)->first()->id => ['location_specific_notes' => 'Salas 1, 2 y 3']
            ]);
        }

        // Events from External Organizations (require approval workflow)
        $sheratonHotel = Organization::where('name', 'LIKE', '%Sheraton%')->first();
        $laRural = Organization::where('name', 'LIKE', '%Rural%')->first();
        $centroVirla = Organization::where('name', 'LIKE', '%Virla%')->first();

        // Event from Sheraton Hotel (requires approval from Ente de Turismo)
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
                // 3NF fields
                'origin_id' => $originLocal->id,
                'theme_id' => $themeGastronomico->id,
                'frequency_id' => $frequencyAnual->id,
                'rotation_type_id' => $rotationFijo->id,
                'edition_number' => '10',
            ]);

            // Associate location with Sheraton event
            if ($ubicacionesTurismo->count() > 0) {
                $eventoSheraton->locations()->attach([
                    $ubicacionesTurismo->first()->id => [
                        'location_specific_notes' => 'Evento en salón principal del hotel',
                        'max_attendees_for_location' => 150,
                    ]
                ]);
            }
        }

        // Event from La Rural (approved internally, ready for public approval)
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
                // 3NF fields
                'origin_id' => $originNational->id,
                'theme_id' => $themeNegocios->id,
                'frequency_id' => $frequencyAnual->id,
                'rotation_type_id' => $rotationRotativo->id,
                'edition_number' => '42',
            ]);

            // Associate location with La Rural event
            if ($ubicacionesTurismo->count() > 0) {
                $eventoRural->locations()->attach([
                    $ubicacionesTurismo->first()->id => [
                        'location_specific_notes' => 'Uso completo del predio ferial',
                        'max_attendees_for_location' => 5000,
                    ]
                ]);
            }
        }

        // Event from Centro Cultural Virla (published external event)
        if ($centroVirla) {
            $eventoVirla = Event::create([
                'title' => 'Muestra de Arte Contemporáneo Tucumano',
                'description' => 'Exhibición de obras de artistas contemporáneos tucumanos emergentes. Incluye pintura, escultura, fotografía y nuevos medios digitales.',
                'start_date' => Carbon::now()->addDays(12)->setHour(18)->setMinute(0),
                'end_date' => Carbon::now()->addDays(35)->setHour(21)->setMinute(0),
                'status_id' => $publishedStatus->id,
                'format_id' => $sedeUnicaFormat->id,
                'featured_image' => 'https://example.com/images/arte-contemporaneo.jpg',
                'is_featured' => false,
                'organization_id' => $centroVirla->id,
                'entity_id' => $secretariaCultura->id,
                'created_by' => null,
                'event_type_id' => $culturaType->id,
                'event_subtype_id' => $exposicionSubtype->id,
                // 3NF fields
                'origin_id' => $originLocal->id,
                'theme_id' => $themeCultural->id,
                'frequency_id' => $frequencyUnico->id,
                'rotation_type_id' => $rotationFijo->id,
                'edition_number' => '12',
            ]);

            // Associate location with Centro Virla event
            if ($ubicacionesCultura->count() > 0) {
                $eventoVirla->locations()->attach([
                    $ubicacionesCultura->first()->id => [
                        'location_specific_notes' => 'Galería principal',
                        'max_attendees_for_location' => 200,
                    ]
                ]);
            }
        }

        // Create 2 draft events from organizers (for testing organizer workflow)
        $draftStatus = EventStatus::where('status_code', 'draft')->first();
        $negociosType = EventType::where('name', 'Negocios y Conferencias')->first();
        $conferenciaProfesionalSubtype = $negociosType?->eventSubtypes()
            ->where('name', 'Conferencia Profesional')->first();
        $themeAcademico = DB::table('event_themes')->where('name', 'academico')->first();

        if ($sheratonHotel && $draftStatus && $negociosType && $conferenciaProfesionalSubtype) {
            $workshopMarketing = Event::create([
                'title' => 'Workshop de Marketing Digital',
                'description' => 'Taller práctico de estrategias de marketing digital para el sector turístico.',
                'start_date' => Carbon::now()->addDays(20)->setHour(10)->setMinute(0),
                'end_date' => Carbon::now()->addDays(20)->setHour(18)->setMinute(0),
                'status_id' => $draftStatus->id,
                'format_id' => $sedeUnicaFormat->id,
                'event_type_id' => $negociosType->id,
                'event_subtype_id' => $conferenciaProfesionalSubtype->id,
                'organization_id' => $sheratonHotel->id,
                'entity_id' => $enteDeturismo->id,  // Parent de Sheraton
                'created_by' => null,
                'origin_id' => $originLocal->id,
                'theme_id' => $themeAcademico?->id,
                'frequency_id' => $frequencyUnico->id,
                'rotation_type_id' => $rotationFijo->id,
                'edition_number' => '1',
                // Campos opcionales para testing
                'local_attendance' => 50,
                'national_attendance' => 10,
                'event_website' => 'https://ejemplo.com/workshop-marketing',
                'maps_url' => 'https://maps.google.com/?q=Sheraton+Tucuman',
            ]);

            // Associate location with Workshop event
            if ($ubicacionesTurismo->count() > 0) {
                $workshopMarketing->locations()->attach([
                    $ubicacionesTurismo->first()->id => [
                        'location_specific_notes' => 'Sala de conferencias nivel 2',
                        'max_attendees_for_location' => 80,
                    ]
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
                'entity_id' => $enteDeturismo->id,  // Parent de La Rural
                'created_by' => null,
                'origin_id' => $originLocal->id,
                'theme_id' => $themeGastronomico->id,
                'frequency_id' => $frequencyAnual->id,
                'rotation_type_id' => $rotationRotativo->id,
                'edition_number' => '6',
                // Campos opcionales
                'local_attendance' => 80,
                'international_attendance' => 5,
                'virtual_transmission' => false,
            ]);

            // Associate location with Degustación event
            if ($ubicacionesTurismo->count() > 0) {
                $degustacionVinos->locations()->attach([
                    $ubicacionesTurismo->first()->id => [
                        'location_specific_notes' => 'Pabellón de degustaciones',
                        'max_attendees_for_location' => 120,
                    ]
                ]);
            }
        }

        $this->command->info('Events created successfully!');
        $this->command->info('- 3 events created for Ente de Turismo (Internal)');
        $this->command->info('- 2 events created for Secretaría de Cultura (Internal)');
        $this->command->info('- 3 events created by External Organizations');
        $this->command->info('- 2 draft events created by External Organizations (for testing)');
        $this->command->info('- All events have 3NF lookup relationships (origin, theme, frequency, rotation_type)');
    }
}
