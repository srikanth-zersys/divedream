<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'is_enabled',
        'referrer_reward_type',
        'referrer_reward_value',
        'referrer_reward_percent',
        'referrer_max_reward',
        'referred_reward_type',
        'referred_reward_value',
        'referred_reward_percent',
        'min_booking_value',
        'referral_expiry_days',
        'max_referrals_per_customer',
        'require_booking_complete',
        'share_message',
        'terms_and_conditions',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'referrer_reward_value' => 'decimal:2',
        'referrer_max_reward' => 'decimal:2',
        'referred_reward_value' => 'decimal:2',
        'min_booking_value' => 'decimal:2',
        'require_booking_complete' => 'boolean',
    ];

    // Default share message
    public const DEFAULT_SHARE_MESSAGE = "Dive into adventure with {tenant_name}! Use my referral link and get {referred_reward_value} off your first booking: {referral_url}";

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Get or create settings for a tenant
     */
    public static function getOrCreate(int $tenantId): self
    {
        return self::firstOrCreate(
            ['tenant_id' => $tenantId],
            [
                'is_enabled' => false,
                'referrer_reward_type' => Referral::REWARD_CREDIT,
                'referrer_reward_value' => 20.00,
                'referred_reward_type' => Referral::REWARD_DISCOUNT,
                'referred_reward_value' => 15.00,
                'min_booking_value' => 0,
                'referral_expiry_days' => 30,
                'require_booking_complete' => true,
                'share_message' => self::DEFAULT_SHARE_MESSAGE,
            ]
        );
    }

    /**
     * Check if a lead can create a new referral
     */
    public function canCreateReferral(Lead $lead): bool
    {
        if (!$this->is_enabled) {
            return false;
        }

        // Check max referrals limit
        if ($this->max_referrals_per_customer) {
            $existingCount = Referral::where('referrer_id', $lead->id)
                ->whereIn('status', [Referral::STATUS_PENDING, Referral::STATUS_CLICKED, Referral::STATUS_CONVERTED, Referral::STATUS_REWARDED])
                ->count();

            if ($existingCount >= $this->max_referrals_per_customer) {
                return false;
            }
        }

        return true;
    }

    /**
     * Calculate the referrer reward for a booking
     */
    public function calculateReferrerReward(Booking $booking): float
    {
        $value = $this->referrer_reward_value;

        if ($this->referrer_reward_percent) {
            $value = $booking->total * ($this->referrer_reward_percent / 100);
        }

        if ($this->referrer_max_reward && $value > $this->referrer_max_reward) {
            $value = $this->referrer_max_reward;
        }

        return round($value, 2);
    }

    /**
     * Calculate the referred customer discount
     */
    public function calculateReferredDiscount(?float $bookingTotal = null): float
    {
        $value = $this->referred_reward_value;

        if ($this->referred_reward_percent && $bookingTotal) {
            $value = $bookingTotal * ($this->referred_reward_percent / 100);
        }

        return round($value, 2);
    }

    /**
     * Check if a booking qualifies for referral rewards
     */
    public function bookingQualifies(Booking $booking): bool
    {
        if ($booking->total < $this->min_booking_value) {
            return false;
        }

        if ($this->require_booking_complete && $booking->status !== 'completed') {
            return false;
        }

        return true;
    }

    /**
     * Get formatted referrer reward text
     */
    public function getReferrerRewardText(): string
    {
        if ($this->referrer_reward_percent) {
            return "{$this->referrer_reward_percent}% credit";
        }

        return match ($this->referrer_reward_type) {
            Referral::REWARD_DISCOUNT => "${$this->referrer_reward_value} discount",
            Referral::REWARD_CREDIT => "${$this->referrer_reward_value} credit",
            Referral::REWARD_CASH => "${$this->referrer_reward_value} cash",
            default => "${$this->referrer_reward_value}",
        };
    }

    /**
     * Get formatted referred reward text
     */
    public function getReferredRewardText(): string
    {
        if ($this->referred_reward_percent) {
            return "{$this->referred_reward_percent}% off";
        }

        return match ($this->referred_reward_type) {
            Referral::REWARD_DISCOUNT => "${$this->referred_reward_value} off",
            Referral::REWARD_CREDIT => "${$this->referred_reward_value} credit",
            default => "${$this->referred_reward_value}",
        };
    }
}
