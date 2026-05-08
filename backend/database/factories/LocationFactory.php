<?php

namespace Database\Factories;

use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->city(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => 'Demo State',
            'country' => 'Argentina',
            'postal_code' => $this->faker->postcode(),
            'latitude' => $this->faker->latitude(-26.8, -27.0),
            'longitude' => $this->faker->longitude(-65.2, -65.4),
            'description' => $this->faker->optional()->sentence(),
            'phone' => $this->faker->optional()->phoneNumber(),
            'email' => $this->faker->optional()->safeEmail(),
            'is_active' => true,
            'entity_id' => \App\Models\Organization::factory(),
        ];
    }

    /**
     * Indicate that the location is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the location is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }
}
