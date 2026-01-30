<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Services\TenantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    /**
     * Record a payment for a booking
     */
    public function store(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorize('update', $booking);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01|max:' . $booking->balance_due,
            'type' => 'required|in:deposit,partial,full,balance',
            'method' => 'required|in:cash,card,bank_transfer,online,other',
            'notes' => 'nullable|string|max:500',
        ]);

        // If paying full or balance, ensure amount matches
        if ($validated['type'] === 'full') {
            $validated['amount'] = $booking->total_amount;
        } elseif ($validated['type'] === 'balance') {
            $validated['amount'] = $booking->balance_due;
        }

        $payment = $booking->recordPayment(
            $validated['amount'],
            $validated['type'],
            $validated['method'],
            auth()->id(),
            $validated['notes'] ?? null
        );

        // If deposit or more is paid, confirm the booking
        if ($booking->payment_status !== 'pending' && $booking->status === 'pending') {
            $booking->confirm();
        }

        return back()->with('success', "Payment of \${$validated['amount']} recorded successfully.");
    }

    /**
     * Record deposit for booking
     */
    public function recordDeposit(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorize('update', $booking);

        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|in:cash,card,bank_transfer,online,other',
            'notes' => 'nullable|string|max:500',
        ]);

        $booking->recordDeposit(
            $validated['amount'],
            $validated['method'],
            auth()->id()
        );

        // Confirm booking after deposit
        if ($booking->status === 'pending') {
            $booking->confirm();
        }

        return back()->with('success', "Deposit of \${$validated['amount']} recorded. Booking confirmed.");
    }

    /**
     * Process refund
     */
    public function refund(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorize('update', $booking);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01|max:' . $booking->amount_paid,
            'reason' => 'required|string|max:500',
            'method' => 'required|in:cash,card,bank_transfer,online,other',
        ]);

        $booking->bookingPayments()->create([
            'tenant_id' => $booking->tenant_id,
            'amount' => $validated['amount'],
            'currency' => $booking->currency ?? 'USD',
            'type' => 'refund',
            'method' => $validated['method'],
            'status' => 'completed',
            'received_by' => auth()->id(),
            'notes' => "Refund: " . $validated['reason'],
            'paid_at' => now(),
        ]);

        $booking->recalculatePayments();

        return back()->with('success', "Refund of \${$validated['amount']} processed.");
    }

    /**
     * Get payment history for a booking
     */
    public function history(Booking $booking): Response
    {
        $this->authorize('view', $booking);

        $payments = $booking->bookingPayments()
            ->with('receivedByUser')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/bookings/payments', [
            'booking' => $booking->load(['member', 'product']),
            'payments' => $payments,
        ]);
    }

    /**
     * Quick payment form (for adding discount and recording payment)
     */
    public function quickPay(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorize('update', $booking);

        $validated = $request->validate([
            'apply_online_discount' => 'boolean',
            'online_discount_percent' => 'nullable|numeric|min:0|max:100',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|in:cash,card,bank_transfer,online,other',
        ]);

        // Apply per-booking online discount if enabled
        if ($validated['apply_online_discount'] ?? false) {
            $discountPercent = $validated['online_discount_percent'] ?? 0;
            $discountAmount = round($booking->subtotal * ($discountPercent / 100), 2);

            $booking->update([
                'online_discount_enabled' => true,
                'online_discount_percent' => $discountPercent,
                'online_discount_amount' => $discountAmount,
                'discount_amount' => $booking->discount_amount + $discountAmount,
                'total_amount' => $booking->total_amount - $discountAmount,
                'balance_due' => $booking->balance_due - $discountAmount,
            ]);
        }

        // Record the payment
        $booking->recordPayment(
            $validated['amount'],
            $validated['amount'] >= $booking->balance_due ? 'full' : 'partial',
            $validated['method'],
            auth()->id()
        );

        // Confirm if pending
        if ($booking->status === 'pending') {
            $booking->confirm();
        }

        return back()->with('success', 'Payment recorded successfully.');
    }
}
