<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use DateTimeZone;

class SettingsController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    public function index()
    {
        return Inertia::render('admin/settings/index');
    }

    public function general()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        return Inertia::render('admin/settings/general', [
            'tenant' => $tenant,
            'location' => $location,
            'timezones' => DateTimeZone::listIdentifiers(),
            'currencies' => $this->getCurrencies(),
        ]);
    }

    public function updateGeneral(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $location = $this->tenantService->getCurrentLocation();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'legal_name' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'default_currency' => 'required|string|max:3',
            'default_timezone' => 'required|string',
            'location_name' => 'required|string|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:2',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
        ]);

        $tenant->update([
            'name' => $validated['name'],
            'legal_name' => $validated['legal_name'],
            'tax_id' => $validated['tax_id'],
            'default_currency' => $validated['default_currency'],
            'default_timezone' => $validated['default_timezone'],
        ]);

        $location->update([
            'name' => $validated['location_name'],
            'address_line_1' => $validated['address_line_1'],
            'address_line_2' => $validated['address_line_2'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'postal_code' => $validated['postal_code'],
            'country' => $validated['country'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'website' => $validated['website'],
        ]);

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }

    public function booking()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $settings = $tenant->settings ?? [];

        return Inertia::render('admin/settings/booking', [
            'settings' => array_merge([
                'booking_lead_time_hours' => 24,
                'max_advance_booking_days' => 90,
                'cancellation_policy' => 'standard',
                'cancellation_hours' => 48,
                'refund_percentage' => 100,
                'require_deposit' => false,
                'deposit_type' => 'percentage',
                'deposit_percentage' => 25,
                'deposit_amount' => 50,
                'require_waiver' => true,
                'waiver_reminder_hours' => 24,
                'auto_confirm_bookings' => false,
                'overbooking_allowed' => false,
                'waitlist_enabled' => true,
                'min_participants' => 1,
                'default_participant_limit' => 10,
            ], $settings['booking'] ?? []),
        ]);
    }

    public function updateBooking(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'booking_lead_time_hours' => 'required|integer|min:0',
            'max_advance_booking_days' => 'required|integer|min:1',
            'cancellation_policy' => 'required|string|in:flexible,standard,strict,custom',
            'cancellation_hours' => 'required|integer|min:0',
            'refund_percentage' => 'required|integer|min:0|max:100',
            'require_deposit' => 'required|boolean',
            'deposit_type' => 'required|string|in:percentage,fixed',
            'deposit_percentage' => 'required|integer|min:0|max:100',
            'deposit_amount' => 'required|numeric|min:0',
            'require_waiver' => 'required|boolean',
            'waiver_reminder_hours' => 'required|integer|min:0',
            'auto_confirm_bookings' => 'required|boolean',
            'overbooking_allowed' => 'required|boolean',
            'waitlist_enabled' => 'required|boolean',
            'min_participants' => 'required|integer|min:1',
            'default_participant_limit' => 'required|integer|min:1',
        ]);

        $settings = $tenant->settings ?? [];
        $settings['booking'] = $validated;
        $tenant->update(['settings' => $settings]);

        return redirect()->back()->with('success', 'Booking rules updated successfully.');
    }

    public function branding()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $settings = $tenant->settings ?? [];

        return Inertia::render('admin/settings/branding', [
            'settings' => array_merge([
                'logo_url' => null,
                'favicon_url' => null,
                'primary_color' => '#2563eb',
                'secondary_color' => '#1e40af',
                'accent_color' => '#f59e0b',
                'header_text' => '',
                'footer_text' => '',
                'custom_css' => '',
            ], $settings['branding'] ?? []),
            'tenant' => $tenant,
        ]);
    }

    public function updateBranding(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'logo_url' => 'nullable|url|max:255',
            'favicon_url' => 'nullable|url|max:255',
            'primary_color' => 'required|string|max:7',
            'secondary_color' => 'required|string|max:7',
            'accent_color' => 'required|string|max:7',
            'header_text' => 'nullable|string|max:500',
            'footer_text' => 'nullable|string|max:500',
            'custom_css' => 'nullable|string|max:5000',
        ]);

        $settings = $tenant->settings ?? [];
        $settings['branding'] = $validated;
        $tenant->update(['settings' => $settings]);

        return redirect()->back()->with('success', 'Branding updated successfully.');
    }

    public function notifications()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $settings = $tenant->settings ?? [];

        return Inertia::render('admin/settings/notifications', [
            'settings' => array_merge([
                'send_booking_confirmation' => true,
                'send_booking_reminder' => true,
                'reminder_days_before' => [1, 3],
                'send_payment_receipt' => true,
                'send_cancellation_notice' => true,
                'send_waitlist_notification' => true,
                'admin_new_booking_notification' => true,
                'admin_cancellation_notification' => true,
                'admin_email' => '',
                'bcc_email' => '',
            ], $settings['notifications'] ?? []),
        ]);
    }

    public function updateNotifications(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'send_booking_confirmation' => 'required|boolean',
            'send_booking_reminder' => 'required|boolean',
            'reminder_days_before' => 'required|array',
            'reminder_days_before.*' => 'integer|min:1',
            'send_payment_receipt' => 'required|boolean',
            'send_cancellation_notice' => 'required|boolean',
            'send_waitlist_notification' => 'required|boolean',
            'admin_new_booking_notification' => 'required|boolean',
            'admin_cancellation_notification' => 'required|boolean',
            'admin_email' => 'nullable|email|max:255',
            'bcc_email' => 'nullable|email|max:255',
        ]);

        $settings = $tenant->settings ?? [];
        $settings['notifications'] = $validated;
        $tenant->update(['settings' => $settings]);

        return redirect()->back()->with('success', 'Notification settings updated successfully.');
    }

    public function payments()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $settings = $tenant->settings ?? [];

        return Inertia::render('admin/settings/payments', [
            'settings' => array_merge([
                'stripe_enabled' => false,
                'stripe_public_key' => '',
                'stripe_webhook_configured' => false,
                'tax_rate' => 0,
                'tax_included' => false,
                'invoice_prefix' => 'INV-',
                'invoice_notes' => '',
            ], $settings['payments'] ?? []),
            'stripeConnected' => !empty($tenant->stripe_account_id),
        ]);
    }

    public function updatePayments(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'stripe_enabled' => 'required|boolean',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'tax_included' => 'required|boolean',
            'invoice_prefix' => 'required|string|max:10',
            'invoice_notes' => 'nullable|string|max:1000',
        ]);

        $settings = $tenant->settings ?? [];
        $settings['payments'] = array_merge($settings['payments'] ?? [], $validated);
        $tenant->update(['settings' => $settings]);

        return redirect()->back()->with('success', 'Payment settings updated successfully.');
    }

    public function integrations()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $settings = $tenant->settings ?? [];

        return Inertia::render('admin/settings/integrations', [
            'integrations' => array_merge([
                'google_calendar_enabled' => false,
                'mailchimp_enabled' => false,
                'quickbooks_enabled' => false,
                'zapier_enabled' => false,
            ], $settings['integrations'] ?? []),
        ]);
    }

    public function billing()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $subscription = $tenant->activeSubscription();
        $plan = $subscription?->plan;

        // Get available plans
        $plans = \App\Models\SubscriptionPlan::active()->ordered()->get();

        // Get invoices
        $invoices = $subscription
            ? \App\Models\SubscriptionInvoice::where('tenant_id', $tenant->id)
                ->orderBy('created_at', 'desc')
                ->limit(12)
                ->get()
            : collect();

        return Inertia::render('admin/settings/billing', [
            'tenant' => $tenant,
            'subscription' => $subscription,
            'plan' => $plan,
            'plans' => $plans,
            'invoices' => $invoices,
            'usage' => [
                'bookings_used' => $subscription?->bookings_this_month ?? 0,
                'bookings_limit' => $plan?->max_bookings_per_month,
                'locations_used' => $tenant->locations()->count(),
                'locations_limit' => $plan?->max_locations,
                'users_used' => $tenant->users()->count(),
                'users_limit' => $plan?->max_users,
            ],
            'stripeKey' => config('services.stripe.key'),
        ]);
    }

    public function team()
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $users = \App\Models\User::where('tenant_id', $tenant->id)
            ->with('roles')
            ->get();

        return Inertia::render('admin/settings/team', [
            'users' => $users,
            'roles' => \Spatie\Permission\Models\Role::all(),
        ]);
    }

    public function inviteTeamMember(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'name' => 'required|string|max:255',
            'role' => 'required|exists:roles,name',
        ]);

        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt(\Str::random(16)),
            'tenant_id' => $tenant->id,
        ]);

        $user->assignRole($validated['role']);

        // TODO: Send invitation email

        return redirect()->back()->with('success', 'Team member invited successfully.');
    }

    public function removeTeamMember(\App\Models\User $user)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($user->tenant_id !== $tenant->id) {
            abort(403, 'Unauthorized.');
        }

        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot remove yourself.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Team member removed successfully.');
    }

    public function changePlan(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $plan = \App\Models\SubscriptionPlan::findOrFail($validated['plan_id']);
        $subscription = $tenant->activeSubscription();

        $subscriptionService = app(\App\Services\SubscriptionService::class);

        if ($subscription) {
            $subscriptionService->changePlan($subscription, $plan, $validated['billing_cycle']);
            $message = 'Plan changed successfully.';
        } else {
            $subscriptionService->startTrial($tenant, $plan);
            $message = 'Trial started successfully.';
        }

        return redirect()->back()->with('success', $message);
    }

    public function cancelSubscription()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $subscription = $tenant->activeSubscription();

        if (!$subscription) {
            return redirect()->back()->with('error', 'No active subscription found.');
        }

        $subscriptionService = app(\App\Services\SubscriptionService::class);
        $subscriptionService->cancel($subscription, false);

        return redirect()->back()->with('success', 'Subscription will be cancelled at the end of the billing period.');
    }

    public function resumeSubscription()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $subscription = $tenant->activeSubscription();

        if (!$subscription || !$subscription->canceled_at) {
            return redirect()->back()->with('error', 'No cancelled subscription found.');
        }

        $subscriptionService = app(\App\Services\SubscriptionService::class);
        $subscriptionService->resume($subscription);

        return redirect()->back()->with('success', 'Subscription resumed successfully.');
    }

    public function billingPortal()
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if (!$tenant->stripe_customer_id) {
            return redirect()->back()->with('error', 'No billing account found. Please subscribe to a plan first.');
        }

        try {
            $subscriptionService = app(\App\Services\SubscriptionService::class);
            $url = $subscriptionService->createBillingPortalSession(
                $tenant,
                route('admin.settings.billing')
            );

            return redirect()->away($url);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to access billing portal: ' . $e->getMessage());
        }
    }

    protected function getCurrencies(): array
    {
        return [
            ['code' => 'USD', 'name' => 'US Dollar'],
            ['code' => 'EUR', 'name' => 'Euro'],
            ['code' => 'GBP', 'name' => 'British Pound'],
            ['code' => 'AUD', 'name' => 'Australian Dollar'],
            ['code' => 'CAD', 'name' => 'Canadian Dollar'],
            ['code' => 'THB', 'name' => 'Thai Baht'],
            ['code' => 'MXN', 'name' => 'Mexican Peso'],
            ['code' => 'IDR', 'name' => 'Indonesian Rupiah'],
            ['code' => 'PHP', 'name' => 'Philippine Peso'],
            ['code' => 'MYR', 'name' => 'Malaysian Ringgit'],
            ['code' => 'SGD', 'name' => 'Singapore Dollar'],
            ['code' => 'NZD', 'name' => 'New Zealand Dollar'],
            ['code' => 'EGP', 'name' => 'Egyptian Pound'],
            ['code' => 'AED', 'name' => 'UAE Dirham'],
        ];
    }
}
