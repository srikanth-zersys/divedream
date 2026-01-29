<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Boat;
use App\Models\DiveSite;
use App\Models\Instructor;
use App\Models\Product;
use App\Models\Schedule;
use App\Services\TenantService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function index(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $query = Schedule::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->with(['product', 'instructor', 'boat', 'diveSite', 'location', 'bookings']);

        // Date filter
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        } else {
            $query->whereDate('date', '>=', Carbon::today());
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        // Product filter
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Instructor filter
        if ($request->filled('instructor_id')) {
            $query->where('instructor_id', $request->instructor_id);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $schedules = $query
            ->orderBy('date')
            ->orderBy('start_time')
            ->paginate(20)
            ->withQueryString();

        // Resources for filters
        $products = Product::forTenant($tenant->id)
            ->active()
            ->orderBy('name')
            ->get(['id', 'name', 'type']);

        $instructors = Instructor::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->active()
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('admin/schedules/index', [
            'schedules' => $schedules,
            'products' => $products,
            'instructors' => $instructors,
            'filters' => $request->only(['date_from', 'date_to', 'product_id', 'instructor_id', 'status']),
        ]);
    }

    public function calendar(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $start = Carbon::parse($request->get('start', Carbon::now()->startOfMonth()));
        $end = Carbon::parse($request->get('end', Carbon::now()->endOfMonth()->addMonth()));

        $schedules = Schedule::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereBetween('date', [$start, $end])
            ->with(['product', 'instructor', 'bookings'])
            ->get();

        $events = $schedules->map(function ($schedule) {
            $bookedCount = $schedule->bookings->sum('participant_count');
            $isFull = $bookedCount >= $schedule->max_participants;

            return [
                'id' => $schedule->id,
                'title' => $schedule->product->name,
                'start' => $schedule->date->format('Y-m-d') . 'T' . $schedule->start_time,
                'end' => $schedule->date->format('Y-m-d') . 'T' . ($schedule->end_time ?? '23:59'),
                'backgroundColor' => $isFull ? '#EF4444' : ($schedule->instructor?->calendar_color ?? '#3B82F6'),
                'borderColor' => $isFull ? '#DC2626' : ($schedule->instructor?->calendar_color ?? '#2563EB'),
                'extendedProps' => [
                    'productId' => $schedule->product_id,
                    'productType' => $schedule->product->type,
                    'instructor' => $schedule->instructor?->full_name,
                    'instructorId' => $schedule->instructor_id,
                    'booked' => $bookedCount,
                    'capacity' => $schedule->max_participants,
                    'available' => $schedule->max_participants - $bookedCount,
                    'status' => $schedule->status,
                    'isFull' => $isFull,
                ],
            ];
        });

        // Get instructors for filter/assignment
        $instructors = Instructor::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->active()
            ->get(['id', 'first_name', 'last_name', 'calendar_color']);

        // Get products for filter
        $products = Product::forTenant($tenant->id)
            ->active()
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'duration_minutes']);

        return Inertia::render('admin/schedules/calendar', [
            'events' => $events,
            'instructors' => $instructors,
            'products' => $products,
        ]);
    }

    public function create(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $products = Product::forTenant($tenant->id)
            ->active()
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->orderBy('name')
            ->get();

        $instructors = Instructor::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->active()
            ->orderBy('first_name')
            ->get();

        $boats = Boat::forTenant($tenant->id)
            ->when($location, fn($q) => $q->where('location_id', $location->id))
            ->active()
            ->orderBy('name')
            ->get();

        $diveSites = DiveSite::forTenant($tenant->id)
            ->when($location, fn($q) => $q->where('location_id', $location->id))
            ->active()
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/schedules/create', [
            'products' => $products,
            'instructors' => $instructors,
            'boats' => $boats,
            'diveSites' => $diveSites,
            'selectedDate' => $request->get('date'),
            'selectedProductId' => $request->get('product_id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'instructor_id' => 'nullable|exists:instructors,id',
            'boat_id' => 'nullable|exists:boats,id',
            'dive_site_id' => 'nullable|exists:dive_sites,id',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'max_participants' => 'required|integer|min:1',
            'min_participants' => 'nullable|integer|min:0|lte:max_participants',
            'price_override' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'internal_notes' => 'nullable|string|max:1000',
            'is_private' => 'boolean',
            'allow_online_booking' => 'boolean',
            // Recurring options
            'is_recurring' => 'boolean',
            'recurring_pattern' => 'required_if:is_recurring,true|in:daily,weekly,biweekly,monthly',
            'recurring_end_date' => 'required_if:is_recurring,true|date|after:date',
            'recurring_days' => 'required_if:recurring_pattern,weekly,biweekly|array',
            'recurring_days.*' => 'integer|min:0|max:6',
        ]);

        // Get product for defaults
        $product = Product::findOrFail($validated['product_id']);

        // Calculate end time if not provided
        if (!isset($validated['end_time']) && $product->duration_minutes) {
            $startTime = Carbon::parse($validated['start_time']);
            $validated['end_time'] = $startTime->addMinutes($product->duration_minutes)->format('H:i');
        }

        $baseData = [
            'tenant_id' => $tenant->id,
            'location_id' => $location?->id,
            'product_id' => $validated['product_id'],
            'instructor_id' => $validated['instructor_id'] ?? null,
            'boat_id' => $validated['boat_id'] ?? null,
            'dive_site_id' => $validated['dive_site_id'] ?? null,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'] ?? null,
            'max_participants' => $validated['max_participants'],
            'min_participants' => $validated['min_participants'] ?? 0,
            'price_override' => $validated['price_override'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'internal_notes' => $validated['internal_notes'] ?? null,
            'is_private' => $validated['is_private'] ?? false,
            'allow_online_booking' => $validated['allow_online_booking'] ?? true,
            'status' => 'active',
        ];

        $schedules = [];

        if ($validated['is_recurring'] ?? false) {
            // Generate recurring schedules
            $startDate = Carbon::parse($validated['date']);
            $endDate = Carbon::parse($validated['recurring_end_date']);
            $pattern = $validated['recurring_pattern'];
            $days = $validated['recurring_days'] ?? [];

            $currentDate = $startDate->copy();
            $weekCounter = 0; // Track weeks for biweekly pattern

            while ($currentDate->lte($endDate)) {
                $shouldCreate = false;

                switch ($pattern) {
                    case 'daily':
                        $shouldCreate = true;
                        break;
                    case 'weekly':
                        $shouldCreate = in_array($currentDate->dayOfWeek, $days);
                        break;
                    case 'biweekly':
                        // Only create on selected days during odd weeks (0, 2, 4...)
                        $shouldCreate = in_array($currentDate->dayOfWeek, $days) && ($weekCounter % 2 === 0);
                        break;
                    case 'monthly':
                        $shouldCreate = $currentDate->day === $startDate->day;
                        break;
                }

                if ($shouldCreate) {
                    $schedules[] = Schedule::create(array_merge($baseData, [
                        'date' => $currentDate->format('Y-m-d'),
                    ]));
                }

                // Move to next date and track week changes
                $previousWeek = $currentDate->weekOfYear;

                switch ($pattern) {
                    case 'daily':
                        $currentDate->addDay();
                        break;
                    case 'weekly':
                        $currentDate->addDay();
                        break;
                    case 'biweekly':
                        $currentDate->addDay();
                        // Increment week counter when we move to a new week
                        if ($currentDate->weekOfYear !== $previousWeek) {
                            $weekCounter++;
                        }
                        break;
                    case 'monthly':
                        $currentDate->addMonth();
                        break;
                }
            }

            return redirect()
                ->route('admin.schedules.index')
                ->with('success', count($schedules) . ' schedules created successfully.');
        } else {
            // Single schedule
            $schedule = Schedule::create(array_merge($baseData, [
                'date' => $validated['date'],
            ]));

            return redirect()
                ->route('admin.schedules.show', $schedule)
                ->with('success', 'Schedule created successfully.');
        }
    }

    public function show(Schedule $schedule): Response
    {
        $this->authorize('view', $schedule);

        $schedule->load([
            'product',
            'instructor',
            'boat',
            'diveSite',
            'location',
            'bookings.member',
            'bookings.participants',
        ]);

        return Inertia::render('admin/schedules/show', [
            'schedule' => $schedule,
        ]);
    }

    public function edit(Schedule $schedule): Response
    {
        $this->authorize('update', $schedule);

        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $products = Product::forTenant($tenant->id)
            ->active()
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->orderBy('name')
            ->get();

        $instructors = Instructor::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->active()
            ->orderBy('first_name')
            ->get();

        $boats = Boat::forTenant($tenant->id)
            ->when($location, fn($q) => $q->where('location_id', $location->id))
            ->active()
            ->orderBy('name')
            ->get();

        $diveSites = DiveSite::forTenant($tenant->id)
            ->when($location, fn($q) => $q->where('location_id', $location->id))
            ->active()
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/schedules/edit', [
            'schedule' => $schedule,
            'products' => $products,
            'instructors' => $instructors,
            'boats' => $boats,
            'diveSites' => $diveSites,
        ]);
    }

    public function update(Request $request, Schedule $schedule): RedirectResponse
    {
        $this->authorize('update', $schedule);

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'instructor_id' => 'nullable|exists:instructors,id',
            'boat_id' => 'nullable|exists:boats,id',
            'dive_site_id' => 'nullable|exists:dive_sites,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'max_participants' => 'required|integer|min:1',
            'min_participants' => 'nullable|integer|min:0|lte:max_participants',
            'price_override' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'internal_notes' => 'nullable|string|max:1000',
            'is_private' => 'boolean',
            'allow_online_booking' => 'boolean',
            'status' => 'required|in:active,cancelled,completed',
        ]);

        // Check if reducing capacity below current bookings
        $currentBookings = $schedule->bookings->sum('participant_count');
        if ($validated['max_participants'] < $currentBookings) {
            return back()
                ->withInput()
                ->withErrors(['max_participants' => "Cannot reduce capacity below current bookings ({$currentBookings})."]);
        }

        $schedule->update($validated);

        return redirect()
            ->route('admin.schedules.show', $schedule)
            ->with('success', 'Schedule updated successfully.');
    }

    public function destroy(Schedule $schedule): RedirectResponse
    {
        $this->authorize('delete', $schedule);

        // Check if schedule has bookings
        if ($schedule->bookings()->exists()) {
            return back()->with('error', 'Cannot delete schedule with existing bookings. Consider cancelling instead.');
        }

        $schedule->delete();

        return redirect()
            ->route('admin.schedules.index')
            ->with('success', 'Schedule deleted successfully.');
    }

    public function cancel(Request $request, Schedule $schedule): RedirectResponse
    {
        $this->authorize('update', $schedule);

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
            'notify_customers' => 'boolean',
        ]);

        $schedule->update([
            'status' => 'cancelled',
            'cancellation_reason' => $validated['cancellation_reason'],
        ]);

        // Cancel associated bookings
        foreach ($schedule->bookings as $booking) {
            $booking->cancel($validated['cancellation_reason'], auth()->id());
        }

        // TODO: Send notifications if requested

        return back()->with('success', 'Schedule cancelled successfully.');
    }

    public function duplicate(Schedule $schedule): RedirectResponse
    {
        $this->authorize('create', Schedule::class);

        $newSchedule = $schedule->replicate();
        $newSchedule->date = Carbon::parse($schedule->date)->addWeek();
        $newSchedule->status = 'active';
        $newSchedule->save();

        return redirect()
            ->route('admin.schedules.edit', $newSchedule)
            ->with('success', 'Schedule duplicated. Update the date and details as needed.');
    }

    public function assignInstructor(Request $request, Schedule $schedule): RedirectResponse
    {
        $this->authorize('update', $schedule);

        $validated = $request->validate([
            'instructor_id' => 'nullable|exists:instructors,id',
        ]);

        $schedule->update(['instructor_id' => $validated['instructor_id']]);

        return back()->with('success', 'Instructor assigned successfully.');
    }
}
