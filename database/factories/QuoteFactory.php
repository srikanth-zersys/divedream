<?php

namespace Database\Factories;

use App\Models\Quote;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuoteFactory extends Factory
{
    protected $model = Quote::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'quote_number' => 'QT-' . fake()->unique()->numerify('######'),
            'customer_name' => fake()->name(),
            'customer_email' => fake()->email(),
            'customer_phone' => fake()->phoneNumber(),
            'customer_company' => fake()->optional()->company(),
            'type' => fake()->randomElement(['corporate', 'group', 'event', 'custom']),
            'status' => fake()->randomElement(['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired']),
            'valid_until' => fake()->dateTimeBetween('+7 days', '+30 days'),
            'subtotal' => fake()->randomFloat(2, 500, 10000),
            'discount_amount' => fake()->randomFloat(2, 0, 500),
            'tax_amount' => fake()->randomFloat(2, 0, 1000),
            'total' => fake()->randomFloat(2, 500, 10000),
            'notes' => fake()->optional()->paragraph(),
            'terms' => 'Standard terms and conditions apply.',
        ];
    }
}
