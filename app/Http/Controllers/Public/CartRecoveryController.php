<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AbandonedCart;
use App\Services\MarketingAutomationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartRecoveryController extends Controller
{
    public function __construct(
        protected MarketingAutomationService $automationService
    ) {}

    /**
     * Recover an abandoned cart - redirect to checkout with cart restored
     */
    public function recover(Request $request, string $token): Response|RedirectResponse
    {
        $cart = AbandonedCart::where('recovery_token', $token)
            ->with(['product', 'schedule', 'tenant'])
            ->first();

        if (!$cart) {
            return redirect()->route('public.book.index')
                ->with('error', 'This link has expired or is invalid.');
        }

        // Check if already recovered
        if ($cart->status === 'recovered') {
            return redirect()->route('public.book.index')
                ->with('info', 'This booking has already been completed.');
        }

        // Check if expired
        if ($cart->status === 'expired') {
            return redirect()->route('public.book.index')
                ->with('error', 'This cart has expired. Please start a new booking.');
        }

        // Check if schedule is still available
        if ($cart->schedule && $cart->schedule->date < now()->toDateString()) {
            $cart->markExpired();
            return redirect()->route('public.book.index')
                ->with('error', 'The date for this activity has passed. Please select a new date.');
        }

        // Store cart data in session and redirect to checkout
        session([
            'recovered_cart' => [
                'cart_id' => $cart->id,
                'product_id' => $cart->product_id,
                'schedule_id' => $cart->schedule_id,
                'participant_count' => $cart->participant_count,
                'cart_data' => $cart->cart_data,
                'discount_code' => $cart->isDiscountValid() ? $cart->discount_code : null,
                'discount_percent' => $cart->isDiscountValid() ? $cart->discount_percent : null,
            ],
        ]);

        // If we have a valid schedule, go directly to checkout
        if ($cart->schedule_id && $cart->product_id) {
            return redirect()->route('public.book.checkout', [
                'schedule' => $cart->schedule_id,
                'participants' => $cart->participant_count,
                'recovered' => $cart->recovery_token,
            ]);
        }

        // Otherwise go to product page
        if ($cart->product) {
            return redirect()->route('public.book.product', $cart->product->slug);
        }

        return redirect()->route('public.book.products');
    }

    /**
     * Track cart abandonment - called via AJAX from checkout page
     */
    public function track(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'step' => 'required|string|max:50',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'product_id' => 'nullable|exists:products,id',
            'schedule_id' => 'nullable|exists:schedules,id',
            'participant_count' => 'nullable|integer|min:1',
            'total' => 'nullable|numeric|min:0',
            'session_id' => 'nullable|string|max:100',
        ]);

        // Only track if we have an email or session
        if (empty($validated['email']) && empty($validated['session_id'])) {
            return response()->json(['tracked' => false]);
        }

        $validated['session_id'] = $validated['session_id'] ?? session()->getId();

        $cart = $this->automationService->trackAbandonedCart(
            $validated['tenant_id'],
            $validated,
            $validated['step']
        );

        return response()->json([
            'tracked' => true,
            'cart_id' => $cart->id,
        ]);
    }

    /**
     * Clear tracking when checkout is completed
     */
    public function complete(Request $request): \Illuminate\Http\JsonResponse
    {
        $email = $request->input('email');
        $bookingId = $request->input('booking_id');

        if ($email && $bookingId) {
            $booking = \App\Models\Booking::find($bookingId);
            if ($booking) {
                $this->automationService->markCartRecovered($email, $booking);
            }
        }

        // Clear recovered cart session
        session()->forget('recovered_cart');

        return response()->json(['success' => true]);
    }

    /**
     * Unsubscribe from cart recovery emails
     */
    public function unsubscribe(Request $request, string $token): Response
    {
        $cart = AbandonedCart::where('recovery_token', $token)->first();

        if ($cart) {
            $cart->markExpired();
        }

        return Inertia::render('public/unsubscribed', [
            'type' => 'cart_recovery',
            'message' => 'You have been unsubscribed from cart reminder emails.',
        ]);
    }
}
