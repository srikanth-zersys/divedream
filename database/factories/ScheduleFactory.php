<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Product;
use App\Models\Schedule;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScheduleFactory extends Factory
{
    protected $model = Schedule::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'location_id' => Location::factory(),
            'product_id' => Product::factory(),
            'title' => fake()->randomElement(['Morning Dive', 'Afternoon Dive', 'Night Dive', 'Boat Dive', 'Shore Dive']),
            'description' => fake()->sentence(),
            'type' => fake()->randomElement(['fun_dive', 'course_session', 'discover_scuba', 'snorkeling', 'private_trip', 'boat_charter', 'other']),
            'date' => fake()->dateTimeBetween('+1 day', '+30 days')->format('Y-m-d'),
            'start_time' => fake()->randomElement(['06:00', '08:00', '10:00', '14:00', '18:00']),
            'end_time' => fake()->randomElement(['10:00', '12:00', '14:00', '18:00', '21:00']),
            'max_participants' => fake()->numberBetween(4, 20),
            'booked_count' => 0,
            'min_participants' => fake()->numberBetween(1, 3),
            'status' => 'scheduled',
            'is_public' => true,
            'allow_online_booking' => true,
        ];
    }

    /**
     * Set the schedule as cancelled
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    /**
     * Set the schedule for today
     */
    public function today(): static
    {
        return $this->state(fn (array $attributes) => [
            'date' => now()->format('Y-m-d'),
        ]);
    }
}
