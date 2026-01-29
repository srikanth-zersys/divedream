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
            'canSignWaiver' => !$booking->waiver_completed && in_array($booking->status, ['pending', 'confirmed']),
            'needsPayment' => $booking->needsPayment(),
        ]);
    }

    /**
     * Sign waiver for a booking
     */
    public function signWaiver(Request $request, string $token): RedirectResponse
    {
        $booking = Booking::where('access_token', $token)->firstOrFail();

        if ($booking->waiver_completed) {
            return back()->with('info', 'Waiver has already been signed.');
        }

        $validated = $request->validate([
            'signature' => 'required|string',
            'agreed' => 'required|accepted',
            'participant_id' => 'nullable|integer',
        ]);

        // If a specific participant
        if ($validated['participant_id']) {
            $participant = $booking->participants()->find($validated['participant_id']);
            if ($participant) {
                $participant->update([
                    'waiver_signed' => true,
                    'waiver_signed_at' => now(),
                    'waiver_signature' => $validated['signature'],
                ]);
            }

            // Check if all participants have signed
            $allSigned = $booking->participants()->where('waiver_signed', false)->count() === 0;
            if ($allSigned) {
                $booking->update([
                    'waiver_completed' => true,
                    'waiver_completed_at' => now(),
                ]);
            }
        } else {
            // Sign for the whole booking
            $booking->update([
                'waiver_completed' => true,
                'waiver_completed_at' => now(),
            ]);
        }

        return back()->with('success', 'Waiver signed successfully. Thank you!');
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
        $booking = Booking::where('access_token', $token)->firstOrFail();

        if (!$booking->needsPayment()) {
            return back()->with('info', 'This booking is already fully paid.');
        }

        // Redirect to Stripe checkout for remaining balance
        // For now, just return a message
        return back()->with('info', 'Online payment for balance coming soon. Please contact us to complete payment.');
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
}
