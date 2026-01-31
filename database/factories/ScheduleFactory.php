<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Schedule;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScheduleFactory extends Factory
{
    protected $model = Schedule::class;

    public function definition(): array
    {
        $startTime = fake()->dateTimeBetween('+1 day', '+30 days');

        return [
            'tenant_id' => Tenant::factory(),
            'location_id' => Location::factory(),
            'name' => fake()->randomElement(['Morning Dive', 'Afternoon Dive', 'Night Dive', 'Boat Dive', 'Shore Dive']),
            'description' => fake()->sentence(),
            'start_time' => $startTime,
            'end_time' => (clone $startTime)->modify('+3 hours'),
            'max_participants' => fake()->numberBetween(4, 20),
            'price' => fake()->randomFloat(2, 50, 300),
            'is_active' => true,
        ];
    }
}
