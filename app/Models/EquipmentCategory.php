<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EquipmentCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'track_sizes',
        'available_sizes',
        'requires_service',
        'service_interval_months',
        'sort_order',
    ];

    protected $casts = [
        'track_sizes' => 'boolean',
        'available_sizes' => 'array',
        'requires_service' => 'boolean',
    ];

    // Relationships

    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class);
    }

    // Scopes

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    // Helpers

    public function getEquipmentCount(int $locationId = null): int
    {
        $query = $this->equipment();

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        return $query->count();
    }

    public function getAvailableEquipmentCount(int $locationId = null): int
    {
        $query = $this->equipment()->available();

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        return $query->count();
    }
}
