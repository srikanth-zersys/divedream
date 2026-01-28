<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('subdomain')->unique();
            $table->string('custom_domain')->nullable()->unique();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();
            $table->string('timezone')->default('UTC');
            $table->string('currency', 3)->default('USD');
            $table->string('date_format')->default('Y-m-d');
            $table->string('time_format')->default('H:i');

            // Branding
            $table->string('primary_color')->default('#0066CC');
            $table->string('secondary_color')->default('#004499');
            $table->text('custom_css')->nullable();

            // Stripe
            $table->string('stripe_customer_id')->nullable();
            $table->string('stripe_subscription_id')->nullable();
            $table->string('stripe_account_id')->nullable(); // Connected account for payouts
            $table->boolean('stripe_onboarding_complete')->default(false);

            // Plan & Billing
            $table->enum('plan', ['starter', 'growth', 'enterprise'])->default('starter');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();

            // Settings
            $table->json('settings')->nullable();
            $table->json('booking_settings')->nullable();
            $table->json('notification_settings')->nullable();

            // Status
            $table->enum('status', ['active', 'suspended', 'cancelled'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
