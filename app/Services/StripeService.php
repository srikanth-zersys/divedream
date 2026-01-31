<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;
use Stripe\Customer;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe Checkout Session for a booking
     */
    public function createCheckoutSession(Booking $booking, string $successUrl, string $cancelUrl): ?Session
    {
        try {
            $tenant = $booking->tenant;
            $member = $booking->member;

            // Get or create Stripe customer
            $customerId = $this->getOrCreateCustomer($member, $tenant);

            // Build line items
            $lineItems = [
                [
                    'price_data' => [
                        'currency' => strtolower($tenant->currency ?? 'usd'),
                        'product_data' => [
                            'name' => $booking->product->name,
                            'description' => $booking->schedule
                                ? "Date: " . $booking->schedule->date->format('M d, Y') . " at " . $booking->schedule->start_time
                                : "Booking #" . $booking->booking_number,
                            'metadata' => [
                                'booking_id' => $booking->id,
                                'product_id' => $booking->product_id,
                            ],
                        ],
                        'unit_amount' => (int) (($booking->total_amount / $booking->participant_count) * 100),
                    ],
                    'quantity' => $booking->participant_count,
                ],
            ];

            // Create session
            $session = Session::create([
                'customer' => $customerId,
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => $successUrl . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $cancelUrl,
                'metadata' => [
                    'tenant_id' => $tenant->id,
                    'booking_id' => $booking->id,
                    'booking_number' => $booking->booking_number,
                ],
                'payment_intent_data' => [
                    'metadata' => [
                        'tenant_id' => $tenant->id,
                        'booking_id' => $booking->id,
                    ],
                ],
                'expires_at' => now()->addHours(24)->timestamp,
            ]);

            // Store session ID on booking
            $booking->update(['stripe_checkout_session_id' => $session->id]);

            return $session;
        } catch (ApiErrorException $e) {
            Log::error('Stripe checkout session creation failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Create a Payment Intent for custom payment flow
     */
    public function createPaymentIntent(Booking $booking, float $amount): ?PaymentIntent
    {
        try {
            $tenant = $booking->tenant;

            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($amount * 100),
                'currency' => strtolower($tenant->currency ?? 'usd'),
                'metadata' => [
                    'tenant_id' => $tenant->id,
                    'booking_id' => $booking->id,
                    'booking_number' => $booking->booking_number,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return $paymentIntent;
        } catch (ApiErrorException $e) {
            Log::error('Stripe payment intent creation failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get or create a Stripe customer
     */
    public function getOrCreateCustomer($member, Tenant $tenant): string
    {
        if ($member->stripe_customer_id) {
            return $member->stripe_customer_id;
        }

        try {
            $customer = Customer::create([
                'email' => $member->email,
                'name' => $member->first_name . ' ' . $member->last_name,
                'phone' => $member->phone,
                'metadata' => [
                    'tenant_id' => $tenant->id,
                    'member_id' => $member->id,
                ],
            ]);

            $member->update(['stripe_customer_id' => $customer->id]);

            return $customer->id;
        } catch (ApiErrorException $e) {
            Log::error('Stripe customer creation failed', [
                'member_id' => $member->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Retrieve checkout session
     */
    public function retrieveCheckoutSession(string $sessionId): ?Session
    {
        try {
            return Session::retrieve($sessionId);
        } catch (ApiErrorException $e) {
            Log::error('Failed to retrieve checkout session', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Process successful payment
     */
    public function processSuccessfulPayment(Booking $booking, Session $session): Payment
    {
        $paymentIntent = PaymentIntent::retrieve($session->payment_intent);

        $payment = Payment::create([
            'tenant_id' => $booking->tenant_id,
            'location_id' => $booking->location_id,
            'booking_id' => $booking->id,
            'amount' => $paymentIntent->amount_received / 100,
            'currency' => strtoupper($paymentIntent->currency),
            'method' => 'online',
            'status' => 'completed',
            'stripe_payment_intent_id' => $paymentIntent->id,
            'stripe_charge_id' => $paymentIntent->latest_charge,
            'reference' => $session->id,
            'paid_at' => now(),
        ]);

        // Update booking payment status
        $booking->refresh();
        $totalPaid = $booking->payments()->where('status', 'completed')->sum('amount');

        $booking->update([
            'amount_paid' => $totalPaid,
            'payment_status' => $totalPaid >= $booking->total_amount ? 'fully_paid' : 'deposit_paid',
            'status' => $booking->status === 'pending' ? 'confirmed' : $booking->status,
        ]);

        return $payment;
    }

    /**
     * Process refund
     */
    public function processRefund(Payment $payment, ?float $amount = null): ?Refund
    {
        try {
            if (!$payment->stripe_payment_intent_id) {
                throw new \Exception('No Stripe payment intent found for this payment');
            }

            $refundData = [
                'payment_intent' => $payment->stripe_payment_intent_id,
            ];

            if ($amount) {
                $refundData['amount'] = (int) ($amount * 100);
            }

            $refund = Refund::create($refundData);

            // Update payment status
            $refundAmount = $refund->amount / 100;
            $isFullRefund = $refundAmount >= $payment->amount;

            $payment->update([
                'status' => $isFullRefund ? 'refunded' : 'partial_refund',
                'refunded_amount' => ($payment->refunded_amount ?? 0) + $refundAmount,
                'refund_reason' => $refund->reason,
            ]);

            // Update booking
            $booking = $payment->booking;
            $booking->refresh();
            $totalPaid = $booking->payments()->where('status', 'completed')->sum('amount');
            $totalRefunded = $booking->payments()->sum('refunded_amount');
            $netPaid = $totalPaid - $totalRefunded;

            // Determine payment status after refund
            $paymentStatus = 'pending';
            if ($netPaid <= 0) {
                $paymentStatus = 'fully_refunded';
            } elseif ($totalRefunded > 0) {
                $paymentStatus = 'partially_refunded';
            } elseif ($netPaid >= $booking->total_amount) {
                $paymentStatus = 'fully_paid';
            } elseif ($netPaid > 0) {
                $paymentStatus = 'deposit_paid';
            }

            $booking->update([
                'amount_paid' => $netPaid,
                'payment_status' => $paymentStatus,
            ]);

            return $refund;
        } catch (ApiErrorException $e) {
            Log::error('Stripe refund failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Handle webhook event
     */
    public function handleWebhook(string $payload, string $signature): array
    {
        try {
            $event = Webhook::constructEvent(
                $payload,
                $signature,
                config('services.stripe.webhook_secret')
            );

            switch ($event->type) {
                case 'checkout.session.completed':
                    return $this->handleCheckoutCompleted($event->data->object);

                case 'payment_intent.succeeded':
                    return $this->handlePaymentIntentSucceeded($event->data->object);

                case 'payment_intent.payment_failed':
                    return $this->handlePaymentFailed($event->data->object);

                case 'charge.refunded':
                    return $this->handleChargeRefunded($event->data->object);

                default:
                    return ['status' => 'ignored', 'type' => $event->type];
            }
        } catch (\Exception $e) {
            Log::error('Webhook handling failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    protected function handleCheckoutCompleted($session): array
    {
        $bookingId = $session->metadata->booking_id ?? null;

        if (!$bookingId) {
            return ['status' => 'error', 'message' => 'No booking ID in metadata'];
        }

        $booking = Booking::find($bookingId);

        if (!$booking) {
            return ['status' => 'error', 'message' => 'Booking not found'];
        }

        $this->processSuccessfulPayment($booking, $session);

        return ['status' => 'success', 'booking_id' => $bookingId];
    }

    protected function handlePaymentIntentSucceeded($paymentIntent): array
    {
        Log::info('Payment intent succeeded', ['id' => $paymentIntent->id]);
        return ['status' => 'logged'];
    }

    protected function handlePaymentFailed($paymentIntent): array
    {
        $bookingId = $paymentIntent->metadata->booking_id ?? null;

        if ($bookingId) {
            $booking = Booking::find($bookingId);
            if ($booking) {
                // Log failed payment attempt
                Payment::create([
                    'tenant_id' => $booking->tenant_id,
                    'location_id' => $booking->location_id,
                    'booking_id' => $booking->id,
                    'amount' => $paymentIntent->amount / 100,
                    'currency' => strtoupper($paymentIntent->currency),
                    'method' => 'online',
                    'status' => 'failed',
                    'stripe_payment_intent_id' => $paymentIntent->id,
                    'notes' => $paymentIntent->last_payment_error?->message,
                ]);
            }
        }

        return ['status' => 'logged', 'booking_id' => $bookingId];
    }

    protected function handleChargeRefunded($charge): array
    {
        Log::info('Charge refunded', ['id' => $charge->id]);
        return ['status' => 'logged'];
    }
}
