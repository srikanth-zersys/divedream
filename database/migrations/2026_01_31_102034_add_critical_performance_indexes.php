<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add critical performance indexes to improve query performance.
 *
 * These indexes address the following performance issues:
 * 1. booking_participants.booking_id - N+1 when loading participants
 * 2. booking_equipment.booking_id - N+1 when loading equipment assignments
 * 3. payments.member_id - Slow member payment history queries
 * 4. schedules.product_id - Slow product schedule lookups
 * 5. schedules.lead_instructor_id - Slow instructor schedule queries
 * 6. bookings.payment_status - Dashboard payment status filtering
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. booking_participants.booking_id - Critical for booking detail views
        Schema::table('booking_participants', function (Blueprint $table) {
            $table->index('booking_id', 'booking_participants_booking_id_index');
        });

        // 2. booking_equipment.booking_id - Critical for equipment checkout/return
        Schema::table('booking_equipment', function (Blueprint $table) {
            $table->index('booking_id', 'booking_equipment_booking_id_index');
            $table->index('equipment_id', 'booking_equipment_equipment_id_index');
        });

        // 3. payments.member_id - Member payment history lookup
        Schema::table('payments', function (Blueprint $table) {
            $table->index('member_id', 'payments_member_id_index');
        });

        // 4. schedules.product_id - Product schedule queries
        Schema::table('schedules', function (Blueprint $table) {
            $table->index('product_id', 'schedules_product_id_index');
        });

        // 5. schedules.lead_instructor_id - Instructor schedule queries
        Schema::table('schedules', function (Blueprint $table) {
            $table->index('lead_instructor_id', 'schedules_lead_instructor_id_index');
        });

        // 6. bookings.payment_status - Dashboard payment filtering
        Schema::table('bookings', function (Blueprint $table) {
            $table->index('payment_status', 'bookings_payment_status_index');
        });
    }

    public function down(): void
    {
        Schema::table('booking_participants', function (Blueprint $table) {
            $table->dropIndex('booking_participants_booking_id_index');
        });

        Schema::table('booking_equipment', function (Blueprint $table) {
            $table->dropIndex('booking_equipment_booking_id_index');
            $table->dropIndex('booking_equipment_equipment_id_index');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_member_id_index');
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropIndex('schedules_product_id_index');
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropIndex('schedules_lead_instructor_id_index');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('bookings_payment_status_index');
        });
    }
};
