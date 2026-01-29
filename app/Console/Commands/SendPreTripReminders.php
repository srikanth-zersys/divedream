<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendPreTripReminders extends Command
{
    protected $signature = 'bookings:send-pre-trip-reminders';

    protected $description = 'Send pre-trip reminder emails to customers with upcoming bookings';

    public function __construct(
        protected NotificationService $notificationService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Sending pre-trip reminders...');

        // Get bookings happening in 3 days
        $threeDaysFromNow = Carbon::now()->addDays(3)->toDateString();
        $this->sendRemindersForDate($threeDaysFromNow, 3);

        // Get bookings happening in 1 day
        $oneDayFromNow = Carbon::now()->addDay()->toDateString();
        $this->sendRemindersForDate($oneDayFromNow, 1);

        // Get bookings happening tomorrow morning (send evening before)
        if (Carbon::now()->hour >= 18) {
            $tomorrowDate = Carbon::tomorrow()->toDateString();
            $this->sendRemindersForDate($tomorrowDate, 0, 'evening_before');
        }

        $this->info('Pre-trip reminders sent successfully.');

        return Command::SUCCESS;
    }

    protected function sendRemindersForDate(string $date, int $daysUntil, string $reminderType = null): void
    {
        $reminderType = $reminderType ?? "{$daysUntil}_days";

        $bookings = Booking::query()
            ->where('booking_date', $date)
            ->whereIn('status', ['confirmed', 'pending'])
            ->whereDoesntHave('notificationLogs', function ($query) use ($reminderType) {
                $query->where('type', "pre_trip_reminder_{$reminderType}");
            })
            ->with(['member', 'product', 'schedule', 'location', 'tenant'])
            ->get();

        $count = 0;
        foreach ($bookings as $booking) {
            try {
                $this->notificationService->sendBookingReminder($booking, $daysUntil);

                // Log that we sent this reminder type
                \App\Models\NotificationLog::logEmail(
                    $booking->tenant_id,
                    Booking::class,
                    $booking->id,
                    $booking->member->email,
                    "pre_trip_reminder_{$reminderType}",
                    "Pre-trip Reminder ({$daysUntil} days)",
                    "Sent {$daysUntil}-day reminder for booking #{$booking->booking_number}"
                )->markAsSent();

                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to send pre-trip reminder", [
                    'booking_id' => $booking->id,
                    'reminder_type' => $reminderType,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->line("  Sent {$count} reminders for {$date} ({$reminderType})");
    }
}
