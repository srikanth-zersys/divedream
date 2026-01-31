<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Part payments and per-booking discount options
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Per-booking online discount (can be enabled/disabled per booking)
            $table->boolean('online_discount_enabled')->default(false)->after('discount_code');
            $table->decimal('online_discount_percent', 5, 2)->default(0)->after('online_discount_enabled');
            $table->decimal('online_discount_amount', 10, 2)->default(0)->after('online_discount_percent');

            // Deposit tracking
            $table->decimal('deposit_amount', 10, 2)->default(0)->after('amount_paid');
            $table->timestamp('deposit_paid_at')->nullable()->after('deposit_amount');
        });

        // Create payments table for tracking part payments
        Schema::create('booking_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');

            // Payment details
            $table->string('payment_number')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('type', ['deposit', 'partial', 'full', 'balance', 'refund'])->default('partial');
            $table->enum('method', ['cash', 'card', 'bank_transfer', 'online', 'other'])->default('cash');
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');

            // Payment gateway info (for online payments)
            $table->string('gateway')->nullable(); // stripe, paypal, etc.
            $table->string('gateway_transaction_id')->nullable();
            $table->string('gateway_status')->nullable();
            $table->json('gateway_response')->nullable();

            // Metadata
            $table->text('notes')->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'status']);
            $table->index(['tenant_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_payments');

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'online_discount_enabled',
                'online_discount_percent',
                'online_discount_amount',
                'deposit_amount',
                'deposit_paid_at',
            ]);
        });
    }
};
