<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentCategory;
use App\Models\EquipmentMaintenanceLog;
use App\Services\TenantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function index(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $query = Equipment::forTenant($tenant->id)
            ->when($location, fn($q) => $q->where('location_id', $location->id))
            ->with(['category', 'location']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category_id')) {
            $query->where('equipment_category_id', $request->category_id);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Condition filter
        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        $equipment = $query
            ->orderBy('equipment_category_id')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $categories = EquipmentCategory::orderBy('sort_order')->get();

        // Stats
        $stats = [
            'total' => Equipment::forTenant($tenant->id)->when($location, fn($q) => $q->where('location_id', $location->id))->count(),
            'available' => Equipment::forTenant($tenant->id)->when($location, fn($q) => $q->where('location_id', $location->id))->where('status', 'available')->count(),
            'inUse' => Equipment::forTenant($tenant->id)->when($location, fn($q) => $q->where('location_id', $location->id))->where('status', 'in_use')->count(),
            'needsService' => Equipment::forTenant($tenant->id)->when($location, fn($q) => $q->where('location_id', $location->id))->where('condition', 'needs_service')->count(),
        ];

        return Inertia::render('admin/equipment/index', [
            'equipment' => $equipment,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search', 'category_id', 'status', 'condition']),
        ]);
    }

    public function create(): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $locations = $tenant->locations()->where('is_active', true)->get();
        $categories = EquipmentCategory::orderBy('sort_order')->get();

        return Inertia::render('admin/equipment/create', [
            'locations' => $locations,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $validated = $request->validate([
            'equipment_category_id' => 'required|exists:equipment_categories,id',
            'location_id' => 'required|exists:locations,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'serial_number' => 'nullable|string|max:100',
            'size' => 'nullable|string|max:20',
            'color' => 'nullable|string|max:50',
            'condition' => 'required|in:new,good,fair,needs_service,retired',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'is_available_for_rental' => 'boolean',
            'rental_price_per_dive' => 'nullable|numeric|min:0',
            'rental_price_per_day' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check for duplicate code
        $exists = Equipment::forTenant($tenant->id)
            ->where('code', $validated['code'])
            ->exists();

        if ($exists) {
            return back()
                ->withInput()
                ->withErrors(['code' => 'This equipment code is already in use.']);
        }

        Equipment::create(array_merge($validated, [
            'tenant_id' => $tenant->id,
            'status' => 'available',
        ]));

        return redirect()
            ->route('admin.equipment.index')
            ->with('success', 'Equipment created successfully.');
    }

    public function show(Equipment $equipment): Response
    {
        $this->authorize('view', $equipment);

        $equipment->load(['category', 'location', 'maintenanceLogs' => function ($q) {
            $q->latest()->limit(10);
        }]);

        // Usage history
        $usageHistory = $equipment->bookingEquipment()
            ->with(['booking.member', 'booking.product'])
            ->latest()
            ->limit(20)
            ->get();

        return Inertia::render('admin/equipment/show', [
            'equipment' => $equipment,
            'usageHistory' => $usageHistory,
        ]);
    }

    public function edit(Equipment $equipment): Response
    {
        $this->authorize('update', $equipment);

        $tenant = $this->tenantService->getCurrentTenant();
        $locations = $tenant->locations()->where('is_active', true)->get();
        $categories = EquipmentCategory::orderBy('sort_order')->get();

        return Inertia::render('admin/equipment/edit', [
            'equipment' => $equipment,
            'locations' => $locations,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Equipment $equipment): RedirectResponse
    {
        $this->authorize('update', $equipment);

        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'equipment_category_id' => 'required|exists:equipment_categories,id',
            'location_id' => 'required|exists:locations,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'serial_number' => 'nullable|string|max:100',
            'size' => 'nullable|string|max:20',
            'color' => 'nullable|string|max:50',
            'condition' => 'required|in:new,good,fair,needs_service,retired',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'last_service_date' => 'nullable|date',
            'next_service_date' => 'nullable|date',
            'is_available_for_rental' => 'boolean',
            'rental_price_per_dive' => 'nullable|numeric|min:0',
            'rental_price_per_day' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'status' => 'required|in:available,in_use,reserved,maintenance,retired',
        ]);

        // Check for duplicate code (excluding current)
        $exists = Equipment::forTenant($tenant->id)
            ->where('code', $validated['code'])
            ->where('id', '!=', $equipment->id)
            ->exists();

        if ($exists) {
            return back()
                ->withInput()
                ->withErrors(['code' => 'This equipment code is already in use.']);
        }

        $equipment->update($validated);

        return redirect()
            ->route('admin.equipment.show', $equipment)
            ->with('success', 'Equipment updated successfully.');
    }

    public function destroy(Equipment $equipment): RedirectResponse
    {
        $this->authorize('delete', $equipment);

        // Check if equipment is currently in use
        if ($equipment->status === 'in_use') {
            return back()->with('error', 'Cannot delete equipment that is currently in use.');
        }

        $equipment->delete();

        return redirect()
            ->route('admin.equipment.index')
            ->with('success', 'Equipment deleted successfully.');
    }

    public function logMaintenance(Request $request, Equipment $equipment): RedirectResponse
    {
        $this->authorize('update', $equipment);

        $validated = $request->validate([
            'type' => 'required|in:inspection,service,repair,replacement',
            'description' => 'required|string|max:1000',
            'cost' => 'nullable|numeric|min:0',
            'performed_by' => 'nullable|string|max:255',
            'next_service_date' => 'nullable|date',
        ]);

        EquipmentMaintenanceLog::create(array_merge($validated, [
            'equipment_id' => $equipment->id,
            'service_date' => now(),
            'logged_by' => auth()->id(),
        ]));

        // Update equipment
        $equipment->update([
            'last_service_date' => now(),
            'next_service_date' => $validated['next_service_date'],
            'condition' => $validated['type'] === 'service' ? 'good' : $equipment->condition,
            'status' => 'available',
        ]);

        return back()->with('success', 'Maintenance logged successfully.');
    }
}
