<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'whatsapp',
        'date_of_birth',
        'gender',
        'nationality',
        'preferred_language',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'has_medical_conditions',
        'medical_conditions',
        'medications',
        'allergies',
        'medical_clearance_status',
        'medical_clearance_date',
        'medical_clearance_expiry',
        'total_dives',
        'last_dive_date',
        'diving_notes',
        'wetsuit_size',
        'bcd_size',
        'fin_size',
        'mask_prescription',
        'owns_equipment',
        'owned_equipment',
        'waiver_signed',
        'waiver_signed_at',
        'waiver_ip',
        'marketing_consent',
        'referral_source',
        'internal_notes',
        'tags',
        'status',
        'stripe_customer_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'has_medical_conditions' => 'boolean',
        'medical_clearance_date' => 'date',
        'medical_clearance_expiry' => 'date',
        'last_dive_date' => 'date',
        'owns_equipment' => 'boolean',
        'owned_equipment' => 'array',
        'waiver_signed' => 'boolean',
        'waiver_signed_at' => 'datetime',
        'marketing_consent' => 'boolean',
        'tags' => 'array',
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
            ->withPivot(['first_visit_at', 'last_visit_at', 'visit_count'])
            ->withTimestamps();
    }

    public function certifications(): HasMany
    {
        return $this->hasMany(MemberCertification::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    // Accessors

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getAgeAttribute(): ?int
    {
        return $this->date_of_birth?->age;
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

    public function scopeSearch($query, ?string $search)
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    // Helpers

    public function getHighestCertification(): ?MemberCertification
    {
        return $this->certifications()
            ->where('verification_status', 'verified')
            ->whereHas('certificationType')
            ->orderByDesc(function ($query) {
                $query->select('sort_order')
                    ->from('certification_types')
                    ->whereColumn('certification_types.id', 'member_certifications.certification_type_id');
            })
            ->first();
    }

    public function hasValidCertification(string $minimumLevel): bool
    {
        // Implementation would check against certification hierarchy
        return $this->certifications()
            ->where('verification_status', 'verified')
            ->exists();
    }

    public function needsMedicalClearance(): bool
    {
        if (!$this->has_medical_conditions) {
            return false;
        }

        if ($this->medical_clearance_status === 'approved' && $this->medical_clearance_expiry) {
            return $this->medical_clearance_expiry->isPast();
        }

        return $this->medical_clearance_status !== 'approved';
    }

    public function recordVisit(int $locationId): void
    {
        $this->locations()->syncWithoutDetaching([
            $locationId => [
                'last_visit_at' => now(),
                'visit_count' => \DB::raw('visit_count + 1'),
            ],
        ]);

        if (!$this->locations()->wherePivot('location_id', $locationId)->exists()) {
            $this->locations()->attach($locationId, [
                'first_visit_at' => now(),
                'last_visit_at' => now(),
                'visit_count' => 1,
            ]);
        }
    }
}
