<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'referrer_id',
        'referred_lead_id',
        'referred_booking_id',
        'referral_code',
        'status',
        'referrer_reward_type',
        'referrer_reward_value',
        'referred_reward_type',
        'referred_reward_value',
        'referrer_rewarded',
        'referrer_rewarded_at',
        'click_count',
        'first_clicked_at',
        'converted_at',
        'conversion_value',
        'expires_at',
    ];

    protected $casts = [
        'referrer_reward_value' => 'decimal:2',
        'referred_reward_value' => 'decimal:2',
        'referrer_rewarded' => 'boolean',
        'referrer_rewarded_at' => 'datetime',
        'first_clicked_at' => 'datetime',
        'converted_at' => 'datetime',
        'conversion_value' => 'decimal:2',
        'expires_at' => 'datetime',
    ];

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_CLICKED = 'clicked';
    public const STATUS_CONVERTED = 'converted';
    public const STATUS_REWARDED = 'rewarded';
    public const STATUS_EXPIRED = 'expired';

    // Reward types
    public const REWARD_DISCOUNT = 'discount';
    public const REWARD_CREDIT = 'credit';
    public const REWARD_CASH = 'cash';

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'referrer_id');
    }

    public function referredLead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'referred_lead_id');
    }

    public function referredBooking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'referred_booking_id');
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_EXPIRED])
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeConverted($query)
    {
        return $query->where('status', self::STATUS_CONVERTED);
    }

    public function scopeAwaitingReward($query)
    {
        return $query->where('status', self::STATUS_CONVERTED)
            ->where('referrer_rewarded', false);
    }

    /**
     * Generate a unique referral code
     */
    public static function generateCode(int $tenantId): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (self::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Create a new referral for a lead
     */
    public static function createForLead(Lead $referrer, ReferralSettings $settings): self
    {
        return self::create([
            'tenant_id' => $referrer->tenant_id,
            'referrer_id' => $referrer->id,
            'referral_code' => self::generateCode($referrer->tenant_id),
            'status' => self::STATUS_PENDING,
            'referrer_reward_type' => $settings->referrer_reward_type,
            'referrer_reward_value' => $settings->referrer_reward_value,
            'referred_reward_type' => $settings->referred_reward_type,
            'referred_reward_value' => $settings->referred_reward_value,
            'expires_at' => $settings->referral_expiry_days
                ? now()->addDays($settings->referral_expiry_days)
                : null,
        ]);
    }

    /**
     * Record a click on the referral link
     */
    public function recordClick(): void
    {
        $this->increment('click_count');

        if (!$this->first_clicked_at) {
            $this->update([
                'first_clicked_at' => now(),
                'status' => self::STATUS_CLICKED,
            ]);
        }
    }

    /**
     * Mark as converted when referred person makes a booking
     */
    public function markConverted(Lead $referredLead, ?Booking $booking = null): void
    {
        $this->update([
            'status' => self::STATUS_CONVERTED,
            'referred_lead_id' => $referredLead->id,
            'referred_booking_id' => $booking?->id,
            'converted_at' => now(),
            'conversion_value' => $booking?->total,
        ]);

        // Record activity on referrer's lead
        $this->referrer->recordActivity('referral_converted', [
            'referral_id' => $this->id,
            'referred_email' => $referredLead->email,
            'booking_value' => $booking?->total,
        ]);
    }

    /**
     * Issue reward to the referrer
     */
    public function issueReferrerReward(): void
    {
        if ($this->referrer_rewarded) {
            return;
        }

        $this->update([
            'status' => self::STATUS_REWARDED,
            'referrer_rewarded' => true,
            'referrer_rewarded_at' => now(),
        ]);

        // TODO: Actually issue the reward (credit to account, generate discount code, etc.)
        // This would integrate with your payment/credit system
    }

    /**
     * Check if the referral has expired
     */
    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED ||
            ($this->expires_at && $this->expires_at->isPast());
    }

    /**
     * Mark as expired
     */
    public function markExpired(): void
    {
        $this->update(['status' => self::STATUS_EXPIRED]);
    }

    /**
     * Get the referral URL
     */
    public function getUrl(): string
    {
        return url("/r/{$this->referral_code}");
    }

    /**
     * Get sharing message with referral link
     */
    public function getShareMessage(): string
    {
        $settings = ReferralSettings::forTenant($this->tenant_id)->first();
        $message = $settings?->share_message ?? "Check out {tenant_name}! Use my link for {referred_reward_value} off your first booking:";

        return str_replace([
            '{tenant_name}',
            '{referral_url}',
            '{referred_reward_value}',
            '{referrer_reward_value}',
        ], [
            $this->tenant->name ?? '',
            $this->getUrl(),
            $this->formatRewardValue($this->referred_reward_type, $this->referred_reward_value),
            $this->formatRewardValue($this->referrer_reward_type, $this->referrer_reward_value),
        ], $message);
    }

    protected function formatRewardValue(?string $type, ?float $value): string
    {
        if (!$type || !$value) {
            return '';
        }

        return match ($type) {
            self::REWARD_DISCOUNT => "${$value} off",
            self::REWARD_CREDIT => "${$value} credit",
            self::REWARD_CASH => "${$value}",
            default => (string) $value,
        };
    }
}
