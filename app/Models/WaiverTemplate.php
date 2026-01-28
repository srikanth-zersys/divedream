<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaiverTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'location_id',
        'name',
        'type',
        'language',
        'content',
        'is_required',
        'is_active',
        'version',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
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

    // Scopes

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeForLocation($query, int $locationId)
    {
        return $query->where(function ($q) use ($locationId) {
            $q->where('location_id', $locationId)
              ->orWhereNull('location_id');
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForLanguage($query, string $language)
    {
        return $query->where('language', $language);
    }

    // Helpers

    public static function getRequiredForBooking(int $tenantId, int $locationId, string $language = 'en')
    {
        return self::forTenant($tenantId)
            ->forLocation($locationId)
            ->active()
            ->required()
            ->forLanguage($language)
            ->get();
    }
}
