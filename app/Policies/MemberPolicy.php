<?php

namespace App\Policies;

use App\Models\Member;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class MemberPolicy
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
        return $user->hasAnyPermission(['member.view', 'member.manage']);
    }

    public function view(User $user, Member $member): bool
    {
        if ($user->tenant_id !== $member->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['member.view', 'member.manage']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyPermission(['member.create', 'member.manage']);
    }

    public function update(User $user, Member $member): bool
    {
        if ($user->tenant_id !== $member->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['member.update', 'member.manage']);
    }

    public function delete(User $user, Member $member): bool
    {
        if ($user->tenant_id !== $member->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['member.delete', 'member.manage']);
    }

    public function verifyCertification(User $user, Member $member): bool
    {
        if ($user->tenant_id !== $member->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['member.verify_cert', 'member.manage']);
    }
}
