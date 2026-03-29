<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    protected $model = Event::class;

    /**
     * Event title templates for realistic event names
     */
    private array $eventTitles = [
        'Festival de %s',
        'Encuentro de %s',
        'Muestra de %s',
        'Feria de %s',
        'Jornada de %s',
        'Exposición de %s',
        'Taller de %s',
        'Conferencia de %s',
        'Gala de %s',
        'Ciclo de %s',
    ];

    private array $eventTopics = [
        'Música Folclórica', 'Arte Contemporáneo', 'Gastronomía Regional',
        'Artesanías', 'Teatro Independiente', 'Fotografía', 'Literatura',
        'Danza', 'Cine', 'Vinos Argentinos', 'Emprendimientos', 'Turismo Aventura',
        'Historia Local', 'Cultura Andina', 'Jazz', 'Tango', 'Rock Nacional',
    ];

    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('now', '+3 months');

        // End date must be after start date
        $daysToAdd = $this->faker->numberBetween(1, 7);
        $endDate = (clone $startDate)->modify("+{$daysToAdd} days");

        // Generate realistic event title
        $template = $this->faker->randomElement($this->eventTitles);
        $topic = $this->faker->randomElement($this->eventTopics);
        $title = sprintf($template, $topic);

        return [
            // Core fields
            'title' => $title,
            'description' => $this->generateRealisticDescription($topic),
            'start_date' => $startDate,
            'end_date' => $endDate,

            // Relationships
            'created_by' => User::factory(),
            'entity_id' => \App\Models\Organization::factory(),
            'organization_id' => null,
            'format_id' => fn () => \DB::table('event_formats')->first()?->id ?? 1,
            'status_id' => fn () => \DB::table('event_statuses')->first()?->id ?? 1,

            // Event Type and Subtype (hierarchical categorization - Dec 2, 2025)
            'event_type_id' => fn () => EventType::inRandomOrder()->first()?->id ?? EventType::factory(),
            'event_subtype_id' => fn () => EventSubtype::inRandomOrder()->first()?->id ?? EventSubtype::factory(),

            // Display
            'is_featured' => false,
            'featured_image' => null,
            'logo_url' => null,
            'responsive_image_url' => null,

            // Event info
            'edition_number' => $this->faker->optional(0.7)->numberBetween(1, 50),
            'maps_url' => null,
            'previous_venue' => null,
            'next_venue' => null,
            'event_website' => $this->faker->optional(0.3)->url(),

            // Attendance
            'local_attendance' => $this->faker->optional(0.8)->numberBetween(50, 500),
            'national_attendance' => $this->faker->optional(0.5)->numberBetween(10, 100),
            'international_attendance' => $this->faker->optional(0.2)->numberBetween(5, 50),

            // Foreign keys (normalized)
            'producer_id' => null,
        ];
    }

    /**
     * Generate realistic event description
     */
    private function generateRealisticDescription(string $topic): string
    {
        $descriptions = [
            "Evento imperdible que celebra {$topic} con actividades para toda la familia.",
            "Una experiencia única dedicada a {$topic}, con invitados especiales y talleres interactivos.",
            "Descubrí el mundo de {$topic} en este encuentro que reúne a los mejores exponentes de Tucumán.",
            "Jornada especial sobre {$topic} con entrada libre y gratuita para toda la comunidad.",
            "Celebramos {$topic} con un evento que combina tradición e innovación.",
        ];

        return $this->faker->randomElement($descriptions);
    }

    // =====================================================
    // STATUS STATES
    // =====================================================

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => fn () => \DB::table('event_statuses')->where('status_code', 'draft')->first()?->id ?? 1,
        ]);
    }

    public function pendingInternalApproval(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => fn () => \DB::table('event_statuses')->where('status_code', 'pending_internal_approval')->first()?->id ?? 2,
        ]);
    }

    public function approvedInternal(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => fn () => \DB::table('event_statuses')->where('status_code', 'approved_internal')->first()?->id ?? 3,
        ]);
    }

    public function pendingPublicApproval(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => fn () => \DB::table('event_statuses')->where('status_code', 'pending_public_approval')->first()?->id ?? 4,
        ]);
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => fn () => \DB::table('event_statuses')->where('status_code', 'published')->first()?->id ?? 5,
            'published_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => fn () => \DB::table('event_statuses')->where('status_code', 'rejected')->first()?->id ?? 6,
        ]);
    }

    // =====================================================
    // FEATURE STATES
    // =====================================================

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }


}
