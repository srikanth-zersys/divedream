<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Boat extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'location_id',
        'name',
        'registration_number',
        'type',
        'max_passengers',
        'max_divers',
        'crew_count',
        'length_meters',
        'engine_count',
        'engine_type',
        'amenities',
        'has_toilet',
        'has_shower',
        'has_kitchen',
        'has_air_conditioning',
        'safety_equipment',
        'last_safety_inspection',
        'next_safety_inspection',
        'insurance_provider',
        'insurance_policy_number',
        'insurance_expiry',
        'image',
        'gallery',
        'charter_price_half_day',
        'charter_price_full_day',
        'available_for_charter',
        'notes',
        'status',
    ];

    protected $casts = [
        'length_meters' => 'decimal:2',
        'amenities' => 'array',
        'has_toilet' => 'boolean',
        'has_shower' => 'boolean',
        'has_kitchen' => 'boolean',
        'has_air_conditioning' => 'boolean',
        'safety_equipment' => 'array',
        'last_safety_inspection' => 'date',
        'next_safety_inspection' => 'date',
        'insurance_expiry' => 'date',
        'gallery' => 'array',
        'charter_price_half_day' => 'decimal:2',
        'charter_price_full_day' => 'decimal:2',
        'available_for_charter' => 'boolean',
    ];

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    // Scopes

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeForLocation($query, int $locationId)
    {
        return $query->where('location_id', $locationId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeAvailableForCharter($query)
    {
        return $query->active()->where('available_for_charter', true);
    }

    // Helpers

    public function isAvailable(): bool
    {
        return $this->status === 'active';
    }

    public function needsInspection(): bool
    {
        return $this->next_safety_inspection && $this->next_safety_inspection->isPast();
    }

    public function hasValidInsurance(): bool
    {
        return $this->insurance_expiry && $this->insurance_expiry->isFuture();
    }

    public function getAmenitiesList(): array
    {
        $amenities = [];

        if ($this->has_toilet) $amenities[] = 'Toilet';
        if ($this->has_shower) $amenities[] = 'Shower';
        if ($this->has_kitchen) $amenities[] = 'Kitchen';
        if ($this->has_air_conditioning) $amenities[] = 'Air Conditioning';

        return array_merge($amenities, $this->amenities ?? []);
    }

    public function isAvailableOnDate(\Carbon\Carbon $date): bool
    {
        if (!$this->isAvailable()) {
            return false;
        }

        // Check if already scheduled on that date
        return !$this->schedules()
            ->where('date', $date->format('Y-m-d'))
            ->whereNotIn('status', ['cancelled', 'weather_cancelled'])
            ->exists();
    }
}
