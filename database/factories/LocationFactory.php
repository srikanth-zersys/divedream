<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class LocationFactory extends Factory
{
    protected $model = Location::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'name' => fake()->company() . ' Dive Center',
            'address' => fake()->address(),
            'city' => fake()->city(),
            'country' => fake()->country(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->email(),
            'is_active' => true,
        ];
    }
}
