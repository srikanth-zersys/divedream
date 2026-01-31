<?php

namespace App\Http\Middleware;

use App\Services\TenantService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();
        $accessibleLocations = $this->tenantService->getAccessibleLocations();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'avatar' => $request->user()->getAvatarUrl(),
                    'initials' => $request->user()->getInitials(),
                    'role' => $request->user()->getRoleNames()->first(),
                    'roles' => $request->user()->getRoleNames()->toArray(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name')->toArray(),
                    'is_owner' => $request->user()->isOwner(),
                    'is_admin' => $request->user()->isAdmin(),
                    'is_instructor' => $request->user()->isInstructor(),
                ] : null,
            ],

            'tenant' => $tenant ? [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'logo' => $tenant->logo ? asset('storage/' . $tenant->logo) : null,
                'plan' => $tenant->plan,
                'is_single_location' => $tenant->isSingleLocation(),
                'timezone' => $tenant->timezone,
                'currency' => $tenant->currency,
                'date_format' => $tenant->date_format,
                'time_format' => $tenant->time_format,
                'primary_color' => $tenant->primary_color,
                'secondary_color' => $tenant->secondary_color,
            ] : null,

            'location' => $location ? [
                'id' => $location->id,
                'name' => $location->name,
                'slug' => $location->slug,
                'address' => $location->getFullAddress(),
                'phone' => $location->phone,
                'email' => $location->email,
            ] : null,

            'locations' => $accessibleLocations->map(fn($loc) => [
                'id' => $loc->id,
                'name' => $loc->name,
                'slug' => $loc->slug,
                'is_active' => $loc->is_active,
            ])->toArray(),

            'showLocationSwitcher' => $tenant && !$tenant->isSingleLocation() && $accessibleLocations->count() > 1,

            'ziggy' => [
                'url' => $request->url(),
                'location' => $request->url(),
            ],

            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'warning' => fn() => $request->session()->get('warning'),
                'info' => fn() => $request->session()->get('info'),
            ],

            'app' => [
                'name' => config('app.name'),
                'version' => config('app.version', '1.0.0'),
            ],
        ]);
    }
}
