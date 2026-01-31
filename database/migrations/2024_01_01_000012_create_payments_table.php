<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Payments
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('member_id')->nullable()->constrained()->nullOnDelete();

            // Payment reference
            $table->string('payment_number')->unique();

            // Amount
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');

            // Type
            $table->enum('type', [
                'payment',
                'deposit',
                'refund',
                'credit',
                'adjustment'
            ])->default('payment');

            // Method
            $table->enum('method', [
                'card',
                'cash',
                'bank_transfer',
                'paypal',
                'other'
            ])->default('card');

            // Stripe
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_charge_id')->nullable();
            $table->string('stripe_refund_id')->nullable();
            $table->json('stripe_metadata')->nullable();

            // Status
            $table->enum('status', [
                'pending',
                'processing',
                'succeeded',
                'failed',
                'cancelled',
                'refunded'
            ])->default('pending');
            $table->string('failure_reason')->nullable();

            // For refunds
            $table->foreignId('original_payment_id')->nullable()->constrained('payments')->nullOnDelete();
            $table->string('refund_reason')->nullable();

            // Processed by
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index(['booking_id', 'status']);
        });

        // Discount codes
        Schema::create('discount_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();

            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();

            $table->enum('type', ['percentage', 'fixed_amount'])->default('percentage');
            $table->decimal('value', 10, 2);
            $table->decimal('minimum_order_amount', 10, 2)->nullable();
            $table->decimal('maximum_discount_amount', 10, 2)->nullable();

            // Limits
            $table->integer('usage_limit')->nullable();
            $table->integer('usage_limit_per_customer')->nullable();
            $table->integer('times_used')->default(0);

            // Validity
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            // Restrictions
            $table->json('applicable_products')->nullable();
            $table->json('applicable_locations')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discount_codes');
        Schema::dropIfExists('payments');
    }
};
