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

// Process marketing automation every 5 minutes
// - Pre-trip reminder emails
// - Abandoned cart recovery emails
// - Post-trip review requests
Schedule::command('automation:process')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->runInBackground();

// Process lead nurturing sequences every 15 minutes
// - Welcome email series
// - Re-engagement campaigns
Schedule::command('leads:process-nurturing')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->runInBackground();

// Process referral rewards hourly
// - Issue pending rewards after booking completion
// - Expire old referral codes
Schedule::command('referrals:process-rewards')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground();

// Apply lead score decay weekly (Sundays at midnight)
Schedule::command('leads:decay-scores')
    ->weeklyOn(0, '00:00')
    ->withoutOverlapping()
    ->runInBackground();

// Start re-engagement sequences for stale leads daily
Schedule::command('leads:re-engagement')
    ->dailyAt('09:00')
    ->withoutOverlapping()
    ->runInBackground();
