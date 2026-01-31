<?php

namespace App\Policies;

use App\Models\Schedule;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SchedulePolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('super-admin')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasAnyPermission(['schedule.view', 'schedule.manage']);
    }

    public function view(User $user, Schedule $schedule): bool
    {
        if ($user->tenant_id !== $schedule->tenant_id) {
            return false;
        }

        if (!$user->hasAccessToLocation($schedule->location_id)) {
            return false;
        }

        return $user->hasAnyPermission(['schedule.view', 'schedule.manage']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyPermission(['schedule.create', 'schedule.manage']);
    }

    public function update(User $user, Schedule $schedule): bool
    {
        if ($user->tenant_id !== $schedule->tenant_id) {
            return false;
        }

        if (!$user->hasAccessToLocation($schedule->location_id)) {
            return false;
        }

        return $user->hasAnyPermission(['schedule.update', 'schedule.manage']);
    }

    public function delete(User $user, Schedule $schedule): bool
    {
        if ($user->tenant_id !== $schedule->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['schedule.delete', 'schedule.manage']);
    }

    public function assignInstructor(User $user, Schedule $schedule): bool
    {
        if ($user->tenant_id !== $schedule->tenant_id) {
            return false;
        }

        if (!$user->hasAccessToLocation($schedule->location_id)) {
            return false;
        }

        return $user->hasAnyPermission(['schedule.assign', 'schedule.manage']);
    }

    public function cancel(User $user, Schedule $schedule): bool
    {
        if ($user->tenant_id !== $schedule->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['schedule.cancel', 'schedule.manage']);
    }
}
