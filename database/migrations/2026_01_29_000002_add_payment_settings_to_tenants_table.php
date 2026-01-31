<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Industry best practices for dive shop payment settings:
     * - Allow pay-at-shop as default (most dive shops prefer this)
     * - Make online payment optional
     * - Configurable expiration for online payment bookings
     * - Tax rate configuration
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Payment configuration - industry standard defaults
            $table->boolean('allow_pay_at_shop')->default(true)->after('currency');
            $table->boolean('require_online_payment')->default(false)->after('allow_pay_at_shop');
            $table->boolean('require_deposit')->default(false)->after('require_online_payment');
            $table->decimal('deposit_percentage', 5, 2)->default(0)->after('require_deposit');
            $table->integer('online_payment_expiration_hours')->default(24)->after('deposit_percentage');
            $table->decimal('tax_rate', 5, 2)->default(0)->after('online_payment_expiration_hours');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'allow_pay_at_shop',
                'require_online_payment',
                'require_deposit',
                'deposit_percentage',
                'online_payment_expiration_hours',
                'tax_rate',
            ]);
        });
    }
};
