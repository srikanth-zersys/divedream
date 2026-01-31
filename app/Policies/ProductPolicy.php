<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductPolicy
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
        return $user->hasAnyPermission(['product.view', 'product.manage']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Product $product): bool
    {
        // Must belong to same tenant
        if ($user->tenant_id !== $product->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['product.view', 'product.manage']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyPermission(['product.create', 'product.manage']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Product $product): bool
    {
        if ($user->tenant_id !== $product->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['product.update', 'product.manage']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Product $product): bool
    {
        if ($user->tenant_id !== $product->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['product.delete', 'product.manage']);
    }
}
