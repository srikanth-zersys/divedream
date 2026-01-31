<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CertificationType extends Model
{
    use HasFactory;

    protected $fillable = [
        'agency',
        'name',
        'code',
        'description',
        'minimum_age',
        'minimum_dives',
        'prerequisite_code',
        'is_instructor_level',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_instructor_level' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships

    public function memberCertifications(): HasMany
    {
        return $this->hasMany(MemberCertification::class);
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForAgency($query, string $agency)
    {
        return $query->where('agency', $agency);
    }

    public function scopeRecreational($query)
    {
        return $query->where('is_instructor_level', false);
    }

    public function scopeInstructorLevel($query)
    {
        return $query->where('is_instructor_level', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('agency')->orderBy('sort_order');
    }

    // Helpers

    public function getFullName(): string
    {
        return "{$this->agency} {$this->name}";
    }

    public function getPrerequisite(): ?self
    {
        if (!$this->prerequisite_code) {
            return null;
        }

        return self::where('agency', $this->agency)
            ->where('code', $this->prerequisite_code)
            ->first();
    }

    public static function getAgencies(): array
    {
        return self::distinct('agency')
            ->orderBy('agency')
            ->pluck('agency')
            ->toArray();
    }
}
