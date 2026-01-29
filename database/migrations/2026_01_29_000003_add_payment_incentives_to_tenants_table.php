<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Soft payment incentives - encourage online payment without forcing it
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Discount for paying online (soft incentive, typically 5-10%)
            $table->decimal('online_payment_discount_percent', 5, 2)->default(0)->after('tax_rate');

            // Early bird discount for advance bookings
            $table->integer('early_bird_days')->default(14)->after('online_payment_discount_percent');
            $table->decimal('early_bird_discount_percent', 5, 2)->default(0)->after('early_bird_days');

            // Cancellation policy (builds trust for online payment)
            $table->integer('free_cancellation_hours')->default(48)->after('early_bird_discount_percent');
            $table->decimal('late_cancellation_fee_percent', 5, 2)->default(50)->after('free_cancellation_hours');
            $table->decimal('no_show_fee_percent', 5, 2)->default(100)->after('late_cancellation_fee_percent');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'online_payment_discount_percent',
                'early_bird_days',
                'early_bird_discount_percent',
                'free_cancellation_hours',
                'late_cancellation_fee_percent',
                'no_show_fee_percent',
            ]);
        });
    }
};
