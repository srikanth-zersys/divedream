<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Schedule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'location_id',
        'product_id',
        'title',
        'description',
        'type',
        'date',
        'start_time',
        'end_time',
        'check_in_minutes_before',
        'max_participants',
        'booked_count',
        'min_participants',
        'boat_id',
        'dive_site_id',
        'secondary_dive_site_id',
        'price_override',
        'lead_instructor_id',
        'status',
        'cancellation_reason',
        'weather_conditions',
        'briefing_notes',
        'post_trip_notes',
        'is_public',
        'allow_online_booking',
    ];

    protected $casts = [
        'date' => 'date',
        'price_override' => 'decimal:2',
        'weather_conditions' => 'array',
        'is_public' => 'boolean',
        'allow_online_booking' => 'boolean',
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

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function boat(): BelongsTo
    {
        return $this->belongsTo(Boat::class);
    }

    public function diveSite(): BelongsTo
    {
        return $this->belongsTo(DiveSite::class);
    }

    public function secondaryDiveSite(): BelongsTo
    {
        return $this->belongsTo(DiveSite::class, 'secondary_dive_site_id');
    }

    public function leadInstructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class, 'lead_instructor_id');
    }

    public function instructors(): BelongsToMany
    {
        return $this->belongsToMany(Instructor::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
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

    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('start_time');
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true)
            ->where('allow_online_booking', true);
    }

    public function scopeAvailable($query)
    {
        return $query->whereIn('status', ['scheduled', 'confirmed'])
            ->whereColumn('booked_count', '<', 'max_participants');
    }

    public function scopeToday($query)
    {
        return $query->where('date', now()->toDateString());
    }

    // Helpers

    public function getAvailableSpots(): int
    {
        return max(0, $this->max_participants - $this->booked_count);
    }

    public function hasAvailability(): bool
    {
        return $this->getAvailableSpots() > 0;
    }

    public function isFull(): bool
    {
        return $this->getAvailableSpots() === 0;
    }

    public function getPrice(): float
    {
        return $this->price_override ?? $this->product?->price ?? 0;
    }

    public function getCheckInTime(): string
    {
        $startTime = \Carbon\Carbon::parse($this->start_time);
        return $startTime->subMinutes($this->check_in_minutes_before)->format('H:i');
    }

    public function canBeBooked(): bool
    {
        return $this->status === 'scheduled'
            && $this->hasAvailability()
            && $this->date->isFuture();
    }

    public function incrementBookedCount(int $count = 1): void
    {
        $this->increment('booked_count', $count);
    }

    public function decrementBookedCount(int $count = 1): void
    {
        $this->decrement('booked_count', $count);
    }

    public function getAllInstructors()
    {
        $instructors = $this->instructors;

        if ($this->lead_instructor_id && !$instructors->contains('id', $this->lead_instructor_id)) {
            $instructors->prepend($this->leadInstructor);
        }

        return $instructors;
    }

    /**
     * CRITICAL: Check if schedule has active bookings before allowing deletion
     * Prevents orphaning bookings when schedule is deleted
     */
    public function hasActiveBookings(): bool
    {
        return $this->bookings()
            ->whereNotIn('status', ['cancelled', 'no_show', 'completed'])
            ->exists();
    }

    /**
     * Get count of active bookings
     */
    public function getActiveBookingsCount(): int
    {
        return $this->bookings()
            ->whereNotIn('status', ['cancelled', 'no_show', 'completed'])
            ->count();
    }

    /**
     * CRITICAL: Safe delete that checks for active bookings first
     * Returns false if deletion was blocked
     */
    public function safeDelete(): bool
    {
        if ($this->hasActiveBookings()) {
            return false;
        }

        return (bool) $this->delete();
    }
}
