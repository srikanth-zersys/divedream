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
                            {--dry-run : Show what would be cancelled without making changes}
                            {--include-at-shop : Also flag pay-at-shop bookings for review (does not cancel)}';

    /**
     * The console command description.
     */
    protected $description = 'Cancel unpaid ONLINE payment bookings that have exceeded their deadline. Pay-at-shop bookings are never auto-cancelled.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $includeAtShop = $this->option('include-at-shop');

        $this->info('Searching for expired unpaid online payment bookings...');

        // IMPORTANT: Only cancel ONLINE payment bookings that are pending
        // Pay-at-shop bookings should NEVER be auto-cancelled
        // Industry best practice: customers paying at shop have confirmed bookings
        $expiredBookings = Booking::where('status', 'pending')
            ->where('payment_status', 'unpaid')
            ->where('payment_method', 'online') // Only online payment bookings
            ->whereNotNull('payment_due_date')
            ->where('payment_due_date', '<', now())
            ->get();

        $count = $expiredBookings->count();

        if ($count === 0) {
            $this->info('No expired online payment bookings found.');
        } else {
            $this->info("Found {$count} expired online payment booking(s).");

            if ($isDryRun) {
                $this->warn('DRY RUN - No changes will be made.');
                $this->newLine();
            }

            $cancelled = 0;

            foreach ($expiredBookings as $booking) {
                $this->line("  - {$booking->booking_number}: {$booking->customer_email} (\${$booking->total_amount})");

                if (!$isDryRun) {
                    $booking->update([
                        'status' => 'cancelled',
                        'cancelled_at' => now(),
                        'cancellation_reason' => 'Automatically cancelled: Online payment deadline exceeded',
                    ]);

                    Log::info('Expired online payment booking cancelled', [
                        'booking_id' => $booking->id,
                        'booking_number' => $booking->booking_number,
                        'payment_due_date' => $booking->payment_due_date,
                        'payment_method' => $booking->payment_method,
                    ]);

                    $cancelled++;
                }
            }

            if (!$isDryRun) {
                $this->newLine();
                $this->info("Successfully cancelled {$cancelled} expired online payment booking(s).");
            }
        }

        // Optionally report on pay-at-shop bookings that need follow-up
        // These are NOT cancelled, just flagged for staff review
        if ($includeAtShop) {
            $this->newLine();
            $this->info('Checking pay-at-shop bookings needing follow-up...');

            // Find pay-at-shop bookings for tomorrow that are still unpaid
            $upcomingUnpaid = Booking::whereIn('status', ['confirmed', 'pending'])
                ->where('payment_status', 'unpaid')
                ->where('payment_method', 'at_shop')
                ->whereDate('booking_date', '<=', now()->addDay())
                ->whereDate('booking_date', '>=', now())
                ->with(['member', 'product'])
                ->get();

            if ($upcomingUnpaid->isEmpty()) {
                $this->info('No pay-at-shop bookings need follow-up.');
            } else {
                $this->warn("Found {$upcomingUnpaid->count()} pay-at-shop booking(s) for today/tomorrow:");
                foreach ($upcomingUnpaid as $booking) {
                    $this->line("  - {$booking->booking_number}: {$booking->customer_email} - {$booking->product?->name} on {$booking->booking_date->format('M j')} (\${$booking->total_amount} due)");
                }
                $this->newLine();
                $this->info('These bookings are NOT cancelled. Staff should confirm payment at check-in.');
            }
        }

        return Command::SUCCESS;
    }
}
