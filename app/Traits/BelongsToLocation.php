<?php

namespace App\Traits;

use App\Models\Location;
use App\Services\TenantService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToLocation
{
    /**
     * Boot the trait
     */
    protected static function bootBelongsToLocation(): void
    {
        // Automatically set location_id when creating
        static::creating(function ($model) {
            if (!$model->location_id) {
                $tenantService = app(TenantService::class);
                $model->location_id = $tenantService->getCurrentLocationId();
            }
        });
    }

    /**
     * Get the location that owns this model
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Scope to filter by specific location
     */
    public function scopeForLocation(Builder $query, int $locationId): Builder
    {
        return $query->where($this->getTable() . '.location_id', $locationId);
    }

    /**
     * Scope to filter by current location
     */
    public function scopeCurrentLocation(Builder $query): Builder
    {
        $tenantService = app(TenantService::class);
        $locationId = $tenantService->getCurrentLocationId();

        if ($locationId) {
            return $query->where($this->getTable() . '.location_id', $locationId);
        }

        return $query;
    }

    /**
     * Scope to filter by multiple locations
     */
    public function scopeForLocations(Builder $query, array $locationIds): Builder
    {
        return $query->whereIn($this->getTable() . '.location_id', $locationIds);
    }

    /**
     * Scope to filter by user's accessible locations
     */
    public function scopeAccessibleLocations(Builder $query): Builder
    {
        if (!auth()->check()) {
            return $query;
        }

        $locationIds = auth()->user()->getAccessibleLocationIds();

        return $query->whereIn($this->getTable() . '.location_id', $locationIds);
    }
}
