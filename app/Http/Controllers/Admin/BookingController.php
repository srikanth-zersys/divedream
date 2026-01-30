<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Models\Member;
use App\Models\Product;
use App\Models\Schedule;
use App\Services\TenantService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function index(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $query = Booking::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->with(['member', 'product', 'schedule', 'location', 'payments']);

        // Filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_number', 'like', "%{$search}%")
                    ->orWhereHas('member', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Validate and apply date filters
        if ($request->filled('date_from') && strtotime($request->date_from)) {
            $query->whereDate('booking_date', '>=', date('Y-m-d', strtotime($request->date_from)));
        }

        if ($request->filled('date_to') && strtotime($request->date_to)) {
            $query->whereDate('booking_date', '<=', date('Y-m-d', strtotime($request->date_to)));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Sort with whitelist validation to prevent SQL injection
        $allowedSortFields = ['booking_date', 'created_at', 'total_amount', 'status', 'payment_status'];
        $sortField = in_array($request->get('sort'), $allowedSortFields) ? $request->get('sort') : 'booking_date';
        $sortDirection = $request->get('direction') === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortField, $sortDirection);

        $bookings = $query->paginate(20)->withQueryString();

        // Products for filter
        $products = Product::forTenant($tenant->id)
            ->active()
            ->orderBy('name')
            ->get(['id', 'name', 'type']);

        return Inertia::render('admin/bookings/index', [
            'bookings' => $bookings,
            'products' => $products,
            'filters' => $request->only(['search', 'status', 'product_id', 'date_from', 'date_to', 'payment_status', 'sort', 'direction']),
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

        $schedules = Schedule::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereDate('date', '>=', Carbon::today())
            ->where('status', 'active')
            ->with(['product', 'instructor'])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        $members = Member::forTenant($tenant->id)
            ->active()
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'email']);

        return Inertia::render('admin/bookings/create', [
            'products' => $products,
            'schedules' => $schedules,
            'members' => $members,
            'selectedProductId' => $request->get('product_id'),
            'selectedScheduleId' => $request->get('schedule_id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $validated = $request->validate([
            'member_id' => 'nullable|exists:members,id',
            'product_id' => 'required|exists:products,id',
            'schedule_id' => 'nullable|exists:schedules,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'participant_count' => 'required|integer|min:1',
            'special_requests' => 'nullable|string|max:1000',
            'internal_notes' => 'nullable|string|max:1000',
            'source' => 'required|in:admin,website,phone,walk_in,partner',
            // New member fields (if no member_id)
            'new_member' => 'nullable|array',
            'new_member.first_name' => 'required_with:new_member|string|max:255',
            'new_member.last_name' => 'required_with:new_member|string|max:255',
            'new_member.email' => 'required_with:new_member|email|max:255',
            'new_member.phone' => 'nullable|string|max:50',
            // Participants
            'participants' => 'nullable|array',
            'participants.*.name' => 'required|string|max:255',
            'participants.*.email' => 'nullable|email|max:255',
            'participants.*.certification_level' => 'nullable|string|max:100',
        ]);

        try {
            // Use database transaction with pessimistic locking to prevent overbooking
            $booking = \DB::transaction(function () use ($tenant, $location, $validated) {
                // Create new member if needed
                if (!$validated['member_id'] && isset($validated['new_member'])) {
                    $member = Member::create([
                        'tenant_id' => $tenant->id,
                        'first_name' => $validated['new_member']['first_name'],
                        'last_name' => $validated['new_member']['last_name'],
                        'email' => $validated['new_member']['email'],
                        'phone' => $validated['new_member']['phone'] ?? null,
                        'status' => 'active',
                        'source' => $validated['source'],
                    ]);
                    $validated['member_id'] = $member->id;
                }

                // Get product for pricing
                $product = Product::findOrFail($validated['product_id']);

                // If booking to a schedule, check availability with locking
                $schedule = null;
                if (isset($validated['schedule_id'])) {
                    $schedule = Schedule::lockForUpdate()->findOrFail($validated['schedule_id']);

                    // Check availability
                    $bookedCount = $schedule->bookings()
                        ->whereNotIn('status', ['cancelled', 'no_show'])
                        ->sum('participant_count');

                    $available = $schedule->max_participants - $bookedCount;

                    if ($validated['participant_count'] > $available) {
                        throw new \Exception("Only {$available} spots available on this schedule.");
                    }
                }

                // Calculate pricing
                $pricePerPerson = $location
                    ? $product->getPriceForLocation($location->id)
                    : $product->price;
                $subtotal = $pricePerPerson * $validated['participant_count'];

                // Create booking
                $booking = Booking::create([
                    'tenant_id' => $tenant->id,
                    'location_id' => $location?->id ?? $schedule?->location_id,
                    'member_id' => $validated['member_id'],
                    'product_id' => $validated['product_id'],
                    'schedule_id' => $validated['schedule_id'] ?? null,
                    'booking_number' => Booking::generateBookingNumber($tenant->id),
                    'booking_date' => $validated['booking_date'],
                    'participant_count' => $validated['participant_count'],
                    'subtotal' => $subtotal,
                    'discount_amount' => 0,
                    'tax_amount' => 0, // Calculate based on tenant settings
                    'total_amount' => $subtotal,
                    'amount_paid' => 0,
                    'special_requests' => $validated['special_requests'] ?? null,
                    'internal_notes' => $validated['internal_notes'] ?? null,
                    'source' => $validated['source'],
                    'status' => 'pending',
                    'payment_status' => 'pending',
                    'created_by' => auth()->id(),
                ]);

                // Create participants
                if (isset($validated['participants'])) {
                    foreach ($validated['participants'] as $participant) {
                        BookingParticipant::create([
                            'booking_id' => $booking->id,
                            'name' => $participant['name'],
                            'email' => $participant['email'] ?? null,
                            'certification_level' => $participant['certification_level'] ?? null,
                        ]);
                    }
                }

                // Increment schedule booked count to prevent overbooking
                if ($schedule) {
                    $schedule->incrementBookedCount($validated['participant_count']);
                }

                return $booking;
            });

            return redirect()
                ->route('admin.bookings.show', $booking)
                ->with('success', 'Booking created successfully.');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['booking' => $e->getMessage()]);
        }
    }

    public function show(Booking $booking): Response
    {
        $this->authorize('view', $booking);

        $booking->load([
            'member.certifications',
            'product',
            'schedule.instructor',
            'schedule.boat',
            'schedule.diveSite',
            'location',
            'participants',
            'equipment.equipment',
            'payments',
            'documents',
        ]);

        return Inertia::render('admin/bookings/show', [
            'booking' => $booking,
        ]);
    }

    public function edit(Booking $booking): Response
    {
        $this->authorize('update', $booking);

        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $booking->load(['member', 'product', 'schedule', 'participants']);

        $products = Product::forTenant($tenant->id)
            ->active()
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->orderBy('name')
            ->get();

        $schedules = Schedule::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereDate('date', '>=', Carbon::today())
            ->orWhere('id', $booking->schedule_id)
            ->where('status', 'active')
            ->with(['product', 'instructor'])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        $members = Member::forTenant($tenant->id)
            ->active()
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'email']);

        return Inertia::render('admin/bookings/edit', [
            'booking' => $booking,
            'products' => $products,
            'schedules' => $schedules,
            'members' => $members,
        ]);
    }

    public function update(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorize('update', $booking);

        $validated = $request->validate([
            'member_id' => 'nullable|exists:members,id',
            'product_id' => 'required|exists:products,id',
            'schedule_id' => 'nullable|exists:schedules,id',
            'booking_date' => 'required|date',
            'participant_count' => 'required|integer|min:1',
            'special_requests' => 'nullable|string|max:1000',
            'internal_notes' => 'nullable|string|max:1000',
            'status' => 'required|in:pending,confirmed,checked_in,completed,cancelled,no_show',
        ]);

        try {
            \DB::transaction(function () use ($booking, $validated) {
                $location = $this->tenantService->getCurrentLocation();
                $oldScheduleId = $booking->schedule_id;
                $oldParticipantCount = $booking->participant_count;
                $newScheduleId = $validated['schedule_id'] ?? null;
                $newParticipantCount = $validated['participant_count'];

                // Check if schedule is changing or participant count is increasing
                $scheduleChanged = $newScheduleId !== $oldScheduleId;
                $participantIncreased = $newParticipantCount > $oldParticipantCount;

                if (($scheduleChanged || $participantIncreased) && $newScheduleId) {
                    // Lock the schedule and check availability
                    $schedule = Schedule::lockForUpdate()->findOrFail($newScheduleId);

                    $bookedCount = $schedule->bookings()
                        ->whereNotIn('status', ['cancelled', 'no_show'])
                        ->where('id', '!=', $booking->id) // Exclude current booking
                        ->sum('participant_count');

                    $available = $schedule->max_participants - $bookedCount;

                    if ($newParticipantCount > $available) {
                        throw new \Exception("Only {$available} spots available on this schedule.");
                    }
                }

                // Recalculate pricing if participant count changed
                if ($newParticipantCount !== $oldParticipantCount) {
                    $product = Product::findOrFail($validated['product_id']);

                    $pricePerPerson = $location
                        ? $product->getPriceForLocation($location->id)
                        : $product->price;
                    $validated['subtotal'] = $pricePerPerson * $newParticipantCount;
                    $validated['total_amount'] = $validated['subtotal'] - $booking->discount_amount + $booking->tax_amount;
                }

                // Get original status before update
                $oldStatus = $booking->status;
                $wasActive = !in_array($oldStatus, ['cancelled', 'no_show']);
                $willBeActive = !in_array($validated['status'], ['cancelled', 'no_show']);

                $booking->update($validated);

                // Update schedule booked counts based on status transitions
                if ($oldScheduleId) {
                    if ($wasActive && !$willBeActive) {
                        // Transitioning from active to cancelled/no_show - decrement old schedule
                        Schedule::find($oldScheduleId)?->decrementBookedCount($oldParticipantCount);
                    } elseif ($wasActive && $willBeActive) {
                        // Staying active - handle schedule/participant changes
                        if ($scheduleChanged) {
                            // Moving to different schedule - remove from old
                            Schedule::find($oldScheduleId)?->decrementBookedCount($oldParticipantCount);
                        } elseif ($newParticipantCount !== $oldParticipantCount) {
                            // Same schedule but different count - adjust
                            $diff = $newParticipantCount - $oldParticipantCount;
                            if ($diff > 0) {
                                Schedule::find($oldScheduleId)?->incrementBookedCount($diff);
                            } else {
                                Schedule::find($oldScheduleId)?->decrementBookedCount(abs($diff));
                            }
                        }
                    } elseif (!$wasActive && $willBeActive) {
                        // Transitioning from cancelled to active - increment schedule
                        // Use new schedule if changed, otherwise old schedule
                        $targetScheduleId = $newScheduleId ?? $oldScheduleId;
                        Schedule::find($targetScheduleId)?->incrementBookedCount($newParticipantCount);
                    }
                }

                // Increment new schedule if changing schedules while staying active
                if ($scheduleChanged && $newScheduleId && $wasActive && $willBeActive) {
                    Schedule::find($newScheduleId)?->incrementBookedCount($newParticipantCount);
                }
            });

            return redirect()
                ->route('admin.bookings.show', $booking)
                ->with('success', 'Booking updated successfully.');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['booking' => $e->getMessage()]);
        }
    }

    public function checkIn(Booking $booking): RedirectResponse
    {
        $this->authorize('update', $booking);

        $booking->checkIn(auth()->id());

        return back()->with('success', 'Guest checked in successfully.');
    }

    public function checkOut(Booking $booking): RedirectResponse
    {
        $this->authorize('update', $booking);

        $booking->checkOut(auth()->id());

        return back()->with('success', 'Guest checked out successfully.');
    }

    public function cancel(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorize('update', $booking);

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        $booking->cancel($validated['cancellation_reason'], auth()->id());

        return back()->with('success', 'Booking cancelled successfully.');
    }

    public function calendar(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $start = Carbon::parse($request->get('start', Carbon::now()->startOfMonth()));
        $end = Carbon::parse($request->get('end', Carbon::now()->endOfMonth()));

        $schedules = Schedule::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereBetween('date', [$start, $end])
            ->with(['product', 'instructor', 'bookings'])
            ->get()
            ->map(function ($schedule) {
                $bookedCount = $schedule->bookings->sum('participant_count');
                return [
                    'id' => $schedule->id,
                    'title' => $schedule->product->name,
                    'start' => $schedule->date->format('Y-m-d') . 'T' . $schedule->start_time,
                    'end' => $schedule->date->format('Y-m-d') . 'T' . $schedule->end_time,
                    'color' => $schedule->instructor?->calendar_color ?? '#3B82F6',
                    'extendedProps' => [
                        'instructor' => $schedule->instructor?->full_name,
                        'booked' => $bookedCount,
                        'capacity' => $schedule->max_participants,
                        'status' => $schedule->status,
                    ],
                ];
            });

        return Inertia::render('admin/bookings/calendar', [
            'events' => $schedules,
        ]);
    }
}
