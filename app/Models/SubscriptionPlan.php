<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'monthly_price',
        'yearly_price',
        'currency',
        'stripe_monthly_price_id',
        'stripe_yearly_price_id',
        'max_locations',
        'max_users',
        'max_bookings_per_month',
        'max_products',
        'transaction_fee_percent',
        'features',
        'limits',
        'has_api_access',
        'has_white_label',
        'has_priority_support',
        'has_custom_domain',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'monthly_price' => 'decimal:2',
        'yearly_price' => 'decimal:2',
        'transaction_fee_percent' => 'decimal:2',
        'features' => 'array',
        'limits' => 'array',
        'has_api_access' => 'boolean',
        'has_white_label' => 'boolean',
        'has_priority_support' => 'boolean',
        'has_custom_domain' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    public function getPriceForCycle(string $cycle): float
    {
        return $cycle === 'yearly' ? ($this->yearly_price ?? $this->monthly_price * 12) : $this->monthly_price;
    }

    public function getStripePriceId(string $cycle): ?string
    {
        return $cycle === 'yearly' ? $this->stripe_yearly_price_id : $this->stripe_monthly_price_id;
    }

    public function getYearlySavings(): float
    {
        if (!$this->yearly_price) {
            return 0;
        }
        $monthlyTotal = $this->monthly_price * 12;
        return $monthlyTotal - $this->yearly_price;
    }

    public function getYearlySavingsPercent(): int
    {
        if (!$this->yearly_price) {
            return 0;
        }
        $monthlyTotal = $this->monthly_price * 12;
        return (int) round((($monthlyTotal - $this->yearly_price) / $monthlyTotal) * 100);
    }

    public function hasLimit(string $limit): bool
    {
        return $this->$limit !== null;
    }

    public function isUnlimited(string $limit): bool
    {
        return $this->$limit === null;
    }
}
