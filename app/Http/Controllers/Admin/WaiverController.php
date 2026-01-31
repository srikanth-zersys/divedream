<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WaiverTemplate;
use App\Services\TenantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WaiverController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function index(): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $waivers = WaiverTemplate::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/waivers/index', [
            'waivers' => $waivers,
            'types' => $this->getWaiverTypes(),
            'languages' => $this->getLanguages(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/waivers/create', [
            'types' => $this->getWaiverTypes(),
            'languages' => $this->getLanguages(),
            'locations' => $this->tenantService->getCurrentTenant()->locations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:liability,medical,photo_release,rental_agreement,custom',
            'language' => 'required|string|size:2',
            'content' => 'required|string',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'location_id' => 'nullable|exists:locations,id',
        ]);

        // Verify location belongs to tenant
        if (isset($validated['location_id'])) {
            $location = $tenant->locations()->find($validated['location_id']);
            if (!$location) {
                return back()->withErrors(['location_id' => 'Invalid location.']);
            }
        }

        WaiverTemplate::create([
            'tenant_id' => $tenant->id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'language' => $validated['language'],
            'content' => $validated['content'],
            'is_required' => $validated['is_required'] ?? true,
            'is_active' => $validated['is_active'] ?? true,
            'location_id' => $validated['location_id'] ?? null,
            'version' => 1,
        ]);

        return redirect()
            ->route('admin.waivers.index')
            ->with('success', 'Waiver template created successfully.');
    }

    public function show(WaiverTemplate $waiver): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($waiver->tenant_id !== $tenant->id) {
            abort(404);
        }

        return Inertia::render('admin/waivers/show', [
            'waiver' => $waiver->load('location'),
        ]);
    }

    public function edit(WaiverTemplate $waiver): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($waiver->tenant_id !== $tenant->id) {
            abort(404);
        }

        return Inertia::render('admin/waivers/edit', [
            'waiver' => $waiver,
            'types' => $this->getWaiverTypes(),
            'languages' => $this->getLanguages(),
            'locations' => $tenant->locations,
        ]);
    }

    public function update(Request $request, WaiverTemplate $waiver): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($waiver->tenant_id !== $tenant->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:liability,medical,photo_release,rental_agreement,custom',
            'language' => 'required|string|size:2',
            'content' => 'required|string',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'location_id' => 'nullable|exists:locations,id',
        ]);

        // Check if content changed - if so, increment version
        $version = $waiver->version;
        if ($waiver->content !== $validated['content']) {
            $version++;
        }

        $waiver->update([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'language' => $validated['language'],
            'content' => $validated['content'],
            'is_required' => $validated['is_required'] ?? true,
            'is_active' => $validated['is_active'] ?? true,
            'location_id' => $validated['location_id'] ?? null,
            'version' => $version,
        ]);

        return redirect()
            ->route('admin.waivers.index')
            ->with('success', 'Waiver template updated successfully.');
    }

    public function destroy(WaiverTemplate $waiver): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($waiver->tenant_id !== $tenant->id) {
            abort(404);
        }

        $waiver->delete();

        return redirect()
            ->route('admin.waivers.index')
            ->with('success', 'Waiver template deleted successfully.');
    }

    public function duplicate(WaiverTemplate $waiver): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($waiver->tenant_id !== $tenant->id) {
            abort(404);
        }

        $newWaiver = $waiver->replicate();
        $newWaiver->name = $waiver->name . ' (Copy)';
        $newWaiver->version = 1;
        $newWaiver->save();

        return redirect()
            ->route('admin.waivers.edit', $newWaiver)
            ->with('success', 'Waiver template duplicated successfully.');
    }

    public function preview(WaiverTemplate $waiver): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($waiver->tenant_id !== $tenant->id) {
            abort(404);
        }

        return Inertia::render('admin/waivers/preview', [
            'waiver' => $waiver,
            'tenant' => $tenant,
        ]);
    }

    protected function getWaiverTypes(): array
    {
        return [
            ['value' => 'liability', 'label' => 'Liability Waiver', 'description' => 'Standard liability and assumption of risk'],
            ['value' => 'medical', 'label' => 'Medical Questionnaire', 'description' => 'RSTC/PADI medical statement'],
            ['value' => 'photo_release', 'label' => 'Photo Release', 'description' => 'Media and photo usage consent'],
            ['value' => 'rental_agreement', 'label' => 'Rental Agreement', 'description' => 'Equipment rental terms'],
            ['value' => 'custom', 'label' => 'Custom Document', 'description' => 'Custom waiver or document'],
        ];
    }

    protected function getLanguages(): array
    {
        return [
            ['code' => 'en', 'name' => 'English'],
            ['code' => 'es', 'name' => 'Spanish'],
            ['code' => 'de', 'name' => 'German'],
            ['code' => 'fr', 'name' => 'French'],
            ['code' => 'it', 'name' => 'Italian'],
            ['code' => 'pt', 'name' => 'Portuguese'],
            ['code' => 'nl', 'name' => 'Dutch'],
            ['code' => 'th', 'name' => 'Thai'],
            ['code' => 'ja', 'name' => 'Japanese'],
            ['code' => 'zh', 'name' => 'Chinese'],
        ];
    }
}
