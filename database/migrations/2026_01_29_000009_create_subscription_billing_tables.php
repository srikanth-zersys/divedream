<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Subscription plans
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Starter, Professional, Enterprise
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Pricing
            $table->decimal('monthly_price', 10, 2);
            $table->decimal('yearly_price', 10, 2)->nullable(); // Discounted annual
            $table->string('currency', 3)->default('USD');
            $table->string('stripe_monthly_price_id')->nullable();
            $table->string('stripe_yearly_price_id')->nullable();

            // Limits (null = unlimited)
            $table->integer('max_locations')->nullable();
            $table->integer('max_users')->nullable();
            $table->integer('max_bookings_per_month')->nullable(); // null = unlimited
            $table->integer('max_products')->nullable();
            $table->decimal('transaction_fee_percent', 5, 2)->default(0); // % per booking

            // Features (JSON for flexibility)
            $table->json('features')->nullable();
            $table->json('limits')->nullable(); // For storing limit values in a flexible format
            $table->boolean('has_api_access')->default(false);
            $table->boolean('has_white_label')->default(false);
            $table->boolean('has_priority_support')->default(false);
            $table->boolean('has_custom_domain')->default(false);

            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Tenant subscriptions
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_plan_id')->constrained()->onDelete('restrict');

            $table->string('stripe_subscription_id')->nullable()->unique();
            $table->string('stripe_customer_id')->nullable();

            $table->string('status'); // trialing, active, past_due, canceled, unpaid
            $table->string('billing_cycle'); // monthly, yearly

            // Dates
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamp('ends_at')->nullable();

            // Payment method
            $table->string('payment_method_type')->nullable(); // card, bank_transfer
            $table->string('payment_method_last4')->nullable();
            $table->string('payment_method_brand')->nullable();

            // Usage tracking
            $table->integer('bookings_this_month')->default(0);
            $table->timestamp('usage_reset_at')->nullable();
            $table->json('usage')->nullable(); // For tracking various usage metrics

            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index('stripe_subscription_id');
        });

        // Invoices
        Schema::create('subscription_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null');

            $table->string('stripe_invoice_id')->nullable()->unique();
            $table->string('invoice_number')->unique();

            $table->string('status'); // draft, open, paid, void, uncollectible
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->string('currency', 3)->default('USD');

            $table->text('description')->nullable();
            $table->json('line_items')->nullable();

            $table->timestamp('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_intent_id')->nullable();

            $table->string('pdf_url')->nullable();
            $table->string('hosted_invoice_url')->nullable();

            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index('stripe_invoice_id');
        });

        // Usage records (for transaction fees, overages)
        Schema::create('subscription_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained()->onDelete('cascade');

            $table->string('type'); // booking, api_call, sms, etc.
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->decimal('total', 10, 2)->nullable();

            $table->string('description')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamp('recorded_at');
            $table->boolean('billed')->default(false);
            $table->foreignId('invoice_id')->nullable();

            $table->timestamps();

            $table->index(['subscription_id', 'billed']);
            $table->index(['subscription_id', 'recorded_at']);
        });

        // Seed default plans
        DB::table('subscription_plans')->insert([
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Perfect for small dive shops just getting started',
                'monthly_price' => 49.00,
                'yearly_price' => 470.00,
                'currency' => 'USD',
                'max_locations' => 1,
                'max_users' => 3,
                'max_bookings_per_month' => 100,
                'max_products' => 10,
                'transaction_fee_percent' => 2.5,
                'features' => json_encode(['Online Booking', 'Email Notifications', 'Basic Reports', 'Waiver Management']),
                'has_api_access' => false,
                'has_white_label' => false,
                'has_priority_support' => false,
                'has_custom_domain' => false,
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'For growing dive centers with multiple staff',
                'monthly_price' => 99.00,
                'yearly_price' => 950.00,
                'currency' => 'USD',
                'max_locations' => 3,
                'max_users' => 10,
                'max_bookings_per_month' => 500,
                'max_products' => 50,
                'transaction_fee_percent' => 1.5,
                'features' => json_encode(['Everything in Starter', 'Multi-location', 'Advanced Reports', 'Marketing Automation', 'Referral Program', 'Quote System']),
                'has_api_access' => true,
                'has_white_label' => false,
                'has_priority_support' => true,
                'has_custom_domain' => false,
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'For large operations and dive resort chains',
                'monthly_price' => 249.00,
                'yearly_price' => 2390.00,
                'currency' => 'USD',
                'max_locations' => null,
                'max_users' => null,
                'max_bookings_per_month' => null,
                'max_products' => null,
                'transaction_fee_percent' => 0.5,
                'features' => json_encode(['Everything in Professional', 'Unlimited Everything', 'White Label', 'Custom Domain', 'Dedicated Support', 'Custom Integrations', 'SLA']),
                'has_api_access' => true,
                'has_white_label' => true,
                'has_priority_support' => true,
                'has_custom_domain' => true,
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_usage');
        Schema::dropIfExists('subscription_invoices');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('subscription_plans');
    }
};
