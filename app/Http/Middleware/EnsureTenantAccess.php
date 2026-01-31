<?php

namespace App\Http\Middleware;

use App\Services\TenantService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantAccess
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        // Must have a tenant
        if (!$tenant) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Tenant not found.'], 404);
            }
            abort(404, 'Tenant not found.');
        }

        // Tenant must be active
        if (!$tenant->isActive()) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'This account has been suspended or is inactive.'], 403);
            }
            abort(403, 'This account has been suspended or is inactive.');
        }

        // If authenticated, user must belong to this tenant
        if (auth()->check()) {
            $user = auth()->user();

            if (!$user->belongsToTenant($tenant->id) && !$user->hasRole('super-admin')) {
                if ($request->expectsJson()) {
                    return response()->json(['error' => 'You do not have access to this organization.'], 403);
                }
                abort(403, 'You do not have access to this organization.');
            }
        }

        return $next($request);
    }
}
