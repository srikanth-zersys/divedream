<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiscountCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'description',
        'type',
        'value',
        'minimum_order_amount',
        'maximum_discount_amount',
        'usage_limit',
        'usage_limit_per_customer',
        'times_used',
        'starts_at',
        'expires_at',
        'applicable_products',
        'applicable_locations',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'maximum_discount_amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'applicable_products' => 'array',
        'applicable_locations' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Scopes

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValid($query)
    {
        return $query->active()
            ->where(function ($q) {
                $q->whereNull('starts_at')
                  ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                  ->orWhereColumn('times_used', '<', 'usage_limit');
            });
    }

    // Helpers

    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->usage_limit && $this->times_used >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    public function canBeUsedBy(Member $member): bool
    {
        if (!$this->isValid()) {
            return false;
        }

        if ($this->usage_limit_per_customer) {
            $usageCount = Booking::where('member_id', $member->id)
                ->where('discount_code', $this->code)
                ->whereNotIn('status', ['cancelled'])
                ->count();

            if ($usageCount >= $this->usage_limit_per_customer) {
                return false;
            }
        }

        return true;
    }

    public function canBeAppliedTo(float $orderAmount, int $productId = null, int $locationId = null): bool
    {
        if ($this->minimum_order_amount && $orderAmount < $this->minimum_order_amount) {
            return false;
        }

        if ($this->applicable_products && $productId) {
            if (!in_array($productId, $this->applicable_products)) {
                return false;
            }
        }

        if ($this->applicable_locations && $locationId) {
            if (!in_array($locationId, $this->applicable_locations)) {
                return false;
            }
        }

        return true;
    }

    public function calculateDiscount(float $orderAmount): float
    {
        if ($this->type === 'percentage') {
            $discount = $orderAmount * ($this->value / 100);
        } else {
            $discount = $this->value;
        }

        if ($this->maximum_discount_amount) {
            $discount = min($discount, $this->maximum_discount_amount);
        }

        return min($discount, $orderAmount);
    }

    public function incrementUsage(): void
    {
        $this->increment('times_used');
    }

    public function getDisplayValue(): string
    {
        if ($this->type === 'percentage') {
            return $this->value . '% off';
        }

        return '$' . number_format($this->value, 2) . ' off';
    }
}
