<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Sentry\Laravel\Integration;
use Spatie\Health\Commands\ScheduleCheckHeartbeatCommand;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders([
        \App\Providers\TenantServiceProvider::class,
    ])
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Web middleware
        $middleware->web(append: [
            \App\Http\Middleware\ResolveTenant::class,
            \App\Http\Middleware\ResolveLocation::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Alias middleware for route groups
        $middleware->alias([
            'tenant' => \App\Http\Middleware\EnsureTenantAccess::class,
            'location' => \App\Http\Middleware\EnsureLocationAccess::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        Integration::handles($exceptions);
    })
    ->withSchedule(function (Schedule $schedule) {
        $schedule->command(\Spatie\Health\Commands\RunHealthChecksCommand::class)->everyMinute();
        $schedule->command(ScheduleCheckHeartbeatCommand::class)->everyMinute();
    })
    ->create();
