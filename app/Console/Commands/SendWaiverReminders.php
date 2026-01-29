<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendWaiverReminders extends Command
{
    protected $signature = 'bookings:send-waiver-reminders';

    protected $description = 'Send waiver reminder emails to customers who haven\'t signed their waivers';

    public function __construct(
        protected NotificationService $notificationService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Sending waiver reminders...');

        // Get bookings in the next 3 days that don't have signed waivers
        $upcomingDate = Carbon::now()->addDays(3)->toDateString();

        $bookings = Booking::query()
            ->where('booking_date', '<=', $upcomingDate)
            ->where('booking_date', '>=', Carbon::today()->toDateString())
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('waiver_completed', false)
            ->whereDoesntHave('notificationLogs', function ($query) {
                $query->where('type', 'waiver_reminder')
                    ->where('created_at', '>=', Carbon::now()->subHours(24));
            })
            ->with(['member', 'product', 'tenant'])
            ->get();

        $count = 0;
        foreach ($bookings as $booking) {
            try {
                $this->notificationService->sendWaiverReminder($booking);
                $count++;

                $this->line("  Sent waiver reminder to {$booking->member->email} for #{$booking->booking_number}");
            } catch (\Exception $e) {
                Log::error("Failed to send waiver reminder", [
                    'booking_id' => $booking->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Sent {$count} waiver reminders.");

        return Command::SUCCESS;
    }
}
