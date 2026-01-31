<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\CancellationPolicy;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RefundService
{
    /**
     * Calculate refund amount based on cancellation policy
     *
     * Industry Best Practice for Dive Shops:
     * - Tiered refund based on time before activity
     * - Weather cancellation = full refund
     * - No-show = full charge
     * - Reschedule option before refund
     */
    public function calculateRefund(Booking $booking, array $options = []): array
    {
        $isWeatherCancellation = $options['is_weather'] ?? false;
        $cancellationDate = isset($options['cancellation_date'])
            ? Carbon::parse($options['cancellation_date'])
            : now();

        // Get applicable cancellation policy
        $policy = $this->getApplicablePolicy($booking);

        if (!$policy) {
            // No policy - use default (no refund for late cancellation)
            return $this->defaultRefundCalculation($booking, $cancellationDate);
        }

        // Get activity date
        $activityDate = Carbon::parse($booking->schedule?->date ?? $booking->booking_date);

        // Calculate refund using policy
        $refundInfo = $policy->calculateRefund(
            $booking->amount_paid,
            $activityDate,
            $cancellationDate,
            $isWeatherCancellation
        );

        // Add booking context
        $refundInfo['booking_id'] = $booking->id;
        $refundInfo['booking_number'] = $booking->booking_number;
        $refundInfo['amount_paid'] = $booking->amount_paid;
        $refundInfo['policy_name'] = $policy->name;
        $refundInfo['policy_type'] = $policy->type;
        $refundInfo['cancellation_date'] = $cancellationDate->toIso8601String();
        $refundInfo['activity_date'] = $activityDate->toIso8601String();

        // Add reschedule option if available
        if ($policy->allow_reschedule) {
            $rescheduleFee = $policy->calculateRescheduleFee($booking->total_amount);
            $refundInfo['reschedule_option'] = [
                'allowed' => true,
                'fee_amount' => $rescheduleFee['fee_amount'],
                'fee_percent' => $rescheduleFee['fee_percent'],
                'benefit' => 'Keep your booking value - only pay the reschedule fee',
            ];
        }

        return $refundInfo;
    }

    /**
     * Calculate no-show penalty
     */
    public function calculateNoShowPenalty(Booking $booking): array
    {
        $policy = $this->getApplicablePolicy($booking);

        if (!$policy) {
            // Default: 100% no-show fee
            return [
                'fee_amount' => $booking->total_amount,
                'fee_percent' => 100,
                'refund_amount' => 0,
            ];
        }

        $result = $policy->calculateNoShowFee($booking->total_amount);
        $result['policy_name'] = $policy->name;
        $result['booking_id'] = $booking->id;

        return $result;
    }

    /**
     * Process a refund
     */
    public function processRefund(
        Booking $booking,
        float $amount,
        string $reason,
        ?int $processedBy = null,
        array $options = []
    ): BookingPayment {
        return DB::transaction(function () use ($booking, $amount, $reason, $processedBy, $options) {
            // Validate refund amount
            $maxRefundable = $booking->getRefundableAmount();

            if ($amount > $maxRefundable) {
                throw new \InvalidArgumentException(
                    "Refund amount ({$amount}) exceeds refundable amount ({$maxRefundable})"
                );
            }

            // Create refund payment record
            $refund = $booking->recordPayment(
                amount: -$amount, // Negative for refund
                type: 'refund',
                method: $options['method'] ?? 'original_payment',
                receivedBy: $processedBy,
                notes: $reason
            );

            // Update booking status based on refund
            if ($booking->fresh()->amount_paid <= 0) {
                $booking->update([
                    'payment_status' => 'fully_refunded',
                ]);
            } else {
                // Partial refund
                $booking->update([
                    'payment_status' => 'partially_refunded',
                ]);
            }

            // Log activity
            if (method_exists($booking, 'logActivity')) {
                $booking->logActivity('refund_processed', [
                    'amount' => $amount,
                    'reason' => $reason,
                    'processed_by' => $processedBy,
                ]);
            }

            return $refund;
        });
    }

    /**
     * Process cancellation with automatic refund calculation
     */
    public function processCancellation(
        Booking $booking,
        string $reason,
        ?int $cancelledBy = null,
        array $options = []
    ): array {
        return DB::transaction(function () use ($booking, $reason, $cancelledBy, $options) {
            $isWeatherCancellation = $options['is_weather'] ?? false;

            // Calculate refund
            $refundInfo = $this->calculateRefund($booking, [
                'is_weather' => $isWeatherCancellation,
                'cancellation_date' => $options['cancellation_date'] ?? now(),
            ]);

            // Update booking status
            $booking->update([
                'status' => 'cancelled',
                'cancellation_reason' => $reason,
                'cancelled_at' => now(),
                'cancelled_by' => $cancelledBy,
            ]);

            // Process refund if there's an amount to refund
            $refundPayment = null;
            if ($refundInfo['refund_amount'] > 0 && $booking->amount_paid > 0) {
                $refundPayment = $this->processRefund(
                    $booking,
                    min($refundInfo['refund_amount'], $booking->amount_paid),
                    "Cancellation: {$reason} (Policy: {$refundInfo['policy_name'] ?? 'Default'})",
                    $cancelledBy,
                    $options
                );
            }

            return [
                'booking' => $booking->fresh(),
                'refund_info' => $refundInfo,
                'refund_payment' => $refundPayment,
                'message' => $this->getRefundMessage($refundInfo),
            ];
        });
    }

    /**
     * Process no-show
     */
    public function processNoShow(Booking $booking, ?int $markedBy = null): array
    {
        return DB::transaction(function () use ($booking, $markedBy) {
            $penaltyInfo = $this->calculateNoShowPenalty($booking);

            $booking->update([
                'status' => 'no_show',
                'no_show_at' => now(),
                'no_show_by' => $markedBy,
            ]);

            // If there's a partial refund due (rare, but policy might allow)
            $refundPayment = null;
            if ($penaltyInfo['refund_amount'] > 0 && $booking->amount_paid > 0) {
                $refundPayment = $this->processRefund(
                    $booking,
                    min($penaltyInfo['refund_amount'], $booking->amount_paid),
                    "No-show partial refund per policy",
                    $markedBy
                );
            }

            return [
                'booking' => $booking->fresh(),
                'penalty_info' => $penaltyInfo,
                'refund_payment' => $refundPayment,
            ];
        });
    }

    /**
     * Get applicable cancellation policy for booking
     */
    protected function getApplicablePolicy(Booking $booking): ?CancellationPolicy
    {
        // Check if booking has a specific policy assigned
        if ($booking->cancellation_policy_id) {
            return $booking->cancellationPolicy;
        }

        // Check product policy
        if ($booking->product?->cancellation_policy_id) {
            return $booking->product->cancellationPolicy;
        }

        // Find best match
        return CancellationPolicy::findApplicable(
            $booking->tenant_id,
            $booking->location_id,
            $booking->product_id
        );
    }

    /**
     * Default refund calculation when no policy exists
     */
    protected function defaultRefundCalculation(Booking $booking, Carbon $cancellationDate): array
    {
        $activityDate = Carbon::parse($booking->schedule?->date ?? $booking->booking_date);
        $hoursUntil = $cancellationDate->diffInHours($activityDate, false);

        // Default: Full refund if > 48 hours, 50% if > 24 hours, no refund otherwise
        $refundPercent = match (true) {
            $hoursUntil >= 48 => 100,
            $hoursUntil >= 24 => 50,
            default => 0,
        };

        $refundAmount = round($booking->amount_paid * ($refundPercent / 100), 2);

        return [
            'refund_amount' => $refundAmount,
            'refund_percent' => $refundPercent,
            'fee_amount' => round($booking->amount_paid - $refundAmount, 2),
            'tier_applied' => 'default',
            'hours_until_activity' => max(0, $hoursUntil),
            'policy_name' => 'Default Policy',
            'policy_type' => 'moderate',
            'reason' => $refundPercent === 100
                ? 'Full refund - cancelled with sufficient notice'
                : ($refundPercent > 0
                    ? 'Partial refund - late cancellation fee applied'
                    : 'No refund - cancelled too close to activity date'),
        ];
    }

    /**
     * Get user-friendly refund message
     */
    protected function getRefundMessage(array $refundInfo): string
    {
        if ($refundInfo['refund_percent'] === 100) {
            return "Full refund of {$this->formatMoney($refundInfo['refund_amount'])} will be processed.";
        }

        if ($refundInfo['refund_percent'] === 0) {
            return "Per our cancellation policy, no refund is available for this cancellation. " .
                ($refundInfo['reschedule_option']['allowed'] ?? false
                    ? "You may reschedule instead."
                    : "");
        }

        return "A {$refundInfo['refund_percent']}% refund of {$this->formatMoney($refundInfo['refund_amount'])} " .
            "will be processed. A cancellation fee of {$this->formatMoney($refundInfo['fee_amount'])} applies.";
    }

    /**
     * Format money for display
     */
    protected function formatMoney(float $amount): string
    {
        return '$' . number_format($amount, 2);
    }

    /**
     * Check if a booking is eligible for refund
     */
    public function isRefundEligible(Booking $booking): array
    {
        $eligible = true;
        $reasons = [];

        // Check if already refunded
        if ($booking->payment_status === 'fully_refunded') {
            $eligible = false;
            $reasons[] = 'Booking already fully refunded';
        }

        // Check if there's any amount paid
        if ($booking->amount_paid <= 0) {
            $eligible = false;
            $reasons[] = 'No payment has been made on this booking';
        }

        // Check booking status
        if (in_array($booking->status, ['completed', 'checked_out'])) {
            $eligible = false;
            $reasons[] = 'Cannot refund completed activities';
        }

        // Calculate potential refund
        $refundInfo = $eligible ? $this->calculateRefund($booking) : null;

        return [
            'eligible' => $eligible,
            'reasons' => $reasons,
            'max_refundable' => $booking->getRefundableAmount(),
            'refund_info' => $refundInfo,
        ];
    }
}
