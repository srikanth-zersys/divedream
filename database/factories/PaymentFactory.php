<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'booking_id' => Booking::factory(),
            'member_id' => Member::factory(),
            'payment_number' => 'PAY-' . strtoupper($this->faker->bothify('??########')),
            'amount' => $this->faker->randomFloat(2, 50, 500),
            'currency' => 'usd',
            'type' => 'payment',
            'method' => 'card',
            'status' => 'succeeded',
            'stripe_payment_intent_id' => 'pi_' . $this->faker->bothify('##????##????##????##'),
            'stripe_charge_id' => 'ch_' . $this->faker->bothify('##????##????##????##'),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function succeeded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'succeeded',
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'failure_reason' => $this->faker->sentence(),
        ]);
    }

    public function deposit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'deposit',
        ]);
    }

    public function refund(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'refund',
            'stripe_refund_id' => 're_' . $this->faker->bothify('##????##????##????##'),
        ]);
    }

    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'method' => 'cash',
            'stripe_payment_intent_id' => null,
            'stripe_charge_id' => null,
        ]);
    }

    public function forBooking(Booking $booking): static
    {
        return $this->state(fn (array $attributes) => [
            'tenant_id' => $booking->tenant_id,
            'booking_id' => $booking->id,
            'member_id' => $booking->member_id,
        ]);
    }
}
