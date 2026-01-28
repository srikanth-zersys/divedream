<?php

namespace App\Policies;

use App\Models\Instructor;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class InstructorPolicy
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
        return $user->hasAnyPermission(['instructor.view', 'instructor.manage', 'schedule.manage']);
    }

    public function view(User $user, Instructor $instructor): bool
    {
        if ($user->tenant_id !== $instructor->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['instructor.view', 'instructor.manage']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyPermission(['instructor.create', 'instructor.manage']);
    }

    public function update(User $user, Instructor $instructor): bool
    {
        if ($user->tenant_id !== $instructor->tenant_id) {
            return false;
        }

        // Instructors can update their own profile
        if ($user->instructor?->id === $instructor->id) {
            return true;
        }

        return $user->hasAnyPermission(['instructor.update', 'instructor.manage']);
    }

    public function delete(User $user, Instructor $instructor): bool
    {
        if ($user->tenant_id !== $instructor->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['instructor.delete', 'instructor.manage']);
    }

    public function manageAvailability(User $user, Instructor $instructor): bool
    {
        if ($user->tenant_id !== $instructor->tenant_id) {
            return false;
        }

        // Instructors can manage their own availability
        if ($user->instructor?->id === $instructor->id) {
            return true;
        }

        return $user->hasAnyPermission(['instructor.availability', 'instructor.manage']);
    }
}
