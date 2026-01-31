<?php

namespace App\Services;

use App\Models\Location;
use App\Models\Tenant;
use Illuminate\Support\Facades\Cache;

class TenantService
{
    private ?Tenant $currentTenant = null;
    private ?Location $currentLocation = null;

    /**
     * Resolve tenant from subdomain or custom domain
     */
    public function resolveFromRequest(): ?Tenant
    {
        $host = request()->getHost();

        // Check for custom domain first
        $tenant = $this->resolveFromCustomDomain($host);

        if (!$tenant) {
            // Try subdomain
            $tenant = $this->resolveFromSubdomain($host);
        }

        if ($tenant) {
            $this->setCurrentTenant($tenant);
        }

        return $tenant;
    }

    /**
     * Resolve tenant from custom domain
     */
    public function resolveFromCustomDomain(string $host): ?Tenant
    {
        return Cache::remember(
            "tenant_domain_{$host}",
            now()->addMinutes(10),
            fn() => Tenant::where('custom_domain', $host)->first()
        );
    }

    /**
     * Resolve tenant from subdomain
     */
    public function resolveFromSubdomain(string $host): ?Tenant
    {
        // Extract subdomain from host
        $parts = explode('.', $host);

        // Assuming format: subdomain.domain.com
        if (count($parts) >= 3) {
            $subdomain = $parts[0];

            // Skip common subdomains
            if (in_array($subdomain, ['www', 'api', 'app', 'admin'])) {
                return null;
            }

            return Cache::remember(
                "tenant_subdomain_{$subdomain}",
                now()->addMinutes(10),
                fn() => Tenant::where('subdomain', $subdomain)->first()
            );
        }

        return null;
    }

    /**
     * Resolve tenant by ID
     */
    public function resolveById(int $id): ?Tenant
    {
        return Cache::remember(
            "tenant_{$id}",
            now()->addMinutes(10),
            fn() => Tenant::find($id)
        );
    }

    /**
     * Resolve tenant by slug
     */
    public function resolveBySlug(string $slug): ?Tenant
    {
        return Cache::remember(
            "tenant_slug_{$slug}",
            now()->addMinutes(10),
            fn() => Tenant::where('slug', $slug)->first()
        );
    }

    /**
     * Set the current tenant
     */
    public function setCurrentTenant(?Tenant $tenant): void
    {
        $this->currentTenant = $tenant;

        // Store in session for authenticated users
        if ($tenant && auth()->check()) {
            session(['current_tenant_id' => $tenant->id]);
        }
    }

    /**
     * Get the current tenant
     */
    public function getCurrentTenant(): ?Tenant
    {
        if ($this->currentTenant) {
            return $this->currentTenant;
        }

        // Try to get from authenticated user
        if (auth()->check() && auth()->user()->tenant_id) {
            $this->currentTenant = auth()->user()->tenant;
            return $this->currentTenant;
        }

        // Try to get from session
        $tenantId = session('current_tenant_id');
        if ($tenantId) {
            $this->currentTenant = $this->resolveById($tenantId);
            return $this->currentTenant;
        }

        return null;
    }

    /**
     * Get current tenant ID
     */
    public function getCurrentTenantId(): ?int
    {
        return $this->getCurrentTenant()?->id;
    }

    /**
     * Set the current location
     */
    public function setCurrentLocation(?Location $location): void
    {
        $this->currentLocation = $location;

        if ($location) {
            session(['current_location_id' => $location->id]);
        }
    }

    /**
     * Get the current location
     */
    public function getCurrentLocation(): ?Location
    {
        if ($this->currentLocation) {
            return $this->currentLocation;
        }

        // Try to get from session
        $locationId = session('current_location_id');
        if ($locationId) {
            $this->currentLocation = Location::find($locationId);

            // Verify location belongs to current tenant
            if ($this->currentLocation && $this->currentTenant) {
                if ($this->currentLocation->tenant_id !== $this->currentTenant->id) {
                    $this->currentLocation = null;
                    session()->forget('current_location_id');
                }
            }

            return $this->currentLocation;
        }

        // Default to first location if single-location tenant
        $tenant = $this->getCurrentTenant();
        if ($tenant && $tenant->isSingleLocation()) {
            $this->currentLocation = $tenant->locations()->first();
            if ($this->currentLocation) {
                session(['current_location_id' => $this->currentLocation->id]);
            }
        }

        return $this->currentLocation;
    }

    /**
     * Get current location ID
     */
    public function getCurrentLocationId(): ?int
    {
        return $this->getCurrentLocation()?->id;
    }

    /**
     * Switch to a different location
     */
    public function switchLocation(int $locationId): bool
    {
        $tenant = $this->getCurrentTenant();

        if (!$tenant) {
            return false;
        }

        $location = $tenant->locations()->find($locationId);

        if (!$location) {
            return false;
        }

        // Check if user has access to this location
        if (auth()->check() && !auth()->user()->hasAccessToLocation($locationId)) {
            return false;
        }

        $this->setCurrentLocation($location);
        return true;
    }

    /**
     * Get all accessible locations for current user
     */
    public function getAccessibleLocations(): \Illuminate\Database\Eloquent\Collection
    {
        $tenant = $this->getCurrentTenant();

        if (!$tenant) {
            return new \Illuminate\Database\Eloquent\Collection();
        }

        if (!auth()->check()) {
            return $tenant->locations()->active()->get();
        }

        $user = auth()->user();

        // Owners and admins can access all locations
        if ($user->isAdmin()) {
            return $tenant->locations()->get();
        }

        // Other users only see their assigned locations
        return $user->locations()->where('tenant_id', $tenant->id)->get();
    }

    /**
     * Check if current tenant is active
     */
    public function isTenantActive(): bool
    {
        $tenant = $this->getCurrentTenant();

        return $tenant && $tenant->isActive();
    }

    /**
     * Clear tenant cache
     */
    public function clearCache(?Tenant $tenant = null): void
    {
        $tenant = $tenant ?? $this->currentTenant;

        if ($tenant) {
            Cache::forget("tenant_{$tenant->id}");
            Cache::forget("tenant_slug_{$tenant->slug}");
            Cache::forget("tenant_subdomain_{$tenant->subdomain}");

            if ($tenant->custom_domain) {
                Cache::forget("tenant_domain_{$tenant->custom_domain}");
            }
        }
    }

    /**
     * Get tenant settings with defaults
     */
    public function getSetting(string $key, mixed $default = null): mixed
    {
        $tenant = $this->getCurrentTenant();

        if (!$tenant || !$tenant->settings) {
            return $default;
        }

        return data_get($tenant->settings, $key, $default);
    }

    /**
     * Get booking settings with defaults
     */
    public function getBookingSetting(string $key, mixed $default = null): mixed
    {
        $tenant = $this->getCurrentTenant();

        if (!$tenant || !$tenant->booking_settings) {
            return $default;
        }

        return data_get($tenant->booking_settings, $key, $default);
    }
}
