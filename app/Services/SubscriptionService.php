<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;

class SubscriptionService
{
    protected StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Create a new subscription for a tenant
     */
    public function createSubscription(
        Tenant $tenant,
        SubscriptionPlan $plan,
        string $billingCycle = 'monthly',
        ?string $paymentMethodId = null,
        int $trialDays = 14
    ): array {
        // Create or get Stripe customer
        $customerId = $tenant->stripe_customer_id;
        if (!$customerId) {
            $customer = $this->stripe->customers->create([
                'email' => $tenant->email,
                'name' => $tenant->name,
                'metadata' => [
                    'tenant_id' => $tenant->id,
                ],
            ]);
            $customerId = $customer->id;
            $tenant->update(['stripe_customer_id' => $customerId]);
        }

        // Attach payment method if provided
        if ($paymentMethodId) {
            $this->stripe->paymentMethods->attach($paymentMethodId, [
                'customer' => $customerId,
            ]);
            $this->stripe->customers->update($customerId, [
                'invoice_settings' => [
                    'default_payment_method' => $paymentMethodId,
                ],
            ]);
        }

        // Get Stripe price ID
        $stripePriceId = $plan->getStripePriceId($billingCycle);

        // Create Stripe subscription
        $subscriptionParams = [
            'customer' => $customerId,
            'items' => [['price' => $stripePriceId]],
            'payment_behavior' => 'default_incomplete',
            'payment_settings' => ['save_default_payment_method' => 'on_subscription'],
            'expand' => ['latest_invoice.payment_intent'],
            'metadata' => [
                'tenant_id' => $tenant->id,
                'plan_slug' => $plan->slug,
            ],
        ];

        if ($trialDays > 0) {
            $subscriptionParams['trial_period_days'] = $trialDays;
        }

        $stripeSubscription = $this->stripe->subscriptions->create($subscriptionParams);

        // Create local subscription record
        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'subscription_plan_id' => $plan->id,
            'stripe_subscription_id' => $stripeSubscription->id,
            'stripe_customer_id' => $customerId,
            'status' => $this->mapStripeStatus($stripeSubscription->status),
            'billing_cycle' => $billingCycle,
            'trial_ends_at' => $stripeSubscription->trial_end
                ? \Carbon\Carbon::createFromTimestamp($stripeSubscription->trial_end)
                : null,
            'current_period_start' => \Carbon\Carbon::createFromTimestamp($stripeSubscription->current_period_start),
            'current_period_end' => \Carbon\Carbon::createFromTimestamp($stripeSubscription->current_period_end),
        ]);

        // Update tenant
        $tenant->update([
            'stripe_subscription_id' => $stripeSubscription->id,
            'plan' => $plan->slug,
            'trial_ends_at' => $subscription->trial_ends_at,
            'subscription_ends_at' => $subscription->current_period_end,
        ]);

        return [
            'subscription' => $subscription,
            'stripe_subscription' => $stripeSubscription,
            'client_secret' => $stripeSubscription->latest_invoice?->payment_intent?->client_secret,
        ];
    }

    /**
     * Start a free trial without payment method
     */
    public function startTrial(Tenant $tenant, SubscriptionPlan $plan, int $trialDays = 14): Subscription
    {
        // Create local subscription in trial mode
        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'subscription_plan_id' => $plan->id,
            'status' => Subscription::STATUS_TRIALING,
            'billing_cycle' => 'monthly',
            'trial_ends_at' => now()->addDays($trialDays),
            'current_period_start' => now(),
            'current_period_end' => now()->addDays($trialDays),
        ]);

        $tenant->update([
            'plan' => $plan->slug,
            'trial_ends_at' => $subscription->trial_ends_at,
        ]);

        return $subscription;
    }

    /**
     * Convert trial to paid subscription
     */
    public function convertTrial(
        Subscription $subscription,
        string $paymentMethodId,
        string $billingCycle = 'monthly'
    ): array {
        $tenant = $subscription->tenant;
        $plan = $subscription->plan;

        // Create Stripe subscription
        return $this->createSubscription($tenant, $plan, $billingCycle, $paymentMethodId, 0);
    }

    /**
     * Change subscription plan
     */
    public function changePlan(Subscription $subscription, SubscriptionPlan $newPlan, string $billingCycle = null): Subscription
    {
        $billingCycle = $billingCycle ?? $subscription->billing_cycle;

        if ($subscription->stripe_subscription_id) {
            // Update Stripe subscription
            $stripeSubscription = $this->stripe->subscriptions->retrieve($subscription->stripe_subscription_id);

            $this->stripe->subscriptions->update($subscription->stripe_subscription_id, [
                'items' => [
                    [
                        'id' => $stripeSubscription->items->data[0]->id,
                        'price' => $newPlan->getStripePriceId($billingCycle),
                    ],
                ],
                'proration_behavior' => 'create_prorations',
            ]);
        }

        $subscription->update([
            'subscription_plan_id' => $newPlan->id,
            'billing_cycle' => $billingCycle,
        ]);

        $subscription->tenant->update(['plan' => $newPlan->slug]);

        return $subscription->fresh();
    }

    /**
     * Cancel subscription
     */
    public function cancel(Subscription $subscription, bool $immediately = false): Subscription
    {
        if ($subscription->stripe_subscription_id) {
            if ($immediately) {
                $this->stripe->subscriptions->cancel($subscription->stripe_subscription_id);
            } else {
                $this->stripe->subscriptions->update($subscription->stripe_subscription_id, [
                    'cancel_at_period_end' => true,
                ]);
            }
        }

        if ($immediately) {
            $subscription->update([
                'status' => Subscription::STATUS_CANCELED,
                'canceled_at' => now(),
                'ended_at' => now(),
                'ends_at' => now(),
            ]);
        } else {
            $subscription->update([
                'status' => Subscription::STATUS_CANCELED,
                'canceled_at' => now(),
                'ends_at' => $subscription->current_period_end,
            ]);
        }

        return $subscription->fresh();
    }

    /**
     * Resume a canceled subscription
     */
    public function resume(Subscription $subscription): Subscription
    {
        if (!$subscription->canceled_at || $subscription->ended_at) {
            throw new \Exception('Subscription cannot be resumed');
        }

        if ($subscription->stripe_subscription_id) {
            $this->stripe->subscriptions->update($subscription->stripe_subscription_id, [
                'cancel_at_period_end' => false,
            ]);
        }

        $subscription->update([
            'canceled_at' => null,
        ]);

        return $subscription->fresh();
    }

    /**
     * Handle Stripe webhook events
     */
    public function handleWebhook(array $event): void
    {
        $type = $event['type'];
        $data = $event['data']['object'];

        switch ($type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                $this->syncSubscription($data);
                break;

            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($data);
                break;

            case 'invoice.paid':
                $this->handleInvoicePaid($data);
                break;

            case 'invoice.payment_failed':
                $this->handlePaymentFailed($data);
                break;

            case 'customer.subscription.trial_will_end':
                $this->handleTrialEnding($data);
                break;
        }
    }

    protected function syncSubscription(array $stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription['id'])->first();

        if (!$subscription) {
            return;
        }

        $subscription->update([
            'status' => $this->mapStripeStatus($stripeSubscription['status']),
            'current_period_start' => \Carbon\Carbon::createFromTimestamp($stripeSubscription['current_period_start']),
            'current_period_end' => \Carbon\Carbon::createFromTimestamp($stripeSubscription['current_period_end']),
            'canceled_at' => $stripeSubscription['canceled_at']
                ? \Carbon\Carbon::createFromTimestamp($stripeSubscription['canceled_at'])
                : null,
            'ended_at' => $stripeSubscription['ended_at']
                ? \Carbon\Carbon::createFromTimestamp($stripeSubscription['ended_at'])
                : null,
        ]);

        $subscription->tenant->update([
            'subscription_ends_at' => $subscription->current_period_end,
        ]);
    }

    protected function handleSubscriptionDeleted(array $stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription['id'])->first();

        if ($subscription) {
            $subscription->update([
                'status' => Subscription::STATUS_CANCELED,
                'ended_at' => now(),
            ]);
        }
    }

    protected function handleInvoicePaid(array $invoice): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();

        if (!$subscription) {
            return;
        }

        // Create invoice record
        SubscriptionInvoice::updateOrCreate(
            ['stripe_invoice_id' => $invoice['id']],
            [
                'tenant_id' => $subscription->tenant_id,
                'subscription_id' => $subscription->id,
                'invoice_number' => $invoice['number'] ?? SubscriptionInvoice::generateInvoiceNumber(),
                'status' => SubscriptionInvoice::STATUS_PAID,
                'subtotal' => $invoice['subtotal'] / 100,
                'tax' => ($invoice['tax'] ?? 0) / 100,
                'total' => $invoice['total'] / 100,
                'currency' => strtoupper($invoice['currency']),
                'paid_at' => now(),
                'payment_intent_id' => $invoice['payment_intent'],
                'pdf_url' => $invoice['invoice_pdf'] ?? null,
                'hosted_invoice_url' => $invoice['hosted_invoice_url'] ?? null,
            ]
        );

        // Reset monthly usage on successful payment
        $subscription->resetMonthlyUsage();
    }

    protected function handlePaymentFailed(array $invoice): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();

        if ($subscription) {
            $subscription->update(['status' => Subscription::STATUS_PAST_DUE]);

            // TODO: Send payment failed notification email
        }
    }

    protected function handleTrialEnding(array $stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription['id'])->first();

        if ($subscription) {
            // TODO: Send trial ending notification email
            Log::info('Trial ending soon', ['subscription_id' => $subscription->id]);
        }
    }

    protected function mapStripeStatus(string $stripeStatus): string
    {
        return match ($stripeStatus) {
            'trialing' => Subscription::STATUS_TRIALING,
            'active' => Subscription::STATUS_ACTIVE,
            'past_due' => Subscription::STATUS_PAST_DUE,
            'canceled' => Subscription::STATUS_CANCELED,
            'unpaid' => Subscription::STATUS_UNPAID,
            'incomplete' => Subscription::STATUS_INCOMPLETE,
            default => Subscription::STATUS_ACTIVE,
        };
    }

    /**
     * Create billing portal session
     */
    public function createBillingPortalSession(Tenant $tenant, string $returnUrl): string
    {
        if (!$tenant->stripe_customer_id) {
            throw new \Exception('No Stripe customer found');
        }

        $session = $this->stripe->billingPortal->sessions->create([
            'customer' => $tenant->stripe_customer_id,
            'return_url' => $returnUrl,
        ]);

        return $session->url;
    }

    /**
     * Check if tenant can create more bookings
     */
    public function canCreateBooking(Tenant $tenant): bool
    {
        $subscription = $tenant->activeSubscription();

        if (!$subscription) {
            return false;
        }

        if (!$subscription->isActive()) {
            return false;
        }

        return !$subscription->hasReachedBookingLimit();
    }

    /**
     * Record a booking for usage tracking
     */
    public function recordBooking(Subscription $subscription): void
    {
        $subscription->incrementBookingUsage();

        // Record usage for potential overage billing
        if ($subscription->plan->transaction_fee_percent > 0) {
            $subscription->recordUsage('booking', 1);
        }
    }

    /**
     * Get subscription limits for a tenant
     */
    public function getLimits(Tenant $tenant): array
    {
        $subscription = $tenant->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return [
                'bookings_per_month' => 0,
                'team_members' => 0,
                'locations' => 0,
            ];
        }

        return $subscription->plan->limits ?? [
            'bookings_per_month' => 100,
            'team_members' => 2,
            'locations' => 1,
        ];
    }

    /**
     * Record usage for a subscription
     */
    public function recordUsage(Subscription $subscription, string $feature, int $quantity = 1): void
    {
        $currentUsage = $subscription->usage[$feature] ?? 0;
        $usage = $subscription->usage ?? [];
        $usage[$feature] = $currentUsage + $quantity;
        $subscription->update(['usage' => $usage]);
    }

    /**
     * Get usage for a subscription feature
     */
    public function getUsage(Subscription $subscription, string $feature): int
    {
        return $subscription->usage[$feature] ?? 0;
    }

    /**
     * Get subscription analytics
     */
    public function getAnalytics(int $tenantId): array
    {
        $subscription = Subscription::forTenant($tenantId)->active()->first();

        if (!$subscription) {
            return ['has_subscription' => false];
        }

        return [
            'has_subscription' => true,
            'plan' => $subscription->plan->name,
            'status' => $subscription->status,
            'is_trialing' => $subscription->isTrialing(),
            'trial_days_remaining' => $subscription->trialDaysRemaining(),
            'billing_cycle' => $subscription->billing_cycle,
            'current_period_end' => $subscription->current_period_end,
            'days_until_renewal' => $subscription->daysUntilRenewal(),
            'is_canceled' => $subscription->isCanceled(),
            'bookings_used' => $subscription->bookings_this_month,
            'bookings_limit' => $subscription->plan->max_bookings_per_month,
            'bookings_remaining' => $subscription->getBookingsRemaining(),
            'usage_percentage' => $subscription->getUsagePercentage(),
        ];
    }
}
