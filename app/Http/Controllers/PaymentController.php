<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Services\StripeService;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaymentController extends Controller
{
    public function __construct(
        protected StripeService $stripeService,
        protected TenantService $tenantService
    ) {}

    /**
     * Create checkout session for booking
     */
    public function createCheckoutSession(Request $request, Booking $booking)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($booking->tenant_id !== $tenant->id) {
            abort(404);
        }

        if ($booking->payment_status === 'paid') {
            return response()->json([
                'error' => 'This booking is already paid',
            ], 400);
        }

        $successUrl = route('public.book.confirmation', $booking);
        $cancelUrl = route('portal.booking', $booking);

        $session = $this->stripeService->createCheckoutSession(
            $booking,
            $successUrl,
            $cancelUrl
        );

        if (!$session) {
            return response()->json([
                'error' => 'Failed to create checkout session',
            ], 500);
        }

        return response()->json([
            'checkout_url' => $session->url,
            'session_id' => $session->id,
        ]);
    }

    /**
     * Handle successful payment return
     */
    public function success(Request $request, Booking $booking)
    {
        $sessionId = $request->get('session_id');

        if ($sessionId) {
            $session = $this->stripeService->retrieveCheckoutSession($sessionId);

            if ($session && $session->payment_status === 'paid') {
                // Process payment if not already done via webhook
                if ($booking->payment_status !== 'paid') {
                    $this->stripeService->processSuccessfulPayment($booking, $session);
                }
            }
        }

        return redirect()->route('public.book.confirmation', $booking)
            ->with('success', 'Payment successful! Your booking is confirmed.');
    }

    /**
     * Record manual payment (admin)
     */
    public function recordPayment(Request $request, Booking $booking)
    {
        $this->authorize('update', $booking);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|in:cash,card,bank_transfer,other',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $payment = Payment::create([
            'tenant_id' => $booking->tenant_id,
            'location_id' => $booking->location_id,
            'booking_id' => $booking->id,
            'amount' => $validated['amount'],
            'currency' => $booking->tenant->currency ?? 'USD',
            'method' => $validated['method'],
            'status' => 'completed',
            'reference' => $validated['reference'],
            'notes' => $validated['notes'],
            'paid_at' => now(),
            'recorded_by' => auth()->id(),
        ]);

        // Update booking payment status
        $totalPaid = $booking->payments()->where('status', 'completed')->sum('amount');

        $booking->update([
            'amount_paid' => $totalPaid,
            'payment_status' => $totalPaid >= $booking->total_amount ? 'paid' : 'partial',
            'status' => $booking->status === 'pending' ? 'confirmed' : $booking->status,
        ]);

        return back()->with('success', 'Payment recorded successfully.');
    }

    /**
     * Process refund
     */
    public function refund(Request $request, Payment $payment)
    {
        $this->authorize('update', $payment->booking);

        $validated = $request->validate([
            'amount' => 'nullable|numeric|min:0.01|max:' . $payment->amount,
            'reason' => 'nullable|string|max:500',
        ]);

        $amount = $validated['amount'] ?? null;

        if ($payment->stripe_payment_intent_id) {
            // Process Stripe refund
            $refund = $this->stripeService->processRefund($payment, $amount);

            if (!$refund) {
                return back()->with('error', 'Failed to process refund.');
            }
        } else {
            // Manual refund
            $refundAmount = $amount ?? $payment->amount;

            $payment->update([
                'status' => $refundAmount >= $payment->amount ? 'refunded' : 'partial_refund',
                'refunded_amount' => ($payment->refunded_amount ?? 0) + $refundAmount,
                'refund_reason' => $validated['reason'],
            ]);

            // Update booking
            $booking = $payment->booking;
            $booking->refresh();
            $totalPaid = $booking->payments()->where('status', 'completed')->sum('amount');
            $totalRefunded = $booking->payments()->sum('refunded_amount');
            $netPaid = $totalPaid - $totalRefunded;

            $booking->update([
                'amount_paid' => $netPaid,
                'payment_status' => $netPaid <= 0 ? 'refunded' : ($netPaid < $booking->total_amount ? 'partial' : 'paid'),
            ]);
        }

        return back()->with('success', 'Refund processed successfully.');
    }

    /**
     * Handle Stripe webhook
     */
    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        try {
            $result = $this->stripeService->handleWebhook($payload, $signature);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
