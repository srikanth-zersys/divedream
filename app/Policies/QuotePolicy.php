<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class QuotePolicy
{
    use HandlesAuthorization;

    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('super-admin')) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyPermission(['quote.view', 'quote.manage']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Quote $quote): bool
    {
        // Must belong to same tenant
        if ($user->tenant_id !== $quote->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['quote.view', 'quote.manage']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyPermission(['quote.create', 'quote.manage']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Quote $quote): bool
    {
        if ($user->tenant_id !== $quote->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['quote.update', 'quote.manage']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Quote $quote): bool
    {
        if ($user->tenant_id !== $quote->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['quote.delete', 'quote.manage']);
    }

    /**
     * Determine whether the user can send the quote.
     */
    public function send(User $user, Quote $quote): bool
    {
        if ($user->tenant_id !== $quote->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['quote.send', 'quote.manage']);
    }

    /**
     * Determine whether the user can convert the quote to booking.
     */
    public function convert(User $user, Quote $quote): bool
    {
        if ($user->tenant_id !== $quote->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['quote.convert', 'quote.manage', 'booking.create']);
    }
}
