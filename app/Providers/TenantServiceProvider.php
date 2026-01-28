<?php

namespace App\Providers;

use App\Services\TenantService;
use Illuminate\Support\ServiceProvider;

class TenantServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(TenantService::class, function ($app) {
            return new TenantService();
        });

        // Alias for easier access
        $this->app->alias(TenantService::class, 'tenant');
    }

    public function boot(): void
    {
        //
    }
}
