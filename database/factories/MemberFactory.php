<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class MemberFactory extends Factory
{
    protected $model = Member::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'date_of_birth' => fake()->date('Y-m-d', '-18 years'),
            'certification_level' => fake()->randomElement(['Open Water', 'Advanced', 'Rescue', 'Divemaster', 'Instructor']),
            'certification_agency' => fake()->randomElement(['PADI', 'SSI', 'NAUI', 'BSAC']),
            'total_dives' => fake()->numberBetween(0, 500),
            'emergency_contact_name' => fake()->name(),
            'emergency_contact_phone' => fake()->phoneNumber(),
            'is_active' => true,
        ];
    }
}
