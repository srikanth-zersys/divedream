<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Clean up expired unpaid bookings every 5 minutes
Schedule::command('bookings:cleanup-expired')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->runInBackground();
