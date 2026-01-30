<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingViewController extends Controller
{
    /**
     * Display the public booking page (magic link access)
     */
    public function show(Request $request, string $token): Response|RedirectResponse
    {
        $booking = Booking::where('access_token', $token)
            ->with([
                'product',
                'schedule',
                'location',
                'participants',
                'bookingPayments' => fn($q) => $q->completed(),
                'assignedInstructor.user',
            ])
            ->first();

        if (!$booking) {
            abort(404, 'Booking not found');
        }

        return Inertia::render('public/booking/view', [
            'booking' => [
                'id' => $booking->id,
                'booking_number' => $booking->booking_number,
                'customer_name' => $booking->customer_name,
                'customer_email' => $booking->customer_email,
                'customer_phone' => $booking->customer_phone,
                'status' => $booking->status,
                'booking_date' => $booking->booking_date?->format('Y-m-d'),
                'booking_time' => $booking->booking_time,
                'participant_count' => $booking->participant_count,
                'subtotal' => $booking->subtotal,
                'discount_amount' => $booking->discount_amount,
                'tax_amount' => $booking->tax_amount,
                'total_amount' => $booking->total_amount,
                'amount_paid' => $booking->amount_paid,
                'balance_due' => $booking->balance_due,
                'payment_status' => $booking->payment_status,
                'currency' => $booking->currency,
                'waiver_completed' => $booking->waiver_completed,
                'waiver_completed_at' => $booking->waiver_completed_at,
                'customer_notes' => $booking->customer_notes,
                'confirmed_at' => $booking->confirmed_at,
                'product' => $booking->product ? [
                    'name' => $booking->product->name,
                    'description' => $booking->product->description,
                    'duration_minutes' => $booking->product->duration_minutes,
                    'image_url' => $booking->product->image_url,
                ] : null,
                'schedule' => $booking->schedule ? [
                    'date' => $booking->schedule->date,
                    'start_time' => $booking->schedule->start_time,
                    'end_time' => $booking->schedule->end_time,
                    'notes' => $booking->schedule->notes,
                ] : null,
                'location' => $booking->location ? [
                    'name' => $booking->location->name,
                    'address' => $booking->location->full_address,
                    'phone' => $booking->location->phone,
                    'email' => $booking->location->email,
                ] : null,
                'instructor' => $booking->assignedInstructor ? [
                    'name' => $booking->assignedInstructor->user?->name ?? $booking->assignedInstructor->full_name,
                ] : null,
                'participants' => $booking->participants->map(fn($p) => [
                    'id' => $p->id,
                    'first_name' => $p->first_name,
                    'last_name' => $p->last_name,
                    'waiver_signed' => $p->waiver_signed,
                    'waiver_signed_at' => $p->waiver_signed_at,
                ]),
                'payments' => $booking->bookingPayments->map(fn($p) => [
                    'amount' => $p->amount,
                    'type' => $p->type,
                    'method' => $p->method,
                    'paid_at' => $p->paid_at,
                ]),
            ],
            'tenant' => $booking->tenant->only(['name', 'logo_url', 'phone', 'email', 'website']),
            'canCancel' => $booking->canBeCancelled(),
            'needsPayment' => $booking->needsPayment(),
        ]);
    }

    /**
     * Cancel booking
     */
    public function cancel(Request $request, string $token): RedirectResponse
    {
        $booking = Booking::where('access_token', $token)->firstOrFail();

        if (!$booking->canBeCancelled()) {
            return back()->with('error', 'This booking cannot be cancelled.');
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $booking->cancel(null, $validated['reason'] ?? 'Cancelled by customer');

        return back()->with('success', 'Your booking has been cancelled. We will process any applicable refunds within 5-7 business days.');
    }

    /**
     * Pay balance for booking
     */
    public function payBalance(Request $request, string $token): RedirectResponse
    {
        $booking = Booking::where('access_token', $token)
            ->with(['member', 'tenant', 'product'])
            ->firstOrFail();

        if (!$booking->needsPayment()) {
            return back()->with('info', 'This booking is already fully paid.');
        }

        // Check if Stripe is configured
        if (!config('services.stripe.secret')) {
            return back()->with('info', 'Online payments are not currently available. Please contact us to complete payment.');
        }

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            $tenant = $booking->tenant;
            $member = $booking->member;

            // Get or create Stripe customer
            $customerId = $member->stripe_customer_id;

            if (!$customerId) {
                $customer = $stripe->customers->create([
                    'email' => $member->email,
                    'name' => $member->full_name,
                    'phone' => $member->phone,
                    'metadata' => [
                        'member_id' => $member->id,
                        'tenant_id' => $tenant->id,
                    ],
                ]);
                $member->update(['stripe_customer_id' => $customer->id]);
                $customerId = $customer->id;
            }

            // Create Stripe Checkout Session for the remaining balance
            $session = $stripe->checkout->sessions->create([
                'customer' => $customerId,
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => strtolower($booking->currency ?? 'usd'),
                        'product_data' => [
                            'name' => "Balance Payment - Booking #{$booking->booking_number}",
                            'description' => $booking->product?->name ?? 'Dive booking',
                        ],
                        'unit_amount' => (int) ($booking->balance_due * 100),
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => url("/booking/{$token}") . '?payment=success',
                'cancel_url' => url("/booking/{$token}") . '?payment=cancelled',
                'metadata' => [
                    'booking_id' => $booking->id,
                    'booking_number' => $booking->booking_number,
                    'tenant_id' => $tenant->id,
                ],
            ]);

            return redirect()->away($session->url);

        } catch (\Exception $e) {
            \Log::error('Stripe payment error', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Unable to process payment at this time. Please try again or contact us directly.');
        }
    }

    /**
     * Add note to booking
     */
    public function addNote(Request $request, string $token): RedirectResponse
    {
        $booking = Booking::where('access_token', $token)->firstOrFail();

        $validated = $request->validate([
            'note' => 'required|string|max:1000',
        ]);

        $existingNotes = $booking->customer_notes ?? '';
        $newNote = "\n[" . now()->format('M d, Y H:i') . "] " . $validated['note'];

        $booking->update([
            'customer_notes' => trim($existingNotes . $newNote),
        ]);

        return back()->with('success', 'Note added successfully.');
    }

    /**
     * Show booking lookup page
     */
    public function showLookup(Request $request): Response
    {
        // Get tenant from subdomain or default
        $tenant = app(\App\Services\TenantService::class)->getCurrentTenant();

        if (!$tenant) {
            abort(404, 'Shop not found');
        }

        return Inertia::render('public/booking/lookup', [
            'tenant' => $tenant->only(['name', 'logo_url']),
        ]);
    }

    /**
     * Process booking lookup and send magic links
     */
    public function processLookup(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'booking_number' => 'nullable|string',
        ]);

        $tenant = app(\App\Services\TenantService::class)->getCurrentTenant();

        if (!$tenant) {
            return back()->with('error', 'Shop not found.');
        }

        // Find bookings for this email
        $query = Booking::where('tenant_id', $tenant->id)
            ->where('customer_email', $validated['email'])
            ->whereIn('status', ['pending', 'confirmed', 'checked_in']);

        // If booking number provided, filter by it
        if (!empty($validated['booking_number'])) {
            $query->where('booking_number', $validated['booking_number']);
        }

        $bookings = $query->with(['product', 'schedule'])->get();

        if ($bookings->isEmpty()) {
            return back()->with('error', 'No bookings found for this email address.');
        }

        // Send magic links email
        \Mail::to($validated['email'])->queue(
            new \App\Mail\BookingAccessLinks($bookings, $tenant)
        );

        return back()->with('success', 'We\'ve sent booking access links to your email.');
    }
}
