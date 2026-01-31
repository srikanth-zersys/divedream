<?php

namespace App\Http\Middleware;

use App\Services\TenantService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenant
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        // Try to resolve tenant from request (subdomain/custom domain)
        $tenant = $this->tenantService->resolveFromRequest();

        // If not found from domain, try from authenticated user
        if (!$tenant && auth()->check()) {
            $tenant = auth()->user()->tenant;
            $this->tenantService->setCurrentTenant($tenant);
        }

        // For API routes, check for tenant header
        if (!$tenant && $request->hasHeader('X-Tenant-ID')) {
            $tenant = $this->tenantService->resolveById(
                (int) $request->header('X-Tenant-ID')
            );

            // Verify user belongs to this tenant
            if ($tenant && auth()->check() && !auth()->user()->belongsToTenant($tenant->id)) {
                abort(403, 'Access denied to this tenant.');
            }

            $this->tenantService->setCurrentTenant($tenant);
        }

        return $next($request);
    }
}
