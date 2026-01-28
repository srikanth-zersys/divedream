<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Equipment;
use App\Models\Instructor;
use App\Models\Location;
use App\Models\Member;
use App\Models\Schedule;
use App\Policies\BookingPolicy;
use App\Policies\EquipmentPolicy;
use App\Policies\InstructorPolicy;
use App\Policies\LocationPolicy;
use App\Policies\MemberPolicy;
use App\Policies\SchedulePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     */
    protected $policies = [
        Booking::class => BookingPolicy::class,
        Member::class => MemberPolicy::class,
        Instructor::class => InstructorPolicy::class,
        Equipment::class => EquipmentPolicy::class,
        Schedule::class => SchedulePolicy::class,
        Location::class => LocationPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
