<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class PaymentController extends Controller
{
    protected StripeClient $stripe;

    public function __construct(
        protected TenantService $tenantService
    ) {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Create a payment intent for a booking
     */
    public function createPaymentIntent(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'nullable|numeric|min:0.50',
        ]);

        $booking = Booking::where('tenant_id', $tenant->id)
            ->findOrFail($validated['booking_id']);

        // Use specified amount or full balance
        $amount = $validated['amount'] ?? $booking->balance_due;

        if ($amount <= 0) {
            return response()->json([
                'error' => 'Invalid payment amount',
            ], 422);
        }

        try {
            // Get or create Stripe customer
            $customerId = $this->getOrCreateCustomer($booking, $tenant);

            // Create payment intent
            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => (int) ($amount * 100), // Convert to cents
                'currency' => strtolower($booking->currency ?? 'usd'),
                'customer' => $customerId,
                'metadata' => [
                    'booking_id' => $booking->id,
                    'booking_number' => $booking->booking_number,
                    'tenant_id' => $tenant->id,
                ],
                'description' => "Booking #{$booking->booking_number}",
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            // Update booking with payment intent ID
            $booking->update([
                'stripe_payment_intent_id' => $paymentIntent->id,
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create payment intent during checkout (before booking exists)
     */
    public function createCheckoutPaymentIntent(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.50',
            'currency' => 'nullable|string|size:3',
            'email' => 'required|email',
            'name' => 'required|string|max:255',
            'schedule_id' => 'required|exists:schedules,id',
            'participant_count' => 'required|integer|min:1',
        ]);

        try {
            // Create or find Stripe customer
            $customer = $this->stripe->customers->create([
                'email' => $validated['email'],
                'name' => $validated['name'],
                'metadata' => [
                    'tenant_id' => $tenant->id,
                ],
            ]);

            // Create payment intent
            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => (int) ($validated['amount'] * 100),
                'currency' => strtolower($validated['currency'] ?? $tenant->currency ?? 'usd'),
                'customer' => $customer->id,
                'metadata' => [
                    'tenant_id' => $tenant->id,
                    'schedule_id' => $validated['schedule_id'],
                    'participant_count' => $validated['participant_count'],
                    'checkout_session' => true,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'customer_id' => $customer->id,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to initialize payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get or create Stripe customer for booking
     */
    protected function getOrCreateCustomer(Booking $booking, $tenant): string
    {
        $member = $booking->member;

        if ($member->stripe_customer_id) {
            return $member->stripe_customer_id;
        }

        $customer = $this->stripe->customers->create([
            'email' => $member->email,
            'name' => $member->full_name,
            'phone' => $member->phone,
            'metadata' => [
                'member_id' => $member->id,
                'tenant_id' => $tenant->id,
            ],
        ]);

        $member->update(['stripe_customer_id' => $customer->id]);

        return $customer->id;
    }

    /**
     * Get Stripe publishable key for frontend
     */
    public function getPublishableKey()
    {
        return response()->json([
            'publishable_key' => config('services.stripe.key'),
        ]);
    }
}
