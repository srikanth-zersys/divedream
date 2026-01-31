<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Location;
use App\Models\Member;
use App\Models\Product;
use App\Models\Schedule;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $totalAmount = fake()->randomFloat(2, 50, 500);

        return [
            'tenant_id' => Tenant::factory(),
            'location_id' => Location::factory(),
            'booking_number' => 'BK-' . strtoupper(Str::random(8)),
            'access_token' => Str::random(64),
            'schedule_id' => Schedule::factory(),
            'member_id' => Member::factory(),
            'product_id' => Product::factory(),
            'booking_date' => fake()->dateTimeBetween('+1 day', '+30 days')->format('Y-m-d'),
            'participant_count' => fake()->numberBetween(1, 4),
            'status' => fake()->randomElement(['pending', 'confirmed', 'completed', 'cancelled']),
            'subtotal' => $totalAmount,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'total_amount' => $totalAmount,
            'amount_paid' => 0,
            'amount_refunded' => 0,
            'balance_due' => $totalAmount,
            'payment_status' => 'pending',
            'currency' => 'USD',
            'source' => 'admin',
            'internal_notes' => fake()->optional()->sentence(),
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function checkedIn(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'checked_in',
            'checked_in_at' => now()->subHours(2),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'fully_paid',
            'amount_paid' => $attributes['total_amount'] ?? 100,
            'balance_due' => 0,
        ]);
    }

    public function forToday(): static
    {
        return $this->state(fn (array $attributes) => [
            'booking_date' => now()->format('Y-m-d'),
        ]);
    }
}
