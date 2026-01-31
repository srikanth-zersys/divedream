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

        // Date filter with validation
        if ($request->filled('date_from') && strtotime($request->date_from)) {
            $query->whereDate('date', '>=', date('Y-m-d', strtotime($request->date_from)));
        } else {
            $query->whereDate('date', '>=', Carbon::today());
        }

        if ($request->filled('date_to') && strtotime($request->date_to)) {
            $query->whereDate('date', '<=', date('Y-m-d', strtotime($request->date_to)));
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

        // Security: Validate entities belong to current tenant
        $tenantId = $tenant->id;
        $validated = $request->validate([
            'product_id' => [
                'required',
                'exists:products,id',
                function ($attribute, $value, $fail) use ($tenantId) {
                    if (!Product::where('id', $value)->where('tenant_id', $tenantId)->exists()) {
                        $fail('The selected product is invalid.');
                    }
                },
            ],
            'instructor_id' => [
                'nullable',
                'exists:instructors,id',
                function ($attribute, $value, $fail) use ($tenantId) {
                    if ($value && !Instructor::where('id', $value)->where('tenant_id', $tenantId)->exists()) {
                        $fail('The selected instructor is invalid.');
                    }
                },
            ],
            'boat_id' => [
                'nullable',
                'exists:boats,id',
                function ($attribute, $value, $fail) use ($tenantId) {
                    if ($value && !Boat::where('id', $value)->where('tenant_id', $tenantId)->exists()) {
                        $fail('The selected boat is invalid.');
                    }
                },
            ],
            'dive_site_id' => [
                'nullable',
                'exists:dive_sites,id',
                function ($attribute, $value, $fail) use ($tenantId) {
                    if ($value && !DiveSite::where('id', $value)->where('tenant_id', $tenantId)->exists()) {
                        $fail('The selected dive site is invalid.');
                    }
                },
            ],
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'max_participants' => 'required|integer|min:1|max:100',
            'min_participants' => 'nullable|integer|min:0|lte:max_participants',
            'price_override' => 'nullable|numeric|min:0|max:99999',
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

        // Security: Validate entities belong to current tenant
        $tenantId = $schedule->tenant_id;
        $validated = $request->validate([
            'product_id' => [
                'required',
                'exists:products,id',
                function ($attribute, $value, $fail) use ($tenantId) {
                    if (!Product::where('id', $value)->where('tenant_id', $tenantId)->exists()) {
                        $fail('The selected product is invalid.');
                    }
                },
            ],
            'instructor_id' => [
                'nullable',
                'exists:instructors,id',
                function ($attribute, $value, $fail) use ($tenantId) {
                    if ($value && !Instructor::where('id', $value)->where('tenant_id', $tenantId)->exists()) {
                        $fail('The selected instructor is invalid.');
                    }
                },
            ],
            'boat_id' => [
                'nullable',
                'exists:boats,id',
                function ($attribute, $value, $fail) use ($tenantId) {
                    if ($value && !Boat::where('id', $value)->where('tenant_id', $tenantId)->exists()) {
                        $fail('The selected boat is invalid.');
                    }
                },
            ],
            'dive_site_id' => [
                'nullable',
                'exists:dive_sites,id',
                function ($attribute, $value, $fail) use ($tenantId) {
                    if ($value && !DiveSite::where('id', $value)->where('tenant_id', $tenantId)->exists()) {
                        $fail('The selected dive site is invalid.');
                    }
                },
            ],
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'max_participants' => 'required|integer|min:1|max:100',
            'min_participants' => 'nullable|integer|min:0|lte:max_participants',
            'price_override' => 'nullable|numeric|min:0|max:99999',
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

        // CRITICAL: Check if schedule has ACTIVE bookings (not cancelled/completed/no_show)
        if ($schedule->hasActiveBookings()) {
            $count = $schedule->getActiveBookingsCount();
            return back()->with('error', "Cannot delete schedule with {$count} active booking(s). Cancel or complete them first, or cancel the schedule instead.");
        }

        // Soft delete also allows recovery if needed
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

        // Cancel associated bookings and send notifications
        $notifiedCount = 0;
        foreach ($schedule->bookings as $booking) {
            $booking->cancel($validated['cancellation_reason'], auth()->id());

            // Send notification if requested
            if (($validated['notify_customers'] ?? true) && $booking->member?->email) {
                \Mail::to($booking->member->email)->queue(
                    new \App\Mail\BookingCancellation($booking, $validated['cancellation_reason'])
                );
                $notifiedCount++;
            }
        }

        $message = 'Schedule cancelled successfully.';
        if ($notifiedCount > 0) {
            $message .= " {$notifiedCount} customer(s) have been notified.";
        }

        return back()->with('success', $message);
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

        // Security: Validate instructor belongs to current tenant
        $tenantId = $schedule->tenant_id;
        $validated = $request->validate([
            'instructor_id' => [
                'nullable',
                'exists:instructors,id',
                function ($attribute, $value, $fail) use ($tenantId) {
                    if ($value && !Instructor::where('id', $value)->where('tenant_id', $tenantId)->exists()) {
                        $fail('The selected instructor is invalid.');
                    }
                },
            ],
        ]);

        $schedule->update(['instructor_id' => $validated['instructor_id']]);

        return back()->with('success', 'Instructor assigned successfully.');
    }

    /**
     * Reschedule a schedule via drag-drop calendar
     */
    public function reschedule(Request $request, Schedule $schedule)
    {
        $this->authorize('update', $schedule);

        $validated = $request->validate([
            'new_start' => 'required|date',
            'new_end' => 'nullable|date|after:new_start',
            'notify_customers' => 'boolean',
        ]);

        $oldDate = $schedule->date;
        $oldStartTime = $schedule->start_time;
        $oldEndTime = $schedule->end_time;

        // Parse new datetime
        $newStart = Carbon::parse($validated['new_start']);
        $newEnd = $validated['new_end'] ? Carbon::parse($validated['new_end']) : null;

        // Update schedule
        $schedule->update([
            'date' => $newStart->toDateString(),
            'start_time' => $newStart->format('H:i:s'),
            'end_time' => $newEnd ? $newEnd->format('H:i:s') : $schedule->end_time,
        ]);

        // Notify customers if requested
        if ($validated['notify_customers'] ?? true) {
            $bookings = $schedule->bookings()->with('member')->get();

            foreach ($bookings as $booking) {
                // Queue schedule change notification
                if ($booking->member && $booking->member->email) {
                    \Mail::to($booking->member->email)->queue(
                        new \App\Mail\ScheduleChanged($booking, [
                            'old_date' => $oldDate,
                            'old_start_time' => $oldStartTime,
                            'old_end_time' => $oldEndTime,
                            'new_date' => $schedule->date,
                            'new_start_time' => $schedule->start_time,
                            'new_end_time' => $schedule->end_time,
                        ])
                    );
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Schedule updated successfully.',
            'schedule' => $schedule->fresh(),
        ]);
    }
}
