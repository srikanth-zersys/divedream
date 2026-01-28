<?php

namespace App\Traits;

use App\Models\Tenant;
use App\Services\TenantService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    /**
     * Boot the trait
     */
    protected static function bootBelongsToTenant(): void
    {
        // Automatically set tenant_id when creating
        static::creating(function ($model) {
            if (!$model->tenant_id) {
                $tenantService = app(TenantService::class);
                $model->tenant_id = $tenantService->getCurrentTenantId();
            }
        });

        // Global scope to filter by current tenant
        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantService = app(TenantService::class);
            $tenantId = $tenantService->getCurrentTenantId();

            if ($tenantId) {
                $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenantId);
            }
        });
    }

    /**
     * Get the tenant that owns this model
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope to filter by specific tenant
     */
    public function scopeForTenant(Builder $query, int $tenantId): Builder
    {
        return $query->withoutGlobalScope('tenant')
            ->where($this->getTable() . '.tenant_id', $tenantId);
    }

    /**
     * Scope to query without tenant restriction
     */
    public function scopeWithoutTenantScope(Builder $query): Builder
    {
        return $query->withoutGlobalScope('tenant');
    }
}
