<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DiveSite extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'location_id',
        'name',
        'slug',
        'description',
        'latitude',
        'longitude',
        'distance_from_shore_minutes',
        'min_depth_meters',
        'max_depth_meters',
        'difficulty',
        'minimum_certification',
        'dive_types',
        'marine_life',
        'current_strength',
        'visibility',
        'best_months',
        'best_conditions',
        'image',
        'gallery',
        'video_url',
        'hazards',
        'emergency_notes',
        'average_rating',
        'total_reviews',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'dive_types' => 'array',
        'marine_life' => 'array',
        'best_months' => 'array',
        'best_conditions' => 'array',
        'gallery' => 'array',
        'average_rating' => 'decimal:2',
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

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function secondarySchedules(): HasMany
    {
        return $this->hasMany(Schedule::class, 'secondary_dive_site_id');
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
        return $query->where('is_active', true);
    }

    public function scopeForDifficulty($query, string $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    public function scopeForBeginners($query)
    {
        return $query->whereIn('difficulty', ['beginner', 'intermediate']);
    }

    // Helpers

    public function getDepthRange(): string
    {
        if ($this->min_depth_meters && $this->max_depth_meters) {
            return "{$this->min_depth_meters}m - {$this->max_depth_meters}m";
        }

        if ($this->max_depth_meters) {
            return "Max {$this->max_depth_meters}m";
        }

        return 'Depth varies';
    }

    public function getDifficultyLabel(): string
    {
        return match($this->difficulty) {
            'beginner' => 'Beginner Friendly',
            'intermediate' => 'Intermediate',
            'advanced' => 'Advanced',
            'expert' => 'Expert Only',
            default => 'All Levels',
        };
    }

    public function getDiveTypesLabels(): array
    {
        $types = [
            'reef' => 'Reef Dive',
            'wreck' => 'Wreck Dive',
            'wall' => 'Wall Dive',
            'drift' => 'Drift Dive',
            'night' => 'Night Dive',
            'cave' => 'Cave Dive',
            'muck' => 'Muck Dive',
            'deep' => 'Deep Dive',
        ];

        return array_map(
            fn($type) => $types[$type] ?? ucfirst($type),
            $this->dive_types ?? []
        );
    }

    public function isSuitableForCertification(?string $certLevel): bool
    {
        if (!$this->minimum_certification) {
            return true;
        }

        // Implementation would check certification hierarchy
        return true;
    }

    public function getDistanceDisplay(): string
    {
        if (!$this->distance_from_shore_minutes) {
            return 'Shore dive';
        }

        if ($this->distance_from_shore_minutes < 60) {
            return "{$this->distance_from_shore_minutes} min boat ride";
        }

        $hours = floor($this->distance_from_shore_minutes / 60);
        $minutes = $this->distance_from_shore_minutes % 60;

        return $minutes > 0
            ? "{$hours}h {$minutes}m boat ride"
            : "{$hours} hour boat ride";
    }
}
