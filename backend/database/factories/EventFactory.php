<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'start_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'end_date' => $this->faker->dateTimeBetween('+1 month', '+2 months'),
            'category_id' => Category::inRandomOrder()->first()?->id ?? 1,
            'created_by' => User::inRandomOrder()->first()?->id ?? 1,
            'entity_id' => 1,
            'organization_id' => null,
            'type_id' => 1,
            'status_id' => 1,
            'is_featured' => false,
            'max_attendees' => $this->faker->numberBetween(50, 500),
        ];
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
            'status_id' => 5
        ]);
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 8
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true
        ]);
    }
}
