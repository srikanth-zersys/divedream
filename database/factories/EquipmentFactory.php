<?php

namespace Database\Factories;

use App\Models\Equipment;
use App\Models\Location;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class EquipmentFactory extends Factory
{
    protected $model = Equipment::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'location_id' => Location::factory(),
            'name' => fake()->randomElement(['BCD', 'Regulator', 'Wetsuit', 'Mask', 'Fins', 'Tank', 'Computer']),
            'type' => fake()->randomElement(['rental', 'for_sale', 'both']),
            'size' => fake()->randomElement(['XS', 'S', 'M', 'L', 'XL']),
            'quantity' => fake()->numberBetween(1, 20),
            'rental_price' => fake()->randomFloat(2, 10, 50),
            'sale_price' => fake()->randomFloat(2, 100, 1000),
            'condition' => fake()->randomElement(['new', 'good', 'fair', 'needs_service']),
            'last_service_date' => fake()->date(),
            'is_active' => true,
        ];
    }
}
