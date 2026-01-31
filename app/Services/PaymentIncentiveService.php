<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Schedule;
use App\Models\Tenant;

/**
 * Service to calculate payment incentives and encourage online payments
 * in a customer-friendly way.
 *
 * Philosophy: Reward online payment, don't punish pay-at-shop
 */
class PaymentIncentiveService
{
    /**
     * Calculate pricing with optional online payment discount
     */
    public function calculatePricing(
        Tenant $tenant,
        Schedule $schedule,
        int $participantCount,
        string $paymentMethod = 'at_shop'
    ): array {
        $basePrice = $schedule->price_override ?? $schedule->product->price;
        $subtotal = $basePrice * $participantCount;

        // Online payment discount (soft incentive)
        $onlineDiscount = 0;
        $onlineDiscountPercent = 0;
        if ($paymentMethod === 'online' && $tenant->online_payment_discount_percent > 0) {
            $onlineDiscountPercent = $tenant->online_payment_discount_percent;
            $onlineDiscount = round($subtotal * ($onlineDiscountPercent / 100), 2);
        }

        // Early bird discount (if booking is X days in advance)
        $earlyBirdDiscount = 0;
        $earlyBirdPercent = 0;
        $daysInAdvance = now()->diffInDays($schedule->date, false);
        if ($daysInAdvance >= ($tenant->early_bird_days ?? 14) && $tenant->early_bird_discount_percent > 0) {
            $earlyBirdPercent = $tenant->early_bird_discount_percent;
            $earlyBirdDiscount = round($subtotal * ($earlyBirdPercent / 100), 2);
        }

        // Total discount
        $totalDiscount = $onlineDiscount + $earlyBirdDiscount;
        $discountedSubtotal = $subtotal - $totalDiscount;

        // Tax calculation
        $taxRate = $tenant->tax_rate ?? 0;
        $tax = round($discountedSubtotal * ($taxRate / 100), 2);

        // Final total
        $total = $discountedSubtotal + $tax;

        // Deposit calculation (if enabled)
        $depositAmount = 0;
        $depositPercent = 0;
        if ($tenant->require_deposit && $tenant->deposit_percentage > 0) {
            $depositPercent = $tenant->deposit_percentage;
            $depositAmount = round($total * ($depositPercent / 100), 2);
        }

        // Calculate savings message
        $savingsMessage = null;
        if ($paymentMethod === 'at_shop' && $tenant->online_payment_discount_percent > 0) {
            $potentialSavings = round($subtotal * ($tenant->online_payment_discount_percent / 100), 2);
            $savingsMessage = "Save {$tenant->online_payment_discount_percent}% ({$this->formatCurrency($potentialSavings, $tenant)}) by paying online!";
        }

        return [
            'base_price_per_person' => $basePrice,
            'participant_count' => $participantCount,
            'subtotal' => $subtotal,

            'online_discount' => $onlineDiscount,
            'online_discount_percent' => $onlineDiscountPercent,
            'early_bird_discount' => $earlyBirdDiscount,
            'early_bird_percent' => $earlyBirdPercent,
            'total_discount' => $totalDiscount,

            'discounted_subtotal' => $discountedSubtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $tax,
            'total' => $total,

            'deposit_required' => $tenant->require_deposit && $depositAmount > 0,
            'deposit_percent' => $depositPercent,
            'deposit_amount' => $depositAmount,
            'balance_after_deposit' => $total - $depositAmount,

            'savings_message' => $savingsMessage,
            'currency' => $tenant->currency ?? 'USD',
        ];
    }

    /**
     * Get cancellation policy for display
     */
    public function getCancellationPolicy(Tenant $tenant): array
    {
        $freeCancellationHours = $tenant->free_cancellation_hours ?? 48;

        return [
            'free_cancellation_hours' => $freeCancellationHours,
            'free_cancellation_text' => "Free cancellation up to {$freeCancellationHours} hours before your activity",
            'late_cancellation_fee_percent' => $tenant->late_cancellation_fee_percent ?? 0,
            'no_show_fee_percent' => $tenant->no_show_fee_percent ?? 100,
            'refund_policy' => $this->getRefundPolicyText($tenant),
        ];
    }

    /**
     * Get refund policy text
     */
    protected function getRefundPolicyText(Tenant $tenant): string
    {
        $hours = $tenant->free_cancellation_hours ?? 48;
        $lateFee = $tenant->late_cancellation_fee_percent ?? 50;

        $policy = "• Cancel {$hours}+ hours before: Full refund\n";
        $policy .= "• Cancel within {$hours} hours: {$lateFee}% fee applies\n";
        $policy .= "• No-show: No refund";

        return $policy;
    }

    /**
     * Get payment options to show customer
     */
    public function getPaymentOptions(Tenant $tenant, array $pricing): array
    {
        $options = [];

        // Option 1: Pay online now (with discount if applicable)
        if ($tenant->online_payment_discount_percent > 0) {
            $options[] = [
                'id' => 'online_full',
                'label' => 'Pay online now',
                'sublabel' => "Save {$tenant->online_payment_discount_percent}%!",
                'amount' => $pricing['total'],
                'badge' => 'Best Value',
                'recommended' => true,
            ];
        } else {
            $options[] = [
                'id' => 'online_full',
                'label' => 'Pay online now',
                'sublabel' => 'Secure your spot instantly',
                'amount' => $pricing['total'],
                'recommended' => true,
            ];
        }

        // Option 2: Pay deposit online (if enabled)
        if ($pricing['deposit_required'] && $pricing['deposit_amount'] > 0) {
            $options[] = [
                'id' => 'online_deposit',
                'label' => 'Pay deposit now',
                'sublabel' => "Only {$pricing['deposit_percent']}% now, rest at shop",
                'amount' => $pricing['deposit_amount'],
                'balance_due' => $pricing['balance_after_deposit'],
            ];
        }

        // Option 3: Pay at shop (if allowed)
        if ($tenant->allow_pay_at_shop) {
            $options[] = [
                'id' => 'at_shop',
                'label' => 'Pay at dive shop',
                'sublabel' => 'Pay when you arrive',
                'amount' => 0,
                'total_due' => $pricing['subtotal'] + $pricing['tax_amount'], // No online discount
            ];
        }

        return $options;
    }

    /**
     * Format currency for display
     */
    protected function formatCurrency(float $amount, Tenant $tenant): string
    {
        $currency = $tenant->currency ?? 'USD';
        $symbol = match ($currency) {
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'THB' => '฿',
            'IDR' => 'Rp',
            'MYR' => 'RM',
            'PHP' => '₱',
            'AUD' => 'A$',
            default => $currency . ' ',
        };

        return $symbol . number_format($amount, 2);
    }

    /**
     * Get urgency/scarcity message if applicable
     */
    public function getUrgencyMessage(Schedule $schedule, int $availableSpots): ?string
    {
        if ($availableSpots <= 0) {
            return null;
        }

        if ($availableSpots <= 2) {
            return "Only {$availableSpots} spot" . ($availableSpots === 1 ? '' : 's') . " left!";
        }

        if ($availableSpots <= 5) {
            return "Limited availability - {$availableSpots} spots remaining";
        }

        // Check if booking is soon
        $daysUntil = now()->diffInDays($schedule->date, false);
        if ($daysUntil <= 2 && $daysUntil >= 0) {
            return "Booking closes soon - secure your spot!";
        }

        return null;
    }
}
