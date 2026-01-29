<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupExpiredBookings extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'bookings:cleanup-expired
                            {--dry-run : Show what would be cancelled without making changes}';

    /**
     * The console command description.
     */
    protected $description = 'Cancel unpaid bookings that have exceeded their payment deadline';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');

        $this->info('Searching for expired unpaid bookings...');

        // Find all pending/unpaid bookings where payment_due_date has passed
        $expiredBookings = Booking::where('status', 'pending')
            ->where('payment_status', 'unpaid')
            ->whereNotNull('payment_due_date')
            ->where('payment_due_date', '<', now())
            ->get();

        $count = $expiredBookings->count();

        if ($count === 0) {
            $this->info('No expired bookings found.');
            return Command::SUCCESS;
        }

        $this->info("Found {$count} expired booking(s).");

        if ($isDryRun) {
            $this->warn('DRY RUN - No changes will be made.');
            $this->newLine();
        }

        $cancelled = 0;

        foreach ($expiredBookings as $booking) {
            $this->line("  - {$booking->booking_number}: {$booking->customer_email} ({$booking->total_amount})");

            if (!$isDryRun) {
                $booking->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                    'cancellation_reason' => 'Automatically cancelled: Payment deadline exceeded',
                ]);

                Log::info('Expired booking cancelled', [
                    'booking_id' => $booking->id,
                    'booking_number' => $booking->booking_number,
                    'payment_due_date' => $booking->payment_due_date,
                ]);

                $cancelled++;
            }
        }

        if (!$isDryRun) {
            $this->newLine();
            $this->info("Successfully cancelled {$cancelled} expired booking(s).");
        }

        return Command::SUCCESS;
    }
}
