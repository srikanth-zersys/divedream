<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\NotificationLog;
use Illuminate\Support\Facades\Log;

/**
 * SMS Service Stub
 *
 * This service provides a foundation for SMS notifications.
 * To enable SMS, integrate with a provider like Twilio, Vonage, or MessageBird.
 *
 * Configuration:
 * 1. Add your SMS provider credentials to config/services.php
 * 2. Install the provider SDK (e.g., composer require twilio/sdk)
 * 3. Implement the sendSms method below
 */
class SmsService
{
    protected bool $enabled;
    protected ?string $provider;

    public function __construct()
    {
        $this->enabled = config('services.sms.enabled', false);
        $this->provider = config('services.sms.provider');
    }

    /**
     * Send booking confirmation SMS
     */
    public function sendBookingConfirmation(Booking $booking): bool
    {
        if (!$this->enabled || !$booking->member->phone) {
            return false;
        }

        $message = sprintf(
            "Booking Confirmed! %s on %s at %s. Ref: %s. View: %s",
            $booking->product->name,
            $booking->booking_date->format('M j'),
            $booking->schedule?->start_time ? date('g:ia', strtotime($booking->schedule->start_time)) : 'TBD',
            $booking->booking_number,
            url("/booking/{$booking->access_token}")
        );

        return $this->sendSms($booking, $booking->member->phone, $message, 'booking_confirmation');
    }

    /**
     * Send booking reminder SMS
     */
    public function sendBookingReminder(Booking $booking, int $hoursUntil = 24): bool
    {
        if (!$this->enabled || !$booking->member->phone) {
            return false;
        }

        $timeText = $hoursUntil >= 24 ? ($hoursUntil / 24) . ' day(s)' : $hoursUntil . ' hours';

        $message = sprintf(
            "Reminder: %s in %s! %s at %s. Arrive 30min early. Questions? Reply to this message.",
            $booking->product->name,
            $timeText,
            $booking->booking_date->format('M j'),
            $booking->schedule?->start_time ? date('g:ia', strtotime($booking->schedule->start_time)) : 'TBD'
        );

        return $this->sendSms($booking, $booking->member->phone, $message, 'booking_reminder');
    }

    /**
     * Send waiver reminder SMS
     */
    public function sendWaiverReminder(Booking $booking): bool
    {
        if (!$this->enabled || !$booking->member->phone || $booking->waiver_completed) {
            return false;
        }

        $message = sprintf(
            "Action needed: Please sign your waiver before your dive on %s. Sign here: %s",
            $booking->booking_date->format('M j'),
            url("/booking/{$booking->access_token}")
        );

        return $this->sendSms($booking, $booking->member->phone, $message, 'waiver_reminder');
    }

    /**
     * Send cancellation SMS
     */
    public function sendBookingCancellation(Booking $booking): bool
    {
        if (!$this->enabled || !$booking->member->phone) {
            return false;
        }

        $message = sprintf(
            "Your booking #%s has been cancelled. Refunds (if applicable) will be processed in 5-7 days. Questions? Contact us.",
            $booking->booking_number
        );

        return $this->sendSms($booking, $booking->member->phone, $message, 'booking_cancellation');
    }

    /**
     * Send an SMS message
     *
     * Override this method to integrate with your SMS provider
     */
    protected function sendSms(Booking $booking, string $phone, string $message, string $type): bool
    {
        // Log the notification attempt
        $log = NotificationLog::create([
            'tenant_id' => $booking->tenant_id,
            'notifiable_type' => Booking::class,
            'notifiable_id' => $booking->id,
            'recipient' => $phone,
            'channel' => 'sms',
            'type' => $type,
            'subject' => null,
            'message' => $message,
            'status' => 'pending',
        ]);

        // SMS Provider Integration Point
        // Uncomment and configure one of these providers:

        // --- Twilio ---
        // if ($this->provider === 'twilio') {
        //     $client = new \Twilio\Rest\Client(
        //         config('services.twilio.sid'),
        //         config('services.twilio.token')
        //     );
        //     try {
        //         $client->messages->create($phone, [
        //             'from' => config('services.twilio.from'),
        //             'body' => $message,
        //         ]);
        //         $log->markAsSent();
        //         return true;
        //     } catch (\Exception $e) {
        //         $log->markAsFailed($e->getMessage());
        //         Log::error('Twilio SMS failed', ['error' => $e->getMessage()]);
        //         return false;
        //     }
        // }

        // --- Log only (development/testing) ---
        if (config('app.env') !== 'production') {
            Log::info('SMS would be sent', [
                'to' => $phone,
                'message' => $message,
                'type' => $type,
            ]);
            $log->update(['status' => 'simulated', 'sent_at' => now()]);
            return true;
        }

        // Mark as skipped if no provider configured
        $log->update(['status' => 'skipped', 'failure_reason' => 'No SMS provider configured']);

        return false;
    }

    /**
     * Check if SMS is enabled
     */
    public function isEnabled(): bool
    {
        return $this->enabled;
    }
}
