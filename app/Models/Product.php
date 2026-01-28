<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'short_description',
        'description',
        'type',
        'category',
        'tags',
        'price',
        'compare_at_price',
        'price_type',
        'min_participants',
        'max_participants',
        'duration_minutes',
        'duration_days',
        'minimum_certification',
        'minimum_age',
        'minimum_dives',
        'requires_medical_clearance',
        'prerequisites',
        'includes',
        'excludes',
        'equipment_included',
        'available_days',
        'available_times',
        'booking_buffer_hours',
        'cancellation_hours',
        'curriculum',
        'pool_sessions',
        'open_water_dives',
        'certification_issued',
        'image',
        'gallery',
        'meta_title',
        'meta_description',
        'sort_order',
        'is_featured',
        'show_on_website',
        'status',
    ];

    protected $casts = [
        'tags' => 'array',
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'requires_medical_clearance' => 'boolean',
        'includes' => 'array',
        'excludes' => 'array',
        'equipment_included' => 'boolean',
        'available_days' => 'array',
        'available_times' => 'array',
        'curriculum' => 'array',
        'gallery' => 'array',
        'is_featured' => 'boolean',
        'show_on_website' => 'boolean',
    ];

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class)
            ->withPivot(['price_override', 'is_available', 'available_times_override'])
            ->withTimestamps();
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function bookingItems(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    public function addOns(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_add_ons', 'product_id', 'add_on_product_id')
            ->withPivot(['price_override', 'is_default'])
            ->withTimestamps();
    }

    public function parentProducts(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_add_ons', 'add_on_product_id', 'product_id')
            ->withPivot(['price_override', 'is_default'])
            ->withTimestamps();
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePublished($query)
    {
        return $query->active()->where('show_on_website', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForLocation($query, int $locationId)
    {
        return $query->whereHas('locations', function ($q) use ($locationId) {
            $q->where('locations.id', $locationId)
              ->where('location_product.is_available', true);
        });
    }

    // Helpers

    public function getPriceForLocation(int $locationId): float
    {
        $pivot = $this->locations()
            ->where('locations.id', $locationId)
            ->first()?->pivot;

        return $pivot?->price_override ?? $this->price;
    }

    public function hasDiscount(): bool
    {
        return $this->compare_at_price && $this->compare_at_price > $this->price;
    }

    public function getDiscountPercentage(): ?int
    {
        if (!$this->hasDiscount()) {
            return null;
        }

        return (int) round((($this->compare_at_price - $this->price) / $this->compare_at_price) * 100);
    }

    public function isCourse(): bool
    {
        return in_array($this->type, ['course', 'discover_scuba']);
    }

    public function getDurationDisplay(): string
    {
        if ($this->duration_days) {
            return $this->duration_days . ' ' . ($this->duration_days === 1 ? 'day' : 'days');
        }

        if ($this->duration_minutes) {
            $hours = floor($this->duration_minutes / 60);
            $minutes = $this->duration_minutes % 60;

            if ($hours && $minutes) {
                return "{$hours}h {$minutes}m";
            } elseif ($hours) {
                return "{$hours} " . ($hours === 1 ? 'hour' : 'hours');
            } else {
                return "{$minutes} minutes";
            }
        }

        return '';
    }
}
