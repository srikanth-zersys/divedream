<?php

namespace App\Services;

use App\Mail\BookingCancellation;
use App\Mail\BookingConfirmation;
use App\Mail\BookingReminder;
use App\Mail\PaymentReceipt;
use App\Mail\WaiverReminder;
use App\Models\Booking;
use App\Models\NotificationLog;
use App\Models\Payment;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Send booking confirmation email
     */
    public function sendBookingConfirmation(Booking $booking): void
    {
        $member = $booking->member;

        if (!$member || !$member->email) {
            return;
        }

        // Log the notification
        $log = NotificationLog::logEmail(
            $booking->tenant_id,
            Booking::class,
            $booking->id,
            $member->email,
            'booking_confirmation',
            "Booking Confirmed - {$booking->booking_number}",
            "Confirmation email for booking #{$booking->booking_number}"
        );

        try {
            Mail::to($member->email)
                ->send(new BookingConfirmation($booking));

            $log->markAsSent();
        } catch (\Exception $e) {
            $log->markAsFailed($e->getMessage());
        }
    }

    /**
     * Send booking reminder email
     */
    public function sendBookingReminder(Booking $booking, int $daysUntil = 1): void
    {
        $member = $booking->member;

        if (!$member || !$member->email) {
            return;
        }

        $log = NotificationLog::logEmail(
            $booking->tenant_id,
            Booking::class,
            $booking->id,
            $member->email,
            'booking_reminder',
            "Reminder: Your dive is coming up!",
            "Reminder email for booking #{$booking->booking_number}"
        );

        try {
            Mail::to($member->email)
                ->send(new BookingReminder($booking, $daysUntil));

            $log->markAsSent();
        } catch (\Exception $e) {
            $log->markAsFailed($e->getMessage());
        }
    }

    /**
     * Send booking cancellation email
     */
    public function sendBookingCancellation(Booking $booking): void
    {
        $member = $booking->member;

        if (!$member || !$member->email) {
            return;
        }

        $log = NotificationLog::logEmail(
            $booking->tenant_id,
            Booking::class,
            $booking->id,
            $member->email,
            'booking_cancellation',
            "Booking Cancelled - {$booking->booking_number}",
            "Cancellation email for booking #{$booking->booking_number}"
        );

        try {
            Mail::to($member->email)
                ->send(new BookingCancellation($booking));

            $log->markAsSent();
        } catch (\Exception $e) {
            $log->markAsFailed($e->getMessage());
        }
    }

    /**
     * Send payment receipt email
     */
    public function sendPaymentReceipt(Payment $payment): void
    {
        $booking = $payment->booking;
        $member = $booking->member;

        if (!$member || !$member->email) {
            return;
        }

        $log = NotificationLog::logEmail(
            $payment->tenant_id,
            Payment::class,
            $payment->id,
            $member->email,
            'payment_receipt',
            "Payment Receipt",
            "Payment receipt for booking #{$booking->booking_number}"
        );

        try {
            Mail::to($member->email)
                ->send(new PaymentReceipt($payment));

            $log->markAsSent();
        } catch (\Exception $e) {
            $log->markAsFailed($e->getMessage());
        }
    }

    /**
     * Send waiver reminder email
     */
    public function sendWaiverReminder(Booking $booking): void
    {
        $member = $booking->member;

        if (!$member || !$member->email || $booking->waiver_completed) {
            return;
        }

        $log = NotificationLog::logEmail(
            $booking->tenant_id,
            Booking::class,
            $booking->id,
            $member->email,
            'waiver_reminder',
            "Action Required: Please sign your waiver",
            "Waiver reminder for booking #{$booking->booking_number}"
        );

        try {
            Mail::to($member->email)
                ->send(new WaiverReminder($booking));

            $log->markAsSent();
        } catch (\Exception $e) {
            $log->markAsFailed($e->getMessage());
        }
    }

    /**
     * Send booking notifications to staff
     */
    public function notifyStaffNewBooking(Booking $booking): void
    {
        $location = $booking->location;
        if (!$location || !$location->email) {
            return;
        }

        // Send email to location
        $log = NotificationLog::logEmail(
            $booking->tenant_id,
            Booking::class,
            $booking->id,
            $location->email,
            'staff_new_booking',
            "New Booking - {$booking->booking_number}",
            "New booking notification"
        );

        try {
            // Simple notification email to staff
            Mail::raw(
                "New booking received:\n\n" .
                "Booking: {$booking->booking_number}\n" .
                "Guest: {$booking->member->first_name} {$booking->member->last_name}\n" .
                "Product: {$booking->product->name}\n" .
                "Date: {$booking->booking_date->format('M d, Y')}\n" .
                "Participants: {$booking->participant_count}\n" .
                "Total: $" . number_format($booking->total_amount, 2),
                function ($message) use ($location, $booking) {
                    $message->to($location->email)
                        ->subject("New Booking - {$booking->booking_number}");
                }
            );

            $log->markAsSent();
        } catch (\Exception $e) {
            $log->markAsFailed($e->getMessage());
        }
    }
}
