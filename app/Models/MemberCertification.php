<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberCertification extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'certification_type_id',
        'custom_agency',
        'custom_name',
        'certification_number',
        'issue_date',
        'expiry_date',
        'verification_status',
        'verified_at',
        'verified_by',
        'verification_notes',
        'card_front_image',
        'card_back_image',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'verified_at' => 'datetime',
    ];

    // Relationships

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function certificationType(): BelongsTo
    {
        return $this->belongsTo(CertificationType::class);
    }

    public function verifiedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // Scopes

    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    public function scopePending($query)
    {
        return $query->where('verification_status', 'pending');
    }

    public function scopeValid($query)
    {
        return $query->verified()
            ->where(function ($q) {
                $q->whereNull('expiry_date')
                  ->orWhere('expiry_date', '>', now());
            });
    }

    // Helpers

    public function getDisplayName(): string
    {
        if ($this->certificationType) {
            return $this->certificationType->getFullName();
        }

        return trim("{$this->custom_agency} {$this->custom_name}");
    }

    public function getAgency(): string
    {
        return $this->certificationType?->agency ?? $this->custom_agency ?? '';
    }

    public function getName(): string
    {
        return $this->certificationType?->name ?? $this->custom_name ?? '';
    }

    public function isVerified(): bool
    {
        return $this->verification_status === 'verified';
    }

    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }

    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function isValid(): bool
    {
        return $this->isVerified() && !$this->isExpired();
    }

    public function verify(int $userId, string $notes = null): void
    {
        $this->update([
            'verification_status' => 'verified',
            'verified_at' => now(),
            'verified_by' => $userId,
            'verification_notes' => $notes,
        ]);
    }

    public function reject(int $userId, string $reason): void
    {
        $this->update([
            'verification_status' => 'rejected',
            'verified_at' => now(),
            'verified_by' => $userId,
            'verification_notes' => $reason,
        ]);
    }
}
