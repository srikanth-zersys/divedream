<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function index()
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $locations = Location::where('tenant_id', $tenant->id)
            ->withCount(['members', 'bookings', 'schedules'])
            ->get();

        return Inertia::render('admin/locations/index', [
            'locations' => $locations,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/locations/create');
    }

    public function store(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:2',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'timezone' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $location = Location::create([
            ...$validated,
            'tenant_id' => $tenant->id,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.locations.index')
            ->with('success', 'Location created successfully.');
    }

    public function show(Location $location)
    {
        $this->authorizeLocation($location);

        $location->load(['members', 'instructors.user', 'equipment']);
        $location->loadCount(['members', 'bookings', 'schedules']);

        return Inertia::render('admin/locations/show', [
            'location' => $location,
        ]);
    }

    public function edit(Location $location)
    {
        $this->authorizeLocation($location);

        return Inertia::render('admin/locations/edit', [
            'location' => $location,
        ]);
    }

    public function update(Request $request, Location $location)
    {
        $this->authorizeLocation($location);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:2',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'timezone' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $location->update($validated);

        return redirect()->route('admin.locations.index')
            ->with('success', 'Location updated successfully.');
    }

    public function destroy(Location $location)
    {
        $this->authorizeLocation($location);

        // Check if location has any active bookings
        if ($location->bookings()->whereIn('status', ['confirmed', 'pending'])->exists()) {
            return back()->with('error', 'Cannot delete location with active bookings.');
        }

        $location->delete();

        return redirect()->route('admin.locations.index')
            ->with('success', 'Location deleted successfully.');
    }

    public function switchLocation(Request $request)
    {
        $validated = $request->validate([
            'location_id' => 'required|exists:locations,id',
        ]);

        $tenant = $this->tenantService->getCurrentTenant();
        $location = Location::where('tenant_id', $tenant->id)
            ->where('id', $validated['location_id'])
            ->firstOrFail();

        session(['current_location_id' => $location->id]);

        return back()->with('success', "Switched to {$location->name}");
    }

    public function selectLocation()
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $locations = Location::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->get();

        return Inertia::render('admin/locations/select', [
            'locations' => $locations,
        ]);
    }

    protected function authorizeLocation(Location $location): void
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($location->tenant_id !== $tenant->id) {
            abort(403, 'Unauthorized access to this location.');
        }
    }
}
