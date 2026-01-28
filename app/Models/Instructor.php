<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Instructor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'avatar',
        'bio',
        'languages',
        'employment_type',
        'hire_date',
        'hourly_rate',
        'daily_rate',
        'commission_percentage',
        'instructor_number',
        'instructor_agency',
        'instructor_level',
        'instructor_cert_expiry',
        'teaching_certifications',
        'specialty_certifications',
        'insurance_provider',
        'insurance_policy_number',
        'insurance_expiry',
        'emergency_contact_name',
        'emergency_contact_phone',
        'calendar_color',
        'availability_settings',
        'notification_preferences',
        'status',
    ];

    protected $casts = [
        'languages' => 'array',
        'hire_date' => 'date',
        'hourly_rate' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'commission_percentage' => 'decimal:2',
        'instructor_cert_expiry' => 'date',
        'teaching_certifications' => 'array',
        'specialty_certifications' => 'array',
        'insurance_expiry' => 'date',
        'availability_settings' => 'array',
        'notification_preferences' => 'array',
    ];

    protected $appends = ['full_name'];

    // Relationships

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class)
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(InstructorAvailability::class);
    }

    public function schedules(): BelongsToMany
    {
        return $this->belongsToMany(Schedule::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function leadSchedules(): HasMany
    {
        return $this->hasMany(Schedule::class, 'lead_instructor_id');
    }

    public function assignedBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'assigned_instructor_id');
    }

    // Accessors

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeForLocation($query, int $locationId)
    {
        return $query->whereHas('locations', fn($q) => $q->where('locations.id', $locationId));
    }

    // Helpers

    public function canTeach(string $certificationCode): bool
    {
        if (!$this->teaching_certifications) {
            return false;
        }

        return in_array($certificationCode, $this->teaching_certifications);
    }

    public function isAvailableOn(\Carbon\Carbon $date, int $locationId = null): bool
    {
        $dayOfWeek = $date->dayOfWeek;

        // Check for time off
        $hasTimeOff = $this->availabilities()
            ->where('type', 'time_off')
            ->where('date', $date->format('Y-m-d'))
            ->exists();

        if ($hasTimeOff) {
            return false;
        }

        // Check for override (explicit availability)
        $override = $this->availabilities()
            ->where('type', 'override')
            ->where('date', $date->format('Y-m-d'))
            ->when($locationId, fn($q) => $q->where('location_id', $locationId))
            ->first();

        if ($override) {
            return $override->is_available;
        }

        // Check recurring availability
        return $this->availabilities()
            ->where('type', 'recurring')
            ->where('day_of_week', $dayOfWeek)
            ->when($locationId, fn($q) => $q->where('location_id', $locationId))
            ->exists();
    }

    public function hasValidInsurance(): bool
    {
        return $this->insurance_expiry && $this->insurance_expiry->isFuture();
    }

    public function hasValidInstructorCert(): bool
    {
        return $this->instructor_cert_expiry && $this->instructor_cert_expiry->isFuture();
    }

    public function getSchedulesForDate(\Carbon\Carbon $date)
    {
        return $this->schedules()
            ->where('date', $date->format('Y-m-d'))
            ->orderBy('start_time')
            ->get();
    }
}
