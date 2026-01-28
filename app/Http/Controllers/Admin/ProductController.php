<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\TenantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function index(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $query = Product::forTenant($tenant->id)
            ->with(['locations']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Type filter
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $products = $query
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        // Stats
        $stats = [
            'total' => Product::forTenant($tenant->id)->count(),
            'active' => Product::forTenant($tenant->id)->where('status', 'active')->count(),
            'featured' => Product::forTenant($tenant->id)->where('is_featured', true)->count(),
        ];

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'stats' => $stats,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    public function create(): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $locations = $tenant->locations()->where('is_active', true)->get();

        return Inertia::render('admin/products/create', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:5000',
            'type' => 'required|in:fun_dive,course,discover_scuba,private_trip,boat_charter,equipment_rental,other',
            'category' => 'nullable|string|max:100',
            'tags' => 'nullable|array',
            'price' => 'required|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0|gt:price',
            'price_type' => 'required|in:per_person,per_group,flat_rate',
            'min_participants' => 'required|integer|min:1',
            'max_participants' => 'required|integer|min:1|gte:min_participants',
            'duration_minutes' => 'nullable|integer|min:0',
            'duration_days' => 'nullable|integer|min:0',
            'minimum_certification' => 'nullable|string|max:50',
            'minimum_age' => 'nullable|integer|min:0',
            'minimum_dives' => 'nullable|integer|min:0',
            'requires_medical_clearance' => 'boolean',
            'equipment_included' => 'boolean',
            'includes' => 'nullable|array',
            'excludes' => 'nullable|array',
            'available_days' => 'nullable|array',
            'available_times' => 'nullable|array',
            'booking_buffer_hours' => 'nullable|integer|min:0',
            'cancellation_hours' => 'nullable|integer|min:0',
            // Course-specific
            'curriculum' => 'nullable|array',
            'pool_sessions' => 'nullable|integer|min:0',
            'open_water_dives' => 'nullable|integer|min:0',
            'certification_issued' => 'nullable|string|max:255',
            // Display
            'sort_order' => 'nullable|integer',
            'is_featured' => 'boolean',
            'show_on_website' => 'boolean',
            'status' => 'required|in:active,draft,archived',
            // Locations
            'location_ids' => 'required|array|min:1',
            'location_ids.*' => 'exists:locations,id',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Check for duplicate slug
        $slugExists = Product::forTenant($tenant->id)
            ->where('slug', $validated['slug'])
            ->exists();

        if ($slugExists) {
            $validated['slug'] = $validated['slug'] . '-' . Str::random(4);
        }

        $product = Product::create(array_merge($validated, [
            'tenant_id' => $tenant->id,
        ]));

        // Attach locations
        $product->locations()->attach($validated['location_ids'], ['is_available' => true]);

        return redirect()
            ->route('admin.products.show', $product)
            ->with('success', 'Product created successfully.');
    }

    public function show(Product $product): Response
    {
        $this->authorize('view', $product);

        $product->load(['locations']);

        // Get booking stats
        $stats = [
            'totalBookings' => $product->bookings()->count(),
            'revenue' => $product->bookings()
                ->where('status', 'completed')
                ->sum('total_amount'),
            'upcomingSchedules' => $product->schedules()
                ->whereDate('date', '>=', now())
                ->where('status', 'active')
                ->count(),
        ];

        return Inertia::render('admin/products/show', [
            'product' => $product,
            'stats' => $stats,
        ]);
    }

    public function edit(Product $product): Response
    {
        $this->authorize('update', $product);

        $tenant = $this->tenantService->getCurrentTenant();
        $locations = $tenant->locations()->where('is_active', true)->get();

        $product->load('locations');

        return Inertia::render('admin/products/edit', [
            'product' => $product,
            'locations' => $locations,
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $this->authorize('update', $product);

        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:5000',
            'type' => 'required|in:fun_dive,course,discover_scuba,private_trip,boat_charter,equipment_rental,other',
            'category' => 'nullable|string|max:100',
            'tags' => 'nullable|array',
            'price' => 'required|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0',
            'price_type' => 'required|in:per_person,per_group,flat_rate',
            'min_participants' => 'required|integer|min:1',
            'max_participants' => 'required|integer|min:1|gte:min_participants',
            'duration_minutes' => 'nullable|integer|min:0',
            'duration_days' => 'nullable|integer|min:0',
            'minimum_certification' => 'nullable|string|max:50',
            'minimum_age' => 'nullable|integer|min:0',
            'minimum_dives' => 'nullable|integer|min:0',
            'requires_medical_clearance' => 'boolean',
            'equipment_included' => 'boolean',
            'includes' => 'nullable|array',
            'excludes' => 'nullable|array',
            'available_days' => 'nullable|array',
            'available_times' => 'nullable|array',
            'booking_buffer_hours' => 'nullable|integer|min:0',
            'cancellation_hours' => 'nullable|integer|min:0',
            'curriculum' => 'nullable|array',
            'pool_sessions' => 'nullable|integer|min:0',
            'open_water_dives' => 'nullable|integer|min:0',
            'certification_issued' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_featured' => 'boolean',
            'show_on_website' => 'boolean',
            'status' => 'required|in:active,draft,archived',
            'location_ids' => 'required|array|min:1',
            'location_ids.*' => 'exists:locations,id',
        ]);

        // Check for duplicate slug (excluding current product)
        if (!empty($validated['slug'])) {
            $slugExists = Product::forTenant($tenant->id)
                ->where('slug', $validated['slug'])
                ->where('id', '!=', $product->id)
                ->exists();

            if ($slugExists) {
                return back()
                    ->withInput()
                    ->withErrors(['slug' => 'This slug is already in use.']);
            }
        }

        $product->update($validated);

        // Sync locations
        $product->locations()->sync(
            collect($validated['location_ids'])->mapWithKeys(fn($id) => [$id => ['is_available' => true]])
        );

        return redirect()
            ->route('admin.products.show', $product)
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->authorize('delete', $product);

        // Check for existing bookings
        if ($product->bookings()->exists()) {
            return back()->with('error', 'Cannot delete product with existing bookings. Consider archiving instead.');
        }

        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
