<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use App\Models\InstructorAvailability;
use App\Services\TenantService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InstructorController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function index(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $query = Instructor::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->with(['locations']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('instructor_number', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Agency filter
        if ($request->filled('agency')) {
            $query->where('instructor_agency', $request->agency);
        }

        $instructors = $query
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/instructors/index', [
            'instructors' => $instructors,
            'filters' => $request->only(['search', 'status', 'agency']),
        ]);
    }

    public function create(): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $locations = $tenant->locations()->where('is_active', true)->get();

        return Inertia::render('admin/instructors/create', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'bio' => 'nullable|string|max:2000',
            'languages' => 'nullable|array',
            'employment_type' => 'required|in:full_time,part_time,contractor,freelance',
            'hire_date' => 'nullable|date',
            'hourly_rate' => 'nullable|numeric|min:0',
            'daily_rate' => 'nullable|numeric|min:0',
            'instructor_agency' => 'nullable|string|max:50',
            'instructor_number' => 'nullable|string|max:100',
            'instructor_level' => 'nullable|string|max:100',
            'instructor_cert_expiry' => 'nullable|date',
            'teaching_certifications' => 'nullable|array',
            'insurance_provider' => 'nullable|string|max:255',
            'insurance_policy_number' => 'nullable|string|max:100',
            'insurance_expiry' => 'nullable|date',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'calendar_color' => 'nullable|string|max:7',
            'location_ids' => 'required|array|min:1',
            'location_ids.*' => 'exists:locations,id',
            'primary_location_id' => 'required|exists:locations,id',
        ]);

        $instructor = Instructor::create(array_merge($validated, [
            'tenant_id' => $tenant->id,
            'status' => 'active',
        ]));

        // Attach locations
        $locationData = [];
        foreach ($validated['location_ids'] as $locationId) {
            $locationData[$locationId] = [
                'is_primary' => $locationId == $validated['primary_location_id'],
            ];
        }
        $instructor->locations()->attach($locationData);

        return redirect()
            ->route('admin.instructors.show', $instructor)
            ->with('success', 'Instructor created successfully.');
    }

    public function show(Instructor $instructor): Response
    {
        $this->authorize('view', $instructor);

        $instructor->load(['locations', 'user']);

        // Get upcoming schedules
        $upcomingSchedules = $instructor->schedules()
            ->whereDate('date', '>=', Carbon::today())
            ->with(['product', 'bookings'])
            ->orderBy('date')
            ->orderBy('start_time')
            ->limit(10)
            ->get();

        // Stats
        $stats = [
            'totalSchedules' => $instructor->schedules()->count(),
            'completedDives' => $instructor->schedules()
                ->where('status', 'completed')
                ->count(),
            'upcomingSchedules' => $instructor->schedules()
                ->whereDate('date', '>=', Carbon::today())
                ->where('status', 'active')
                ->count(),
        ];

        return Inertia::render('admin/instructors/show', [
            'instructor' => $instructor,
            'upcomingSchedules' => $upcomingSchedules,
            'stats' => $stats,
        ]);
    }

    public function edit(Instructor $instructor): Response
    {
        $this->authorize('update', $instructor);

        $tenant = $this->tenantService->getCurrentTenant();
        $locations = $tenant->locations()->where('is_active', true)->get();

        $instructor->load('locations');

        return Inertia::render('admin/instructors/edit', [
            'instructor' => $instructor,
            'locations' => $locations,
        ]);
    }

    public function update(Request $request, Instructor $instructor): RedirectResponse
    {
        $this->authorize('update', $instructor);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'bio' => 'nullable|string|max:2000',
            'languages' => 'nullable|array',
            'employment_type' => 'required|in:full_time,part_time,contractor,freelance',
            'hire_date' => 'nullable|date',
            'hourly_rate' => 'nullable|numeric|min:0',
            'daily_rate' => 'nullable|numeric|min:0',
            'instructor_agency' => 'nullable|string|max:50',
            'instructor_number' => 'nullable|string|max:100',
            'instructor_level' => 'nullable|string|max:100',
            'instructor_cert_expiry' => 'nullable|date',
            'teaching_certifications' => 'nullable|array',
            'insurance_provider' => 'nullable|string|max:255',
            'insurance_policy_number' => 'nullable|string|max:100',
            'insurance_expiry' => 'nullable|date',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'calendar_color' => 'nullable|string|max:7',
            'status' => 'required|in:active,inactive,on_leave',
            'location_ids' => 'required|array|min:1',
            'location_ids.*' => 'exists:locations,id',
            'primary_location_id' => 'required|exists:locations,id',
        ]);

        $instructor->update($validated);

        // Sync locations
        $locationData = [];
        foreach ($validated['location_ids'] as $locationId) {
            $locationData[$locationId] = [
                'is_primary' => $locationId == $validated['primary_location_id'],
            ];
        }
        $instructor->locations()->sync($locationData);

        return redirect()
            ->route('admin.instructors.show', $instructor)
            ->with('success', 'Instructor updated successfully.');
    }

    public function destroy(Instructor $instructor): RedirectResponse
    {
        $this->authorize('delete', $instructor);

        // Check for upcoming schedules
        $hasUpcoming = $instructor->schedules()
            ->whereDate('date', '>=', Carbon::today())
            ->where('status', 'active')
            ->exists();

        if ($hasUpcoming) {
            return back()->with('error', 'Cannot delete instructor with upcoming schedules.');
        }

        $instructor->delete();

        return redirect()
            ->route('admin.instructors.index')
            ->with('success', 'Instructor deleted successfully.');
    }

    public function availability(Instructor $instructor): Response
    {
        $this->authorize('view', $instructor);

        $instructor->load('locations');

        // Get availability settings
        $availabilities = $instructor->availabilities()
            ->orderBy('type')
            ->orderBy('day_of_week')
            ->get();

        // Get time off / overrides for next 3 months
        $overrides = $instructor->availabilities()
            ->whereIn('type', ['override', 'time_off'])
            ->whereDate('date', '>=', Carbon::today())
            ->whereDate('date', '<=', Carbon::today()->addMonths(3))
            ->orderBy('date')
            ->get();

        return Inertia::render('admin/instructors/availability', [
            'instructor' => $instructor,
            'availabilities' => $availabilities,
            'overrides' => $overrides,
        ]);
    }

    public function updateAvailability(Request $request, Instructor $instructor): RedirectResponse
    {
        $this->authorize('update', $instructor);

        $validated = $request->validate([
            'availabilities' => 'required|array',
            'availabilities.*.type' => 'required|in:recurring,override,time_off',
            'availabilities.*.day_of_week' => 'nullable|integer|min:0|max:6',
            'availabilities.*.date' => 'nullable|date',
            'availabilities.*.start_time' => 'nullable|date_format:H:i',
            'availabilities.*.end_time' => 'nullable|date_format:H:i|after:availabilities.*.start_time',
            'availabilities.*.location_id' => 'nullable|exists:locations,id',
            'availabilities.*.is_available' => 'boolean',
            'availabilities.*.reason' => 'nullable|string|max:255',
        ]);

        // Clear existing recurring availabilities
        $instructor->availabilities()->where('type', 'recurring')->delete();

        // Create new availabilities
        foreach ($validated['availabilities'] as $availability) {
            InstructorAvailability::create(array_merge($availability, [
                'instructor_id' => $instructor->id,
            ]));
        }

        return back()->with('success', 'Availability updated successfully.');
    }
}
