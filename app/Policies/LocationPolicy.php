<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class LocationPolicy
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
        return true; // All authenticated users can see locations they have access to
    }

    public function view(User $user, Location $location): bool
    {
        if ($user->tenant_id !== $location->tenant_id) {
            return false;
        }

        return $user->hasAccessToLocation($location->id);
    }

    public function create(User $user): bool
    {
        // Only owners and admins can create locations
        if (!$user->isAdmin()) {
            return false;
        }

        // Check plan limits
        $tenant = $user->tenant;
        return $tenant && $tenant->canAddLocation();
    }

    public function update(User $user, Location $location): bool
    {
        if ($user->tenant_id !== $location->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['location.update', 'location.manage']) || $user->isAdmin();
    }

    public function delete(User $user, Location $location): bool
    {
        if ($user->tenant_id !== $location->tenant_id) {
            return false;
        }

        // Only owners can delete locations
        return $user->isOwner();
    }

    public function manageSettings(User $user, Location $location): bool
    {
        if ($user->tenant_id !== $location->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['location.settings', 'location.manage']) || $user->isAdmin();
    }

    public function manageStaff(User $user, Location $location): bool
    {
        if ($user->tenant_id !== $location->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['location.staff', 'location.manage']) || $user->isAdmin();
    }
}
