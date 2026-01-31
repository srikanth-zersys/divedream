<?php

namespace App\Http\Middleware;

use App\Services\TenantService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveLocation
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if (!$tenant) {
            return $next($request);
        }

        // Check for location in route parameter
        if ($locationId = $request->route('location')) {
            if (is_numeric($locationId)) {
                $this->tenantService->switchLocation((int) $locationId);
            }
        }
        // Check for location header (API)
        elseif ($request->hasHeader('X-Location-ID')) {
            $this->tenantService->switchLocation(
                (int) $request->header('X-Location-ID')
            );
        }
        // Check for location in query string
        elseif ($request->has('location_id')) {
            $this->tenantService->switchLocation(
                (int) $request->input('location_id')
            );
        }
        // Default location from session or first location
        else {
            $this->tenantService->getCurrentLocation();
        }

        return $next($request);
    }
}
