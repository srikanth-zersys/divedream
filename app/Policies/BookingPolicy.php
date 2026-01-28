<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class BookingPolicy
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
        return $user->hasAnyPermission(['booking.view', 'booking.manage']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Booking $booking): bool
    {
        // Must belong to same tenant
        if ($user->tenant_id !== $booking->tenant_id) {
            return false;
        }

        // Must have access to the location
        if (!$user->hasAccessToLocation($booking->location_id)) {
            return false;
        }

        return $user->hasAnyPermission(['booking.view', 'booking.manage']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyPermission(['booking.create', 'booking.manage']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Booking $booking): bool
    {
        if ($user->tenant_id !== $booking->tenant_id) {
            return false;
        }

        if (!$user->hasAccessToLocation($booking->location_id)) {
            return false;
        }

        return $user->hasAnyPermission(['booking.update', 'booking.manage']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Booking $booking): bool
    {
        if ($user->tenant_id !== $booking->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['booking.delete', 'booking.manage']);
    }

    /**
     * Determine whether the user can check in a booking.
     */
    public function checkIn(User $user, Booking $booking): bool
    {
        if ($user->tenant_id !== $booking->tenant_id) {
            return false;
        }

        if (!$user->hasAccessToLocation($booking->location_id)) {
            return false;
        }

        return $user->hasAnyPermission(['booking.checkin', 'booking.manage']);
    }

    /**
     * Determine whether the user can process payments.
     */
    public function processPayment(User $user, Booking $booking): bool
    {
        if ($user->tenant_id !== $booking->tenant_id) {
            return false;
        }

        return $user->hasAnyPermission(['booking.payment', 'booking.manage', 'payment.manage']);
    }

    /**
     * Determine whether the user can cancel a booking.
     */
    public function cancel(User $user, Booking $booking): bool
    {
        if ($user->tenant_id !== $booking->tenant_id) {
            return false;
        }

        if (!$user->hasAccessToLocation($booking->location_id)) {
            return false;
        }

        return $user->hasAnyPermission(['booking.cancel', 'booking.manage']);
    }
}
