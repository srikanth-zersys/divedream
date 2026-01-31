<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition(): array
    {
        $company = fake()->unique()->company();
        return [
            'name' => $company,
            'slug' => Str::slug($company),
            'subdomain' => Str::slug($company),
            'email' => fake()->unique()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'timezone' => 'UTC',
            'currency' => 'USD',
            'plan' => 'starter',
            'status' => 'active',
            'settings' => [],
        ];
    }
}
