<?php

namespace Database\Factories;

use App\Models\Instructor;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class InstructorFactory extends Factory
{
    protected $model = Instructor::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'certification_level' => fake()->randomElement(['Divemaster', 'Open Water Instructor', 'Course Director']),
            'certification_number' => fake()->numerify('INST-######'),
            'specialties' => fake()->randomElements(['Deep Diving', 'Night Diving', 'Wreck Diving', 'Nitrox', 'Cave Diving'], 2),
            'bio' => fake()->paragraph(),
            'is_active' => true,
        ];
    }
}
