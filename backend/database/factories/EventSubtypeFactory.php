<?php

namespace Database\Factories;

use App\Models\EventSubtype;
use App\Models\EventType;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EventSubtype>
 */
class EventSubtypeFactory extends Factory
{
    protected $model = EventSubtype::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'event_type_id' => EventType::factory(),
            'entity_id' => Organization::factory(),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the event subtype is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the event subtype is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Create subtype for a specific event type.
     */
    public function forEventType(EventType $eventType): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type_id' => $eventType->id,
            'entity_id' => $eventType->entity_id,
        ]);
    }
}
