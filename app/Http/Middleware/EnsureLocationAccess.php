<?php

namespace App\Http\Middleware;

use App\Services\TenantService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureLocationAccess
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $location = $this->tenantService->getCurrentLocation();

        if (!$location) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'No location selected.'], 400);
            }

            // Redirect to location selector if no location
            return redirect()->route('location.select');
        }

        // Verify location is active
        if (!$location->is_active) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'This location is currently inactive.'], 403);
            }
            abort(403, 'This location is currently inactive.');
        }

        // Verify user has access to this location
        if (auth()->check() && !auth()->user()->hasAccessToLocation($location->id)) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'You do not have access to this location.'], 403);
            }
            abort(403, 'You do not have access to this location.');
        }

        return $next($request);
    }
}
