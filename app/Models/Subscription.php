<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'subscription_plan_id',
        'stripe_subscription_id',
        'stripe_customer_id',
        'status',
        'billing_cycle',
        'trial_ends_at',
        'current_period_start',
        'current_period_end',
        'canceled_at',
        'ended_at',
        'ends_at',
        'payment_method_type',
        'payment_method_last4',
        'payment_method_brand',
        'bookings_this_month',
        'usage_reset_at',
        'usage',
        'metadata',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'canceled_at' => 'datetime',
        'ended_at' => 'datetime',
        'ends_at' => 'datetime',
        'usage_reset_at' => 'datetime',
        'usage' => 'array',
        'metadata' => 'array',
    ];

    // Status constants
    public const STATUS_TRIALING = 'trialing';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_PAST_DUE = 'past_due';
    public const STATUS_CANCELED = 'canceled';
    public const STATUS_UNPAID = 'unpaid';
    public const STATUS_INCOMPLETE = 'incomplete';

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(SubscriptionInvoice::class);
    }

    public function usageRecords(): HasMany
    {
        return $this->hasMany(SubscriptionUsage::class);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_ACTIVE, self::STATUS_TRIALING]);
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function isActive(): bool
    {
        if ($this->status === self::STATUS_ACTIVE) {
            return true;
        }

        if ($this->status === self::STATUS_TRIALING) {
            // Check if trial has expired
            return $this->trial_ends_at && $this->trial_ends_at->isFuture();
        }

        return false;
    }

    public function isTrialing(): bool
    {
        return $this->status === self::STATUS_TRIALING;
    }

    public function isCanceled(): bool
    {
        return $this->status === self::STATUS_CANCELED || $this->canceled_at !== null;
    }

    public function isPastDue(): bool
    {
        return $this->status === self::STATUS_PAST_DUE;
    }

    public function onTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function trialDaysRemaining(): int
    {
        if (!$this->trial_ends_at) {
            return 0;
        }
        return max(0, now()->diffInDays($this->trial_ends_at, false));
    }

    public function daysUntilRenewal(): int
    {
        if (!$this->current_period_end) {
            return 0;
        }
        return max(0, now()->diffInDays($this->current_period_end, false));
    }

    public function cancel(): void
    {
        $this->update([
            'status' => self::STATUS_CANCELED,
            'canceled_at' => now(),
        ]);
    }

    public function cancelAtPeriodEnd(): void
    {
        $this->update([
            'canceled_at' => now(),
        ]);
    }

    public function resume(): void
    {
        $this->update([
            'status' => self::STATUS_ACTIVE,
            'canceled_at' => null,
        ]);
    }

    public function incrementBookingUsage(): void
    {
        $this->increment('bookings_this_month');
    }

    public function resetMonthlyUsage(): void
    {
        $this->update([
            'bookings_this_month' => 0,
            'usage_reset_at' => now(),
        ]);
    }

    public function hasReachedBookingLimit(): bool
    {
        $limit = $this->plan->max_bookings_per_month;
        if ($limit === null) {
            return false;
        }
        return $this->bookings_this_month >= $limit;
    }

    public function getBookingsRemaining(): ?int
    {
        $limit = $this->plan->max_bookings_per_month;
        if ($limit === null) {
            return null;
        }
        return max(0, $limit - $this->bookings_this_month);
    }

    public function getUsagePercentage(): float
    {
        $limit = $this->plan->max_bookings_per_month;
        if ($limit === null || $limit === 0) {
            return 0;
        }
        return min(100, ($this->bookings_this_month / $limit) * 100);
    }

    public function recordUsage(string $type, int $quantity = 1, ?float $unitPrice = null): SubscriptionUsage
    {
        return $this->usageRecords()->create([
            'type' => $type,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total' => $unitPrice ? $unitPrice * $quantity : null,
            'recorded_at' => now(),
        ]);
    }

    public function updatePaymentMethod(array $paymentMethod): void
    {
        $this->update([
            'payment_method_type' => $paymentMethod['type'] ?? 'card',
            'payment_method_last4' => $paymentMethod['last4'] ?? null,
            'payment_method_brand' => $paymentMethod['brand'] ?? null,
        ]);
    }
}
