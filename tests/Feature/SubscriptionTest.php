<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    protected SubscriptionService $subscriptionService;
    protected SubscriptionPlan $starterPlan;
    protected SubscriptionPlan $proPlan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->subscriptionService = app(SubscriptionService::class);

        $this->starterPlan = SubscriptionPlan::create([
            'name' => 'Starter',
            'slug' => 'starter',
            'monthly_price' => 4900,
            'yearly_price' => 49000,
            'features' => ['Basic features'],
            'limits' => [
                'bookings_per_month' => 100,
                'team_members' => 2,
                'locations' => 1,
            ],
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->proPlan = SubscriptionPlan::create([
            'name' => 'Professional',
            'slug' => 'professional',
            'monthly_price' => 9900,
            'yearly_price' => 99000,
            'features' => ['All features'],
            'limits' => [
                'bookings_per_month' => 500,
                'team_members' => 10,
                'locations' => 5,
            ],
            'is_active' => true,
            'sort_order' => 2,
        ]);
    }

    public function test_can_start_trial(): void
    {
        $tenant = Tenant::factory()->create();

        $subscription = $this->subscriptionService->startTrial($tenant, $this->starterPlan, 14);

        $this->assertEquals('trialing', $subscription->status);
        $this->assertEquals($this->starterPlan->id, $subscription->subscription_plan_id);
        $this->assertNotNull($subscription->trial_ends_at);
        $this->assertTrue($subscription->trial_ends_at->isFuture());
    }

    public function test_trial_subscription_is_active(): void
    {
        $tenant = Tenant::factory()->create();

        $subscription = $this->subscriptionService->startTrial($tenant, $this->starterPlan, 14);

        $this->assertTrue($subscription->isActive());
        $this->assertTrue($subscription->onTrial());
    }

    public function test_expired_trial_is_not_active(): void
    {
        $tenant = Tenant::factory()->create();

        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'subscription_plan_id' => $this->starterPlan->id,
            'status' => 'trialing',
            'billing_cycle' => 'monthly',
            'trial_ends_at' => now()->subDays(1),
        ]);

        $this->assertFalse($subscription->isActive());
    }

    public function test_can_change_plan(): void
    {
        $tenant = Tenant::factory()->create();

        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'subscription_plan_id' => $this->starterPlan->id,
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
        ]);

        $updatedSubscription = $this->subscriptionService->changePlan($subscription, $this->proPlan);

        $this->assertEquals($this->proPlan->id, $updatedSubscription->subscription_plan_id);
    }

    public function test_can_cancel_subscription(): void
    {
        $tenant = Tenant::factory()->create();

        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'subscription_plan_id' => $this->starterPlan->id,
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
        ]);

        $cancelledSubscription = $this->subscriptionService->cancel($subscription);

        $this->assertEquals('canceled', $cancelledSubscription->status);
        $this->assertNotNull($cancelledSubscription->canceled_at);
        $this->assertNotNull($cancelledSubscription->ends_at);
    }

    public function test_can_cancel_subscription_immediately(): void
    {
        $tenant = Tenant::factory()->create();

        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'subscription_plan_id' => $this->starterPlan->id,
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
        ]);

        $cancelledSubscription = $this->subscriptionService->cancel($subscription, true);

        $this->assertEquals('canceled', $cancelledSubscription->status);
        $this->assertTrue($cancelledSubscription->ends_at->isPast() || $cancelledSubscription->ends_at->isToday());
    }

    public function test_tenant_can_create_booking_with_active_subscription(): void
    {
        $tenant = Tenant::factory()->create();

        Subscription::create([
            'tenant_id' => $tenant->id,
            'subscription_plan_id' => $this->starterPlan->id,
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
        ]);

        $this->assertTrue($this->subscriptionService->canCreateBooking($tenant));
    }

    public function test_tenant_cannot_create_booking_without_subscription(): void
    {
        $tenant = Tenant::factory()->create();

        $this->assertFalse($this->subscriptionService->canCreateBooking($tenant));
    }

    public function test_tenant_can_create_booking_during_trial(): void
    {
        $tenant = Tenant::factory()->create();

        $this->subscriptionService->startTrial($tenant, $this->starterPlan, 14);

        $this->assertTrue($this->subscriptionService->canCreateBooking($tenant));
    }

    public function test_yearly_billing_applies_discount(): void
    {
        $monthlyTotal = $this->proPlan->monthly_price * 12;
        $yearlyTotal = $this->proPlan->yearly_price;

        $this->assertLessThan($monthlyTotal, $yearlyTotal);
        $this->assertEquals(99000, $yearlyTotal); // ~17% discount
    }

    public function test_subscription_limits_are_enforced(): void
    {
        $tenant = Tenant::factory()->create();

        Subscription::create([
            'tenant_id' => $tenant->id,
            'subscription_plan_id' => $this->starterPlan->id,
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
        ]);

        $limits = $this->subscriptionService->getLimits($tenant);

        $this->assertEquals(100, $limits['bookings_per_month']);
        $this->assertEquals(2, $limits['team_members']);
        $this->assertEquals(1, $limits['locations']);
    }

    public function test_usage_tracking(): void
    {
        $tenant = Tenant::factory()->create();

        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'subscription_plan_id' => $this->starterPlan->id,
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
        ]);

        $this->subscriptionService->recordUsage($subscription, 'bookings', 5);
        $this->subscriptionService->recordUsage($subscription, 'bookings', 3);

        $usage = $this->subscriptionService->getUsage($subscription, 'bookings');
        $this->assertEquals(8, $usage);
    }
}
