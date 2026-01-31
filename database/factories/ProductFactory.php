<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->randomElement([
            'Open Water Course',
            'Advanced Course',
            'Rescue Diver Course',
            'Fun Dive Package',
            'Night Dive',
            'Equipment Rental',
            'Boat Trip',
        ]);

        return [
            'tenant_id' => Tenant::factory(),
            'name' => $name,
            'slug' => Str::slug($name) . '-' . fake()->unique()->numerify('###'),
            'description' => fake()->paragraph(),
            'type' => fake()->randomElement(['course', 'dive', 'rental', 'package']),
            'price' => fake()->randomFloat(2, 50, 1000),
            'duration_minutes' => fake()->randomElement([60, 120, 180, 240, 480]),
            'max_participants' => fake()->numberBetween(2, 10),
            'is_active' => true,
        ];
    }
}
