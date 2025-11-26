<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Category;
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
            'title' => $title,
            'description' => $this->generateRealisticDescription($topic),
            'start_date' => $startDate,
            'end_date' => $endDate,

            // Use factories for relationships
            'category_id' => Category::factory(),
            'created_by' => User::factory(),
            'entity_id' => \App\Models\Organization::factory(),
            'organization_id' => null,
            'type_id' => fn() => \DB::table('event_types')->first()?->id ?? 1,
            'status_id' => fn() => \DB::table('event_statuses')->first()?->id ?? 1,
            'is_featured' => false,
            'max_attendees' => $this->faker->numberBetween(50, 500),
            'cta_text' => $this->faker->randomElement(['Ver Más', 'Inscribirse', 'Comprar Entradas', 'Reservar']),
            'cta_link' => null, // Optional
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

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 1
        ]);
    }

    public function pendingReview(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 2
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 3
        ]);
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 5
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true
        ]);
    }
}
