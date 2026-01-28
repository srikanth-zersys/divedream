<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'subdomain',
        'custom_domain',
        'email',
        'phone',
        'logo',
        'favicon',
        'timezone',
        'currency',
        'date_format',
        'time_format',
        'primary_color',
        'secondary_color',
        'custom_css',
        'stripe_customer_id',
        'stripe_subscription_id',
        'stripe_account_id',
        'stripe_onboarding_complete',
        'plan',
        'trial_ends_at',
        'subscription_ends_at',
        'settings',
        'booking_settings',
        'notification_settings',
        'status',
    ];

    protected $casts = [
        'stripe_onboarding_complete' => 'boolean',
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'settings' => 'array',
        'booking_settings' => 'array',
        'notification_settings' => 'array',
    ];

    // Relationships

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    public function instructors(): HasMany
    {
        return $this->hasMany(Instructor::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function discountCodes(): HasMany
    {
        return $this->hasMany(DiscountCode::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    // Helpers

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscription_ends_at && $this->subscription_ends_at->isFuture();
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && ($this->isOnTrial() || $this->hasActiveSubscription());
    }

    public function canAddLocation(): bool
    {
        $limits = [
            'starter' => 1,
            'growth' => 5,
            'enterprise' => PHP_INT_MAX,
        ];

        return $this->locations()->count() < ($limits[$this->plan] ?? 1);
    }

    public function getLocationCount(): int
    {
        return $this->locations()->count();
    }

    public function isSingleLocation(): bool
    {
        return $this->getLocationCount() <= 1;
    }
}
