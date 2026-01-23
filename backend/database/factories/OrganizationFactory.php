<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 9999),
            'cuit' => fake()->numerify('##-########-#'),
            'description' => fake()->optional()->sentence(),
            'status_id' => fn () => \DB::table('organization_statuses')->where('status_code', 'active')->first()?->id ?? 1,
            'type_id' => fn () => \DB::table('organization_types')->where('type_code', 'event_organizer')->first()?->id ?? 1,
            'parent_id' => null,
            'trust_level' => 1,
        ];
    }

    /**
     * Indicate that the organization is a primary entity.
     */
    public function primaryEntity(): static
    {
        return $this->state(fn (array $attributes) => [
            'type_id' => fn () => \DB::table('organization_types')->where('type_code', 'primary_entity')->first()?->id ?? 1,
            'parent_id' => null,
        ]);
    }

    /**
     * Indicate that the organization is an event organizer.
     */
    public function eventOrganizer(): static
    {
        return $this->state(fn (array $attributes) => [
            'type_id' => fn () => \DB::table('organization_types')->where('type_code', 'event_organizer')->first()?->id ?? 2,
        ]);
    }

    /**
     * Indicate that the organization is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => fn () => \DB::table('organization_statuses')->where('status_code', 'active')->first()?->id ?? 1,
        ]);
    }

    /**
     * Indicate that the organization is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => fn () => \DB::table('organization_statuses')->where('status_code', 'inactive')->first()?->id ?? 2,
        ]);
    }
}
