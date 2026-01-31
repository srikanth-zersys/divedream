<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Bookings
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();

            // Booking reference
            $table->string('booking_number')->unique();
            $table->string('source')->default('online'); // online, walk_in, phone, partner

            // Customer
            $table->foreignId('member_id')->nullable()->constrained()->nullOnDelete();
            // For quick bookings without member profile
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();

            // Schedule (if booking a scheduled trip)
            $table->foreignId('schedule_id')->nullable()->constrained()->nullOnDelete();

            // Or direct booking without schedule
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->date('booking_date')->nullable();
            $table->time('booking_time')->nullable();

            // Participants
            $table->integer('participant_count')->default(1);
            $table->json('participants')->nullable(); // Array of participant details

            // Pricing
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->string('discount_code')->nullable();
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->string('currency', 3)->default('USD');

            // Payment
            $table->enum('payment_status', [
                'pending',
                'deposit_paid',
                'fully_paid',
                'partially_refunded',
                'fully_refunded',
                'failed'
            ])->default('pending');
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->decimal('amount_refunded', 10, 2)->default(0);
            $table->decimal('balance_due', 10, 2)->default(0);
            $table->timestamp('payment_due_date')->nullable();

            // Status
            $table->enum('status', [
                'pending',
                'confirmed',
                'checked_in',
                'in_progress',
                'completed',
                'no_show',
                'cancelled'
            ])->default('pending');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();

            // Documents
            $table->boolean('waiver_completed')->default(false);
            $table->timestamp('waiver_completed_at')->nullable();
            $table->boolean('medical_form_completed')->default(false);

            // Notes
            $table->text('customer_notes')->nullable(); // Notes from customer
            $table->text('internal_notes')->nullable(); // Staff notes

            // Equipment requests
            $table->json('equipment_requests')->nullable();

            // Assigned instructor
            $table->foreignId('assigned_instructor_id')->nullable()->constrained('instructors')->nullOnDelete();

            // Timestamps
            $table->timestamp('reminder_sent_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'location_id', 'status']);
            $table->index(['tenant_id', 'booking_date']);
            $table->index(['member_id', 'status']);
            $table->index('booking_number');
        });

        // Booking line items
        Schema::create('booking_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['product', 'add_on', 'equipment_rental', 'fee', 'discount', 'custom'])->default('product');

            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);

            $table->timestamps();
        });

        // Booking participants
        Schema::create('booking_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained()->nullOnDelete();

            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->date('date_of_birth')->nullable();

            // Certification info
            $table->string('certification_level')->nullable();
            $table->string('certification_number')->nullable();
            $table->string('certification_agency')->nullable();
            $table->enum('certification_status', ['verified', 'pending', 'not_provided'])->default('not_provided');

            // Waivers
            $table->boolean('waiver_signed')->default(false);
            $table->timestamp('waiver_signed_at')->nullable();
            $table->string('waiver_signature')->nullable();

            // Medical
            $table->boolean('medical_form_completed')->default(false);
            $table->json('medical_answers')->nullable();

            // Equipment
            $table->json('equipment_sizes')->nullable();
            $table->json('assigned_equipment')->nullable();

            // Check-in
            $table->boolean('checked_in')->default(false);
            $table->timestamp('checked_in_at')->nullable();

            $table->timestamps();
        });

        // Equipment assignments for bookings
        Schema::create('booking_equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_participant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('equipment_id')->constrained()->cascadeOnDelete();

            $table->timestamp('checked_out_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->enum('condition_on_return', ['good', 'damaged', 'lost'])->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_equipment');
        Schema::dropIfExists('booking_participants');
        Schema::dropIfExists('booking_items');
        Schema::dropIfExists('bookings');
    }
};
