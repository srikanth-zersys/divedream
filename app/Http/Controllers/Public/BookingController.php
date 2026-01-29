<?php

namespace App\Http\Controllers\Public;

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

    /**
     * Public booking landing page
     */
    public function index(): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        if (!$tenant) {
            abort(404, 'Dive center not found');
        }

        // Featured products
        $featuredProducts = Product::forTenant($tenant->id)
            ->published()
            ->featured()
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->orderBy('sort_order')
            ->limit(6)
            ->get();

        // Upcoming schedules
        $upcomingSchedules = Schedule::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->whereDate('date', '>=', Carbon::today())
            ->whereDate('date', '<=', Carbon::today()->addDays(14))
            ->where('status', 'active')
            ->where('allow_online_booking', true)
            ->with(['product', 'instructor', 'diveSite'])
            ->withCount(['bookings as booked_count' => function ($q) {
                $q->whereNotIn('status', ['cancelled', 'no_show']);
            }])
            ->having('booked_count', '<', \DB::raw('max_participants'))
            ->orderBy('date')
            ->orderBy('start_time')
            ->limit(10)
            ->get();

        return Inertia::render('public/book/index', [
            'tenant' => [
                'name' => $tenant->name,
                'logo' => $tenant->logo ? asset('storage/' . $tenant->logo) : null,
                'description' => $tenant->description,
                'primary_color' => $tenant->primary_color,
            ],
            'location' => $location ? [
                'name' => $location->name,
                'address' => $location->getFullAddress(),
            ] : null,
            'featuredProducts' => $featuredProducts,
            'upcomingSchedules' => $upcomingSchedules,
        ]);
    }

    /**
     * Browse all products
     */
    public function products(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $query = Product::forTenant($tenant->id)
            ->published()
            ->when($location, fn($q) => $q->forLocation($location->id));

        // Filter by type
        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $products = $query
            ->orderBy('is_featured', 'desc')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        // Get available types and categories
        $types = Product::forTenant($tenant->id)
            ->published()
            ->distinct()
            ->pluck('type');

        $categories = Product::forTenant($tenant->id)
            ->published()
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('public/book/products', [
            'products' => $products,
            'types' => $types,
            'categories' => $categories,
            'filters' => $request->only(['type', 'category']),
        ]);
    }

    /**
     * View single product with availability
     */
    public function product(Product $product): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        // Ensure product belongs to tenant and is published
        if ($product->tenant_id !== $tenant->id || $product->status !== 'active' || !$product->show_on_website) {
            abort(404);
        }

        // Get upcoming schedules for this product
        $schedules = Schedule::forTenant($tenant->id)
            ->when($location, fn($q) => $q->forLocation($location->id))
            ->where('product_id', $product->id)
            ->whereDate('date', '>=', Carbon::today())
            ->whereDate('date', '<=', Carbon::today()->addMonths(3))
            ->where('status', 'active')
            ->where('allow_online_booking', true)
            ->with(['instructor', 'diveSite', 'boat'])
            ->withCount(['bookings as booked_count' => function ($q) {
                $q->whereNotIn('status', ['cancelled', 'no_show']);
            }])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'date' => $schedule->date->format('Y-m-d'),
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'instructor' => $schedule->instructor ? [
                        'name' => $schedule->instructor->full_name,
                        'avatar' => $schedule->instructor->avatar,
                    ] : null,
                    'dive_site' => $schedule->diveSite?->name,
                    'boat' => $schedule->boat?->name,
                    'max_participants' => $schedule->max_participants,
                    'booked_count' => $schedule->booked_count,
                    'available' => $schedule->max_participants - $schedule->booked_count,
                    'price' => $schedule->price_override ?? $product->price,
                ];
            });

        // Group schedules by date for calendar view
        $schedulesByDate = $schedules->groupBy('date');

        // Related products
        $relatedProducts = Product::forTenant($tenant->id)
            ->published()
            ->where('id', '!=', $product->id)
            ->where(function ($q) use ($product) {
                $q->where('type', $product->type)
                    ->orWhere('category', $product->category);
            })
            ->limit(4)
            ->get();

        return Inertia::render('public/book/product', [
            'product' => $product,
            'schedules' => $schedules,
            'schedulesByDate' => $schedulesByDate,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    /**
     * View schedule details and book
     */
    public function schedule(Schedule $schedule): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($schedule->tenant_id !== $tenant->id) {
            abort(404);
        }

        $schedule->load(['product', 'instructor', 'diveSite', 'boat', 'location']);

        // Calculate availability
        $bookedCount = $schedule->bookings()
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->sum('participant_count');

        $available = $schedule->max_participants - $bookedCount;

        return Inertia::render('public/book/schedule', [
            'schedule' => $schedule,
            'bookedCount' => $bookedCount,
            'available' => $available,
            'price' => $schedule->price_override ?? $schedule->product->price,
        ]);
    }

    /**
     * Check availability via AJAX
     */
    public function checkAvailability(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'date' => 'required|date|after_or_equal:today',
            'participants' => 'required|integer|min:1',
        ]);

        $schedules = Schedule::forTenant($tenant->id)
            ->where('product_id', $validated['product_id'])
            ->whereDate('date', $validated['date'])
            ->where('status', 'active')
            ->where('allow_online_booking', true)
            ->with(['instructor'])
            ->withCount(['bookings as booked_count' => function ($q) {
                $q->whereNotIn('status', ['cancelled', 'no_show']);
            }])
            ->get()
            ->filter(function ($schedule) use ($validated) {
                return ($schedule->max_participants - $schedule->booked_count) >= $validated['participants'];
            })
            ->values();

        return response()->json([
            'available' => $schedules->isNotEmpty(),
            'schedules' => $schedules,
        ]);
    }

    /**
     * Checkout page
     */
    public function checkout(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $scheduleId = $request->get('schedule');
        $participants = (int) $request->get('participants', 1);

        if (!$scheduleId) {
            return redirect()->route('public.book.index');
        }

        $schedule = Schedule::forTenant($tenant->id)
            ->with(['product', 'instructor', 'diveSite', 'boat', 'location'])
            ->findOrFail($scheduleId);

        // Calculate pricing
        $pricePerPerson = $schedule->price_override ?? $schedule->product->price;
        $subtotal = $pricePerPerson * $participants;
        // Tax calculation would go here based on tenant settings
        $tax = 0;
        $total = $subtotal + $tax;

        return Inertia::render('public/book/checkout', [
            'schedule' => $schedule,
            'participants' => $participants,
            'pricing' => [
                'pricePerPerson' => $pricePerPerson,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
            ],
            'requiresWaiver' => $schedule->location?->require_waiver ?? $tenant->require_waiver ?? true,
            'requiresMedical' => $schedule->location?->require_medical_form ?? false,
        ]);
    }

    /**
     * Process checkout and create booking
     * Uses database transaction with pessimistic locking to prevent overbooking
     */
    public function processCheckout(Request $request): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'participant_count' => 'required|integer|min:1|max:50',
            // Primary guest
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            // Additional participants
            'participants' => 'nullable|array',
            'participants.*.name' => 'required|string|max:255',
            'participants.*.email' => 'nullable|email|max:255',
            'participants.*.certification_level' => 'nullable|string|max:100',
            // Options
            'special_requests' => 'nullable|string|max:1000',
            'marketing_consent' => 'boolean',
        ]);

        try {
            // Use database transaction with pessimistic locking to prevent race conditions
            $booking = \DB::transaction(function () use ($tenant, $validated) {
                // Lock the schedule row to prevent concurrent bookings from overbooking
                $schedule = Schedule::forTenant($tenant->id)
                    ->with(['product', 'location'])
                    ->lockForUpdate()
                    ->findOrFail($validated['schedule_id']);

                // Check availability with locked row - now safe from race conditions
                $bookedCount = $schedule->bookings()
                    ->whereNotIn('status', ['cancelled', 'no_show'])
                    ->sum('participant_count');

                $available = $schedule->max_participants - $bookedCount;

                if ($validated['participant_count'] > $available) {
                    throw new \Exception("Only {$available} spots available.");
                }

                // Verify schedule is still bookable
                if ($schedule->status !== 'active' || !$schedule->allow_online_booking) {
                    throw new \Exception('This schedule is no longer available for booking.');
                }

                // Verify booking date is not in the past
                if ($schedule->date < Carbon::today()) {
                    throw new \Exception('Cannot book a past date.');
                }

                // Find or create member
                $member = Member::forTenant($tenant->id)
                    ->where('email', $validated['email'])
                    ->first();

                if (!$member) {
                    $member = Member::create([
                        'tenant_id' => $tenant->id,
                        'first_name' => $validated['first_name'],
                        'last_name' => $validated['last_name'],
                        'email' => $validated['email'],
                        'phone' => $validated['phone'] ?? null,
                        'marketing_consent' => $validated['marketing_consent'] ?? false,
                        'status' => 'active',
                        'source' => 'website',
                    ]);
                }

                // Calculate pricing with tax
                $pricePerPerson = $schedule->price_override ?? $schedule->product->price;
                $subtotal = $pricePerPerson * $validated['participant_count'];

                // Calculate tax based on tenant settings
                $taxRate = $tenant->tax_rate ?? 0;
                $tax = round($subtotal * ($taxRate / 100), 2);
                $total = $subtotal + $tax;

                // Create booking with expiration for unpaid bookings (30 min to complete payment)
                $booking = Booking::create([
                    'tenant_id' => $tenant->id,
                    'location_id' => $schedule->location_id,
                    'member_id' => $member->id,
                    'product_id' => $schedule->product_id,
                    'schedule_id' => $schedule->id,
                    'booking_number' => Booking::generateBookingNumber(),
                    'booking_date' => $schedule->date,
                    'booking_time' => $schedule->start_time,
                    'participant_count' => $validated['participant_count'],
                    'subtotal' => $subtotal,
                    'discount_amount' => 0,
                    'tax_amount' => $tax,
                    'total_amount' => $total,
                    'currency' => $tenant->currency ?? 'USD',
                    'amount_paid' => 0,
                    'balance_due' => $total,
                    'payment_due_date' => now()->addMinutes(30), // Booking expires if unpaid
                    'special_requests' => $validated['special_requests'] ?? null,
                    'source' => 'website',
                    'status' => 'pending',
                    'payment_status' => 'unpaid',
                ]);

                // Create primary participant
                BookingParticipant::create([
                    'booking_id' => $booking->id,
                    'member_id' => $member->id,
                    'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? null,
                    'is_primary' => true,
                ]);

                // Create additional participants
                if (isset($validated['participants'])) {
                    foreach ($validated['participants'] as $participant) {
                        BookingParticipant::create([
                            'booking_id' => $booking->id,
                            'name' => $participant['name'],
                            'email' => $participant['email'] ?? null,
                            'certification_level' => $participant['certification_level'] ?? null,
                            'is_primary' => false,
                        ]);
                    }
                }

                return $booking;
            });

            // TODO: Integrate with Stripe for payment
            // For now, redirect to confirmation

            return redirect()
                ->route('public.book.confirmation', $booking)
                ->with('success', 'Booking created successfully! Please complete payment within 30 minutes.');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['booking' => $e->getMessage()]);
        }
    }

    /**
     * Booking confirmation page
     */
    public function confirmation(Booking $booking): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($booking->tenant_id !== $tenant->id) {
            abort(404);
        }

        $booking->load(['member', 'product', 'schedule.instructor', 'schedule.diveSite', 'location', 'participants']);

        return Inertia::render('public/book/confirmation', [
            'booking' => $booking,
        ]);
    }

    /**
     * Customer portal - view bookings
     */
    public function portal(Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        // For now, require email lookup
        // In production, this would use magic links or customer accounts
        $email = $request->get('email');

        if (!$email) {
            return Inertia::render('public/portal/lookup');
        }

        $member = Member::forTenant($tenant->id)
            ->where('email', $email)
            ->first();

        if (!$member) {
            return Inertia::render('public/portal/lookup', [
                'error' => 'No bookings found for this email address.',
            ]);
        }

        $bookings = Booking::forTenant($tenant->id)
            ->where('member_id', $member->id)
            ->with(['product', 'schedule', 'location'])
            ->orderBy('booking_date', 'desc')
            ->get();

        return Inertia::render('public/portal/index', [
            'member' => $member,
            'bookings' => $bookings,
        ]);
    }

    /**
     * View booking details in portal
     */
    public function viewBooking(Booking $booking, Request $request): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($booking->tenant_id !== $tenant->id) {
            abort(404);
        }

        // Verify access (via token or email)
        // In production, use secure tokens

        $booking->load([
            'member',
            'product',
            'schedule.instructor',
            'schedule.diveSite',
            'schedule.boat',
            'location',
            'participants',
            'payments',
        ]);

        return Inertia::render('public/portal/booking', [
            'booking' => $booking,
        ]);
    }

    /**
     * Sign waiver
     */
    public function signWaiver(Request $request, Booking $booking): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($booking->tenant_id !== $tenant->id) {
            abort(404);
        }

        $validated = $request->validate([
            'signature' => 'required|string', // Base64 encoded signature
            'agreed' => 'required|accepted',
        ]);

        $booking->update([
            'waiver_signed' => true,
            'waiver_signed_at' => now(),
            'waiver_signature_data' => $validated['signature'],
            'waiver_signature_ip' => $request->ip(),
        ]);

        return back()->with('success', 'Waiver signed successfully.');
    }

    /**
     * Submit medical form
     */
    public function submitMedical(Request $request, Booking $booking): RedirectResponse
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($booking->tenant_id !== $tenant->id) {
            abort(404);
        }

        $validated = $request->validate([
            'medical_answers' => 'required|array',
            'confirmed' => 'required|accepted',
        ]);

        $booking->update([
            'medical_form_completed' => true,
            'medical_form_data' => $validated['medical_answers'],
            'medical_form_submitted_at' => now(),
        ]);

        return back()->with('success', 'Medical form submitted successfully.');
    }
}
