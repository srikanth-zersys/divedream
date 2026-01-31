<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'description',
        'email',
        'phone',
        'whatsapp',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'operating_hours',
        'logo',
        'images',
        'default_booking_buffer_minutes',
        'max_advance_booking_days',
        'min_advance_booking_hours',
        'require_deposit',
        'deposit_percentage',
        'allow_reschedule',
        'reschedule_hours_before',
        'allow_cancellation',
        'cancellation_hours_before',
        'cancellation_fee_percentage',
        'require_waiver',
        'require_medical_form',
        'waiver_text',
        'medical_form_text',
        'settings',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'operating_hours' => 'array',
        'images' => 'array',
        'require_deposit' => 'boolean',
        'deposit_percentage' => 'decimal:2',
        'allow_reschedule' => 'boolean',
        'allow_cancellation' => 'boolean',
        'cancellation_fee_percentage' => 'decimal:2',
        'require_waiver' => 'boolean',
        'require_medical_form' => 'boolean',
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class)
            ->withPivot(['first_visit_at', 'last_visit_at', 'visit_count'])
            ->withTimestamps();
    }

    public function instructors(): BelongsToMany
    {
        return $this->belongsToMany(Instructor::class)
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)
            ->withPivot(['price_override', 'is_available', 'available_times_override'])
            ->withTimestamps();
    }

    public function boats(): HasMany
    {
        return $this->hasMany(Boat::class);
    }

    public function diveSites(): HasMany
    {
        return $this->hasMany(DiveSite::class);
    }

    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function waiverTemplates(): HasMany
    {
        return $this->hasMany(WaiverTemplate::class);
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Helpers

    public function getFullAddress(): string
    {
        $parts = array_filter([
            $this->address_line_1,
            $this->address_line_2,
            $this->city,
            $this->state,
            $this->postal_code,
            $this->country,
        ]);

        return implode(', ', $parts);
    }

    public function getAvailableEquipment(string $categorySlug = null)
    {
        $query = $this->equipment()->where('status', 'available');

        if ($categorySlug) {
            $query->whereHas('category', fn($q) => $q->where('slug', $categorySlug));
        }

        return $query->get();
    }
}
