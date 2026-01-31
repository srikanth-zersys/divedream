<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\NotificationService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(
        protected SubscriptionService $subscriptionService,
        protected NotificationService $notificationService
    ) {}

    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\UnexpectedValueException $e) {
            Log::error('Stripe webhook: Invalid payload', ['error' => $e->getMessage()]);
            return response('Invalid payload', 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe webhook: Invalid signature', ['error' => $e->getMessage()]);
            return response('Invalid signature', 400);
        }

        Log::info('Stripe webhook received', ['type' => $event->type, 'id' => $event->id]);

        $method = 'handle' . str_replace('.', '', ucwords($event->type, '.'));

        if (method_exists($this, $method)) {
            return $this->$method($event->data->object);
        }

        // Handle subscription events via SubscriptionService
        if (str_starts_with($event->type, 'customer.subscription') || str_starts_with($event->type, 'invoice.')) {
            $this->subscriptionService->handleWebhook([
                'type' => $event->type,
                'data' => ['object' => $event->data->object->toArray()],
            ]);
        }

        return response('Webhook handled', 200);
    }

    /**
     * Handle payment_intent.succeeded
     */
    protected function handlePaymentIntentSucceeded($paymentIntent)
    {
        $bookingId = $paymentIntent->metadata->booking_id ?? null;

        if (!$bookingId) {
            Log::info('Payment intent succeeded but no booking_id in metadata');
            return response('No booking reference', 200);
        }

        $booking = Booking::find($bookingId);

        if (!$booking) {
            Log::warning('Payment intent succeeded but booking not found', ['booking_id' => $bookingId]);
            return response('Booking not found', 200);
        }

        // Idempotency check - prevent duplicate payment records
        $existingPayment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)
            ->where('status', 'succeeded')
            ->first();

        if ($existingPayment) {
            Log::info('Payment already recorded, skipping duplicate', [
                'payment_intent_id' => $paymentIntent->id,
                'payment_id' => $existingPayment->id,
            ]);
            return response('Payment already recorded', 200);
        }

        // Record the payment
        $payment = Payment::create([
            'tenant_id' => $booking->tenant_id,
            'booking_id' => $booking->id,
            'member_id' => $booking->member_id,
            'amount' => $paymentIntent->amount / 100,
            'currency' => strtoupper($paymentIntent->currency),
            'method' => 'card',
            'type' => 'payment',
            'status' => 'succeeded',
            'stripe_payment_intent_id' => $paymentIntent->id,
            'stripe_charge_id' => $paymentIntent->latest_charge,
            'stripe_metadata' => [
                'stripe_payment_method' => $paymentIntent->payment_method,
                'receipt_url' => $paymentIntent->charges?->data[0]?->receipt_url,
            ],
        ]);

        // Update booking with correct payment status enum values
        $amountPaid = $booking->amount_paid + $payment->amount;
        $balanceDue = max(0, $booking->total_amount - $amountPaid);

        // Determine payment status using correct enum values
        // Valid values: pending, deposit_paid, fully_paid, partially_refunded, fully_refunded, failed
        $paymentStatus = 'pending';
        if ($balanceDue <= 0) {
            $paymentStatus = 'fully_paid';
        } elseif ($amountPaid > 0) {
            // Any partial payment is recorded as deposit_paid
            $paymentStatus = 'deposit_paid';
        }

        $booking->update([
            'amount_paid' => $amountPaid,
            'balance_due' => $balanceDue,
            'payment_status' => $paymentStatus,
            'status' => $booking->status === 'pending' ? 'confirmed' : $booking->status,
            'confirmed_at' => $booking->confirmed_at ?? now(),
        ]);

        Log::info('Booking payment recorded', [
            'booking_id' => $booking->id,
            'payment_id' => $payment->id,
            'amount' => $payment->amount,
        ]);

        // Send confirmation email and payment receipt
        $this->notificationService->sendBookingConfirmation($booking);
        $this->notificationService->sendPaymentReceipt($payment);

        return response('Payment recorded', 200);
    }

    /**
     * Handle payment_intent.payment_failed
     */
    protected function handlePaymentIntentPaymentFailed($paymentIntent)
    {
        $bookingId = $paymentIntent->metadata->booking_id ?? null;

        if (!$bookingId) {
            return response('No booking reference', 200);
        }

        $booking = Booking::find($bookingId);

        if ($booking) {
            // Record failed payment attempt
            Payment::create([
                'tenant_id' => $booking->tenant_id,
                'booking_id' => $booking->id,
                'member_id' => $booking->member_id,
                'amount' => $paymentIntent->amount / 100,
                'currency' => strtoupper($paymentIntent->currency),
                'method' => 'card',
                'type' => 'payment',
                'status' => 'failed',
                'stripe_payment_intent_id' => $paymentIntent->id,
                'failure_reason' => $paymentIntent->last_payment_error?->message,
                'stripe_metadata' => [
                    'error_code' => $paymentIntent->last_payment_error?->code,
                    'error_type' => $paymentIntent->last_payment_error?->type,
                ],
            ]);

            Log::warning('Booking payment failed', [
                'booking_id' => $booking->id,
                'error' => $paymentIntent->last_payment_error?->message,
            ]);
        }

        return response('Payment failure recorded', 200);
    }

    /**
     * Handle charge.refunded
     */
    protected function handleChargeRefunded($charge)
    {
        $payment = Payment::where('stripe_charge_id', $charge->id)
            ->where('status', 'succeeded')
            ->first();

        if (!$payment) {
            Log::info('Refund received but no matching payment found', ['charge_id' => $charge->id]);
            return response('No matching payment', 200);
        }

        $refundAmount = $charge->amount_refunded / 100;

        // Get the latest refund ID for idempotency check
        $latestRefundId = $charge->refunds?->data[0]?->id;

        // Idempotency check - prevent duplicate refund records
        if ($latestRefundId) {
            $existingRefund = Payment::where('stripe_refund_id', $latestRefundId)->first();
            if ($existingRefund) {
                Log::info('Refund already recorded, skipping duplicate', [
                    'refund_id' => $latestRefundId,
                    'payment_id' => $existingRefund->id,
                ]);
                return response('Refund already recorded', 200);
            }
        }

        // Create refund record
        Payment::create([
            'tenant_id' => $payment->tenant_id,
            'booking_id' => $payment->booking_id,
            'member_id' => $payment->member_id,
            'amount' => $refundAmount,
            'currency' => $payment->currency,
            'method' => 'card',
            'type' => 'refund',
            'status' => 'succeeded',
            'stripe_charge_id' => $charge->id,
            'stripe_refund_id' => $latestRefundId,
            'original_payment_id' => $payment->id,
            'stripe_metadata' => [
                'refund_reason' => $charge->refunds?->data[0]?->reason,
            ],
        ]);

        // Update booking balance
        if ($payment->booking) {
            $booking = $payment->booking;
            $amountRefunded = $booking->amount_refunded + $refundAmount;
            $netPaid = $booking->amount_paid - $amountRefunded;
            $balanceDue = max(0, $booking->total_amount - $netPaid);

            // Determine payment status after refund
            // Valid values: pending, deposit_paid, fully_paid, partially_refunded, fully_refunded, failed
            $paymentStatus = 'pending';
            if ($netPaid <= 0) {
                $paymentStatus = 'fully_refunded';
            } elseif ($amountRefunded > 0) {
                $paymentStatus = 'partially_refunded';
            } elseif ($netPaid >= $booking->total_amount) {
                $paymentStatus = 'fully_paid';
            } elseif ($netPaid > 0) {
                $paymentStatus = 'deposit_paid';
            }

            $booking->update([
                'amount_refunded' => $amountRefunded,
                'balance_due' => $balanceDue,
                'payment_status' => $paymentStatus,
            ]);
        }

        Log::info('Refund recorded', [
            'payment_id' => $payment->id,
            'refund_amount' => $refundAmount,
        ]);

        return response('Refund recorded', 200);
    }

    /**
     * Handle checkout.session.completed (for Stripe Checkout)
     */
    protected function handleCheckoutSessionCompleted($session)
    {
        $bookingId = $session->metadata->booking_id ?? null;

        if (!$bookingId) {
            return response('No booking reference', 200);
        }

        $booking = Booking::find($bookingId);

        if ($booking && $session->payment_status === 'paid') {
            // Payment was successful via Stripe Checkout
            $booking->update([
                'amount_paid' => $booking->total_amount,
                'balance_due' => 0,
                'payment_status' => 'fully_paid',
                'status' => 'confirmed',
                'confirmed_at' => now(),
            ]);

            Log::info('Checkout session completed', ['booking_id' => $booking->id]);
        }

        return response('Checkout session handled', 200);
    }
}
