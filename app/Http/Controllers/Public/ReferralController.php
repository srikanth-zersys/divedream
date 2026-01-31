<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Referral;
use App\Models\ReferralSettings;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReferralController extends Controller
{
    public function __construct(
        protected ReferralService $referralService
    ) {}

    /**
     * Handle referral link click and redirect to booking
     */
    public function handleClick(Request $request, string $code): RedirectResponse
    {
        $referral = $this->referralService->processReferralClick($code);

        if (!$referral) {
            return redirect()->route('public.book.index')
                ->with('error', 'This referral link has expired or is invalid.');
        }

        // Store referral code in session for later use
        session(['referral_code' => $code]);

        // Redirect to booking page with referral context
        return redirect()->route('public.book.index', ['ref' => $code])
            ->with('success', "You've been referred! Your discount will be applied at checkout.");
    }

    /**
     * Get referral link for a customer/lead
     */
    public function getMyReferralLink(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lead_id' => 'nullable|exists:leads,id',
            'email' => 'nullable|email',
            'tenant_id' => 'required|exists:tenants,id',
        ]);

        // Find the lead
        $lead = null;
        if (!empty($validated['lead_id'])) {
            $lead = Lead::find($validated['lead_id']);
        } elseif (!empty($validated['email'])) {
            $lead = Lead::where('tenant_id', $validated['tenant_id'])
                ->where('email', strtolower($validated['email']))
                ->first();
        }

        if (!$lead) {
            return response()->json([
                'error' => 'Please sign up or provide your email to get a referral link.',
            ], 404);
        }

        $settings = ReferralSettings::getOrCreate($validated['tenant_id']);

        if (!$settings->is_enabled) {
            return response()->json([
                'error' => 'Referral program is not currently available.',
            ], 400);
        }

        // Get or create referral
        $referral = $this->referralService->getOrCreateReferral($lead);

        if (!$referral) {
            return response()->json([
                'error' => 'Unable to create referral link. You may have reached the maximum number of referrals.',
            ], 400);
        }

        return response()->json([
            'referral_code' => $referral->referral_code,
            'referral_url' => $referral->getUrl(),
            'share_message' => $referral->getShareMessage(),
            'referrer_reward' => $settings->getReferrerRewardText(),
            'referred_reward' => $settings->getReferredRewardText(),
            'expires_at' => $referral->expires_at?->toDateTimeString(),
        ]);
    }

    /**
     * Get referral statistics for a lead
     */
    public function getMyStats(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
        ]);

        $lead = Lead::findOrFail($validated['lead_id']);

        $stats = $this->referralService->getReferralStats($lead);
        $referral = Referral::where('referrer_id', $lead->id)
            ->active()
            ->first();

        return response()->json([
            'stats' => $stats,
            'current_referral' => $referral ? [
                'code' => $referral->referral_code,
                'url' => $referral->getUrl(),
                'clicks' => $referral->click_count,
                'status' => $referral->status,
                'expires_at' => $referral->expires_at?->toDateTimeString(),
            ] : null,
        ]);
    }

    /**
     * Check if a referral code is valid and get discount info
     */
    public function validateCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20',
            'booking_total' => 'nullable|numeric|min:0',
        ]);

        $discount = $this->referralService->calculateReferredDiscount(
            $validated['code'],
            $validated['booking_total'] ?? 0
        );

        if (!$discount) {
            return response()->json([
                'valid' => false,
                'message' => 'This referral code is invalid or has expired.',
            ]);
        }

        return response()->json([
            'valid' => true,
            'discount_type' => $discount['discount_type'],
            'discount_value' => $discount['discount_value'],
            'final_total' => $discount['final_total'],
            'message' => "Referral discount of \${$discount['discount_value']} applied!",
        ]);
    }

    /**
     * Show referral program info page
     */
    public function showProgram(Request $request): Response
    {
        $tenantId = $request->input('tenant_id', tenant('id'));

        $settings = ReferralSettings::getOrCreate($tenantId);

        if (!$settings->is_enabled) {
            abort(404, 'Referral program not available');
        }

        return Inertia::render('public/referral-program', [
            'settings' => [
                'referrer_reward' => $settings->getReferrerRewardText(),
                'referred_reward' => $settings->getReferredRewardText(),
                'min_booking_value' => $settings->min_booking_value,
                'terms' => $settings->terms_and_conditions,
            ],
        ]);
    }

    /**
     * API endpoint to get program settings (for embedding on external sites)
     */
    public function getProgramSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
        ]);

        $settings = ReferralSettings::getOrCreate($validated['tenant_id']);

        if (!$settings->is_enabled) {
            return response()->json([
                'enabled' => false,
            ]);
        }

        return response()->json([
            'enabled' => true,
            'referrer_reward_type' => $settings->referrer_reward_type,
            'referrer_reward_value' => $settings->referrer_reward_value,
            'referrer_reward_text' => $settings->getReferrerRewardText(),
            'referred_reward_type' => $settings->referred_reward_type,
            'referred_reward_value' => $settings->referred_reward_value,
            'referred_reward_text' => $settings->getReferredRewardText(),
            'min_booking_value' => $settings->min_booking_value,
            'share_message_template' => $settings->share_message,
        ]);
    }

    /**
     * Social share tracking
     */
    public function trackShare(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'referral_id' => 'required|exists:referrals,id',
            'platform' => 'required|in:facebook,twitter,whatsapp,email,copy',
        ]);

        $referral = Referral::findOrFail($validated['referral_id']);

        // Record share activity on referrer's lead
        $referral->referrer->recordActivity('referral_shared', [
            'referral_id' => $referral->id,
            'platform' => $validated['platform'],
        ]);

        return response()->json(['success' => true]);
    }
}
