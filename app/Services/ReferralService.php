<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Lead;
use App\Models\Referral;
use App\Models\ReferralSettings;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReferralService
{
    /**
     * Create a referral code for a lead
     */
    public function createReferral(Lead $lead): ?Referral
    {
        $settings = ReferralSettings::getOrCreate($lead->tenant_id);

        if (!$settings->canCreateReferral($lead)) {
            return null;
        }

        return Referral::createForLead($lead, $settings);
    }

    /**
     * Get or create a referral for a lead
     */
    public function getOrCreateReferral(Lead $lead): ?Referral
    {
        // Check for existing active referral
        $existing = Referral::where('referrer_id', $lead->id)
            ->active()
            ->first();

        if ($existing) {
            return $existing;
        }

        return $this->createReferral($lead);
    }

    /**
     * Process a referral code click
     */
    public function processReferralClick(string $code): ?Referral
    {
        $referral = Referral::where('referral_code', $code)
            ->active()
            ->first();

        if (!$referral) {
            return null;
        }

        $referral->recordClick();

        return $referral;
    }

    /**
     * Process a referred lead signup
     */
    public function processReferredSignup(Lead $newLead, string $referralCode): ?Referral
    {
        $referral = Referral::where('referral_code', $referralCode)
            ->active()
            ->first();

        if (!$referral) {
            return null;
        }

        // Don't let someone refer themselves
        if ($referral->referrer_id === $newLead->id) {
            return null;
        }

        // Link the new lead to the referral
        $newLead->update(['referred_by_id' => $referral->referrer_id]);

        // Update referral with the new lead
        $referral->update([
            'referred_lead_id' => $newLead->id,
            'status' => Referral::STATUS_CLICKED,
        ]);

        // Record activity on referrer
        $referral->referrer->recordActivity('referral_sent', [
            'referral_id' => $referral->id,
            'referred_email' => $newLead->email,
        ]);

        return $referral;
    }

    /**
     * Process a booking from a referred lead
     */
    public function processReferredBooking(Booking $booking, ?string $referralCode = null): ?Referral
    {
        $lead = $booking->lead;

        // Find referral by code or by lead's referred_by_id
        $referral = null;

        if ($referralCode) {
            $referral = Referral::where('referral_code', $referralCode)
                ->active()
                ->first();
        } elseif ($lead && $lead->referred_by_id) {
            $referral = Referral::where('referrer_id', $lead->referred_by_id)
                ->where(function ($q) use ($lead) {
                    $q->where('referred_lead_id', $lead->id)
                        ->orWhereNull('referred_lead_id');
                })
                ->active()
                ->first();
        }

        if (!$referral) {
            return null;
        }

        $settings = ReferralSettings::getOrCreate($referral->tenant_id);

        // Check if booking qualifies
        if ($settings->require_booking_complete) {
            // Will be processed later when booking is completed
            $referral->update([
                'referred_lead_id' => $lead?->id,
                'referred_booking_id' => $booking->id,
            ]);
            return $referral;
        }

        // Process conversion immediately
        return $this->processConversion($referral, $lead, $booking);
    }

    /**
     * Process referral conversion when booking is completed
     */
    public function processBookingCompletion(Booking $booking): ?Referral
    {
        $referral = Referral::where('referred_booking_id', $booking->id)
            ->where('status', '!=', Referral::STATUS_CONVERTED)
            ->first();

        if (!$referral) {
            return null;
        }

        $settings = ReferralSettings::getOrCreate($referral->tenant_id);

        if (!$settings->bookingQualifies($booking)) {
            return null;
        }

        return $this->processConversion($referral, $booking->lead, $booking);
    }

    /**
     * Process the actual conversion
     */
    protected function processConversion(Referral $referral, ?Lead $referredLead, Booking $booking): Referral
    {
        $referral->markConverted($referredLead ?? new Lead(), $booking);

        // Calculate actual reward if percentage-based
        $settings = ReferralSettings::getOrCreate($referral->tenant_id);
        $actualReward = $settings->calculateReferrerReward($booking);

        $referral->update([
            'referrer_reward_value' => $actualReward,
        ]);

        Log::info('Referral converted', [
            'referral_id' => $referral->id,
            'referrer_id' => $referral->referrer_id,
            'booking_id' => $booking->id,
            'reward_value' => $actualReward,
        ]);

        return $referral;
    }

    /**
     * Issue pending rewards (called by scheduled job)
     */
    public function issuePendingRewards(int $tenantId): array
    {
        $results = [
            'processed' => 0,
            'rewarded' => 0,
            'errors' => 0,
        ];

        $settings = ReferralSettings::getOrCreate($tenantId);

        $pendingRewards = Referral::forTenant($tenantId)
            ->awaitingReward()
            ->with(['referrer', 'referredBooking'])
            ->get();

        foreach ($pendingRewards as $referral) {
            $results['processed']++;

            try {
                // Verify booking is still valid and completed
                if ($settings->require_booking_complete) {
                    $booking = $referral->referredBooking;
                    if (!$booking || $booking->status !== 'completed') {
                        continue;
                    }
                }

                $referral->issueReferrerReward();
                $results['rewarded']++;

                // TODO: Send notification email to referrer about their reward

            } catch (\Exception $e) {
                Log::error('Failed to issue referral reward', [
                    'referral_id' => $referral->id,
                    'error' => $e->getMessage(),
                ]);
                $results['errors']++;
            }
        }

        return $results;
    }

    /**
     * Expire old referrals
     */
    public function expireOldReferrals(): int
    {
        return Referral::where('status', '!=', Referral::STATUS_EXPIRED)
            ->where('status', '!=', Referral::STATUS_CONVERTED)
            ->where('status', '!=', Referral::STATUS_REWARDED)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->update(['status' => Referral::STATUS_EXPIRED]);
    }

    /**
     * Get referral statistics for a lead
     */
    public function getReferralStats(Lead $lead): array
    {
        $referrals = Referral::where('referrer_id', $lead->id)->get();

        return [
            'total_referrals' => $referrals->count(),
            'pending' => $referrals->where('status', Referral::STATUS_PENDING)->count(),
            'clicked' => $referrals->where('status', Referral::STATUS_CLICKED)->count(),
            'converted' => $referrals->where('status', Referral::STATUS_CONVERTED)->count(),
            'rewarded' => $referrals->where('status', Referral::STATUS_REWARDED)->count(),
            'total_clicks' => $referrals->sum('click_count'),
            'total_rewards_earned' => $referrals
                ->where('referrer_rewarded', true)
                ->sum('referrer_reward_value'),
            'total_conversion_value' => $referrals
                ->whereIn('status', [Referral::STATUS_CONVERTED, Referral::STATUS_REWARDED])
                ->sum('conversion_value'),
        ];
    }

    /**
     * Get program statistics for a tenant
     */
    public function getProgramStats(int $tenantId): array
    {
        $referrals = Referral::forTenant($tenantId)->get();
        $settings = ReferralSettings::getOrCreate($tenantId);

        $converted = $referrals->whereIn('status', [
            Referral::STATUS_CONVERTED,
            Referral::STATUS_REWARDED,
        ]);

        return [
            'is_enabled' => $settings->is_enabled,
            'total_referrals' => $referrals->count(),
            'total_clicks' => $referrals->sum('click_count'),
            'total_conversions' => $converted->count(),
            'conversion_rate' => $referrals->count() > 0
                ? round(($converted->count() / $referrals->count()) * 100, 2)
                : 0,
            'total_revenue' => $converted->sum('conversion_value'),
            'total_rewards_issued' => $referrals
                ->where('referrer_rewarded', true)
                ->sum('referrer_reward_value'),
            'pending_rewards' => $referrals
                ->where('status', Referral::STATUS_CONVERTED)
                ->where('referrer_rewarded', false)
                ->sum('referrer_reward_value'),
            'avg_conversion_value' => $converted->count() > 0
                ? round($converted->avg('conversion_value'), 2)
                : 0,
            'top_referrers' => $this->getTopReferrers($tenantId, 5),
        ];
    }

    /**
     * Get top referrers for a tenant
     */
    public function getTopReferrers(int $tenantId, int $limit = 10): Collection
    {
        return Lead::forTenant($tenantId)
            ->whereHas('referralsMade', function ($q) {
                $q->whereIn('status', [
                    Referral::STATUS_CONVERTED,
                    Referral::STATUS_REWARDED,
                ]);
            })
            ->withCount(['referralsMade as successful_referrals' => function ($q) {
                $q->whereIn('status', [
                    Referral::STATUS_CONVERTED,
                    Referral::STATUS_REWARDED,
                ]);
            }])
            ->orderByDesc('successful_referrals')
            ->limit($limit)
            ->get()
            ->map(fn ($lead) => [
                'id' => $lead->id,
                'name' => $lead->full_name,
                'email' => $lead->email,
                'referrals' => $lead->successful_referrals,
            ]);
    }

    /**
     * Calculate discount for a referred customer
     */
    public function calculateReferredDiscount(string $referralCode, float $bookingTotal): ?array
    {
        $referral = Referral::where('referral_code', $referralCode)
            ->active()
            ->first();

        if (!$referral) {
            return null;
        }

        $settings = ReferralSettings::getOrCreate($referral->tenant_id);

        if ($bookingTotal < $settings->min_booking_value) {
            return null;
        }

        $discount = $settings->calculateReferredDiscount($bookingTotal);

        return [
            'referral_id' => $referral->id,
            'discount_type' => $referral->referred_reward_type,
            'discount_value' => $discount,
            'applied_to' => $bookingTotal,
            'final_total' => max(0, $bookingTotal - $discount),
        ];
    }
}
