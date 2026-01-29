<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Member;
use App\Models\Schedule;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'schedule_id' => Schedule::factory(),
            'member_id' => Member::factory(),
            'participant_count' => fake()->numberBetween(1, 4),
            'status' => fake()->randomElement(['pending', 'confirmed', 'completed', 'cancelled']),
            'total_price' => fake()->randomFloat(2, 50, 500),
            'notes' => fake()->optional()->sentence(),
            'booked_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }
}
