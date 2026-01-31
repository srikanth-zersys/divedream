<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadScoringRule;
use App\Models\LeadSource;
use App\Models\Location;
use App\Models\NurtureSequence;
use App\Models\ReferralSettings;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class TenantRegistrationController extends Controller
{
    public function __construct(
        protected SubscriptionService $subscriptionService
    ) {}

    /**
     * Display step 1: Account creation
     */
    public function showStep1(): Response
    {
        return Inertia::render('auth/register/step1-account', [
            'plans' => SubscriptionPlan::active()->ordered()->get(),
        ]);
    }

    /**
     * Process step 1: Create account
     */
    public function processStep1(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:50',
        ]);

        // Store in session for step 2
        session(['registration' => [
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone' => $validated['phone'] ?? null,
        ]]);

        return redirect()->route('register.step2');
    }

    /**
     * Display step 2: Business details
     */
    public function showStep2(): Response
    {
        if (!session('registration')) {
            return redirect()->route('register.step1');
        }

        return Inertia::render('auth/register/step2-business');
    }

    /**
     * Process step 2: Business details
     */
    public function processStep2(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'business_type' => 'required|in:dive_shop,dive_center,dive_resort,dive_school,other',
            'country' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'timezone' => 'required|string|max:100',
            'currency' => 'required|string|size:3',
            'website' => 'nullable|url|max:255',
        ]);

        $registration = session('registration');
        $registration['business'] = $validated;
        session(['registration' => $registration]);

        return redirect()->route('register.step3');
    }

    /**
     * Display step 3: Plan selection
     */
    public function showStep3(): Response
    {
        if (!session('registration.business')) {
            return redirect()->route('register.step1');
        }

        return Inertia::render('auth/register/step3-plan', [
            'plans' => SubscriptionPlan::active()->ordered()->get()->map(fn($plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'monthly_price' => $plan->monthly_price,
                'yearly_price' => $plan->yearly_price,
                'yearly_savings' => $plan->getYearlySavings(),
                'yearly_savings_percent' => $plan->getYearlySavingsPercent(),
                'features' => $plan->features,
                'max_locations' => $plan->max_locations,
                'max_users' => $plan->max_users,
                'max_bookings_per_month' => $plan->max_bookings_per_month,
                'has_api_access' => $plan->has_api_access,
                'has_priority_support' => $plan->has_priority_support,
            ]),
        ]);
    }

    /**
     * Process step 3: Select plan and complete registration
     */
    public function processStep3(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
            'start_trial' => 'boolean',
        ]);

        $registration = session('registration');
        if (!$registration || !isset($registration['business'])) {
            return redirect()->route('register.step1');
        }

        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        try {
            DB::beginTransaction();

            // Create tenant
            $tenant = Tenant::create([
                'name' => $registration['business']['business_name'],
                'slug' => Str::slug($registration['business']['business_name']) . '-' . Str::random(5),
                'email' => $registration['email'],
                'phone' => $registration['phone'],
                'timezone' => $registration['business']['timezone'],
                'currency' => $registration['business']['currency'],
                'plan' => $plan->slug,
                'status' => 'active',
                'settings' => [
                    'business_type' => $registration['business']['business_type'],
                    'website' => $registration['business']['website'] ?? null,
                ],
            ]);

            // Create default location
            Location::create([
                'tenant_id' => $tenant->id,
                'name' => $registration['business']['business_name'],
                'country' => $registration['business']['country'],
                'city' => $registration['business']['city'],
                'timezone' => $registration['business']['timezone'],
                'currency' => $registration['business']['currency'],
                'is_active' => true,
            ]);

            // Create user
            $user = User::create([
                'tenant_id' => $tenant->id,
                'name' => $registration['first_name'] . ' ' . $registration['last_name'],
                'email' => $registration['email'],
                'password' => Hash::make($registration['password']),
            ]);

            // Assign owner role
            $user->assignRole('owner');

            // Start trial or subscription
            if ($validated['start_trial'] ?? true) {
                $this->subscriptionService->startTrial($tenant, $plan, 14);
            }

            // Initialize tenant defaults
            $this->initializeTenantDefaults($tenant);

            DB::commit();

            // Clear registration session
            session()->forget('registration');

            // Fire registered event
            event(new Registered($user));

            // Log in the user
            Auth::login($user);

            // Redirect to onboarding or dashboard
            return redirect()->route('register.complete');

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Show registration complete / onboarding
     */
    public function complete(): Response
    {
        $tenant = Auth::user()->tenant;
        $subscription = $tenant->activeSubscription();

        return Inertia::render('auth/register/complete', [
            'tenant' => $tenant,
            'subscription' => $subscription ? [
                'plan' => $subscription->plan->name,
                'status' => $subscription->status,
                'trial_days_remaining' => $subscription->trialDaysRemaining(),
            ] : null,
        ]);
    }

    /**
     * Initialize default data for a new tenant
     */
    protected function initializeTenantDefaults(Tenant $tenant): void
    {
        // Create default lead sources
        LeadSource::createDefaultsForTenant($tenant->id);

        // Create default lead scoring rules
        LeadScoringRule::createDefaultsForTenant($tenant->id);

        // Create default nurture sequences
        NurtureSequence::createDefaultsForTenant($tenant->id);

        // Create referral settings (disabled by default)
        ReferralSettings::create([
            'tenant_id' => $tenant->id,
            'is_enabled' => false,
        ]);
    }
}
