<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookingParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'member_id',
        'first_name',
        'last_name',
        'email',
        'date_of_birth',
        'certification_level',
        'certification_number',
        'certification_agency',
        'certification_status',
        'waiver_signed',
        'waiver_signed_at',
        'waiver_signature',
        'medical_form_completed',
        'medical_answers',
        'equipment_sizes',
        'assigned_equipment',
        'checked_in',
        'checked_in_at',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'waiver_signed' => 'boolean',
        'waiver_signed_at' => 'datetime',
        'medical_form_completed' => 'boolean',
        'medical_answers' => 'array',
        'equipment_sizes' => 'array',
        'assigned_equipment' => 'array',
        'checked_in' => 'boolean',
        'checked_in_at' => 'datetime',
    ];

    protected $appends = ['full_name'];

    // Relationships

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function equipment(): HasMany
    {
        return $this->hasMany(BookingEquipment::class);
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

    // Helpers

    public function checkIn(): void
    {
        $this->update([
            'checked_in' => true,
            'checked_in_at' => now(),
        ]);
    }

    public function signWaiver(string $signature, string $ip = null): void
    {
        $this->update([
            'waiver_signed' => true,
            'waiver_signed_at' => now(),
            'waiver_signature' => $signature,
        ]);
    }

    public function completeMedicalForm(array $answers): void
    {
        $this->update([
            'medical_form_completed' => true,
            'medical_answers' => $answers,
        ]);
    }

    public function isReadyForDive(): bool
    {
        return $this->waiver_signed
            && $this->medical_form_completed
            && $this->certification_status === 'verified';
    }
}
