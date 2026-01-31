<?php

namespace App\Policies;

use App\Models\Equipment;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class EquipmentPolicy
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
        return $user->hasAnyPermission(['equipment.view', 'equipment.manage']);
    }

    public function view(User $user, Equipment $equipment): bool
    {
        if ($user->tenant_id !== $equipment->tenant_id) {
            return false;
        }

        if (!$user->hasAccessToLocation($equipment->location_id)) {
            return false;
        }

        return $user->hasAnyPermission(['equipment.view', 'equipment.manage']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyPermission(['equipment.create', 'equipment.manage']);
    }

    public function update(User $user, Equipment $equipment): bool
    {
        if ($user->tenant_id !== $equipment->tenant_id) {
            return false;
        }

        if (!$user->hasAccessToLocation($equipment->location_id)) {
            return false;
        }

        return $user->hasAnyPermission(['equipment.update', 'equipment.manage']);
    }

    public function delete(User $user, Equipment $equipment): bool
    {
        if ($user->tenant_id !== $equipment->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['equipment.delete', 'equipment.manage']);
    }

    public function logMaintenance(User $user, Equipment $equipment): bool
    {
        if ($user->tenant_id !== $equipment->tenant_id) {
            return false;
        }

        if (!$user->hasAccessToLocation($equipment->location_id)) {
            return false;
        }

        return $user->hasAnyPermission(['equipment.maintenance', 'equipment.manage']);
    }
}
