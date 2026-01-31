<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Marketing Automation System - P0 Features
     *
     * 1. Post-trip review requests
     * 2. Abandoned cart recovery
     * 3. Pre-trip preparation sequences
     */
    public function up(): void
    {
        // Abandoned carts - track incomplete checkouts
        Schema::create('abandoned_carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('member_id')->nullable()->constrained()->nullOnDelete();

            // Cart identification
            $table->string('session_id')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();

            // What they were booking
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('schedule_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('participant_count')->default(1);
            $table->decimal('cart_value', 10, 2)->default(0);

            // Cart state
            $table->json('cart_data')->nullable(); // Full cart snapshot
            $table->string('last_step')->nullable(); // checkout_started, details_entered, payment_page
            $table->string('utm_source')->nullable();
            $table->string('utm_campaign')->nullable();

            // Recovery tracking
            $table->string('recovery_token', 64)->unique();
            $table->enum('status', ['abandoned', 'reminded', 'recovered', 'expired'])->default('abandoned');
            $table->integer('reminder_count')->default(0);
            $table->timestamp('last_reminder_at')->nullable();
            $table->timestamp('recovered_at')->nullable();
            $table->foreignId('recovered_booking_id')->nullable()->constrained('bookings')->nullOnDelete();

            // Discount offered
            $table->boolean('discount_offered')->default(false);
            $table->decimal('discount_percent', 5, 2)->nullable();
            $table->string('discount_code')->nullable();
            $table->timestamp('discount_expires_at')->nullable();

            $table->timestamp('abandoned_at');
            $table->timestamps();

            $table->index(['tenant_id', 'status', 'abandoned_at']);
            $table->index(['email', 'status']);
            $table->index('recovery_token');
        });

        // Review requests - track review solicitation
        Schema::create('review_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('member_id')->nullable()->constrained()->nullOnDelete();

            // Request tracking
            $table->string('token', 64)->unique(); // For secure review links
            $table->enum('status', ['pending', 'sent', 'opened', 'completed', 'declined'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('reminder_count')->default(0);

            // Review data (internal rating)
            $table->tinyInteger('rating')->nullable(); // 1-5
            $table->text('feedback')->nullable();
            $table->json('feedback_tags')->nullable(); // ['great_instructor', 'beautiful_location', etc.]

            // External review tracking
            $table->boolean('posted_google')->default(false);
            $table->boolean('posted_tripadvisor')->default(false);
            $table->boolean('posted_facebook')->default(false);
            $table->string('google_review_url')->nullable();

            // Follow-up for negative reviews
            $table->boolean('requires_followup')->default(false);
            $table->foreignId('followed_up_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('followed_up_at')->nullable();
            $table->text('followup_notes')->nullable();
            $table->enum('resolution_status', ['pending', 'in_progress', 'resolved', 'closed'])->nullable();

            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index(['booking_id']);
            $table->index('token');
        });

        // Pre-trip automation messages
        Schema::create('automation_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');

            // Message type
            $table->enum('sequence', [
                'pre_trip',           // Pre-trip preparation
                'abandoned_cart',     // Cart recovery
                'review_request',     // Post-trip review
                'confirmation',       // Booking confirmation
                'reminder',           // General reminders
            ]);
            $table->string('message_type'); // e.g., '7_days_before', '1_hour_reminder'

            // Scheduling
            $table->timestamp('scheduled_for');
            $table->timestamp('sent_at')->nullable();
            $table->enum('status', ['scheduled', 'sent', 'failed', 'cancelled', 'skipped'])->default('scheduled');

            // Channel
            $table->enum('channel', ['email', 'sms', 'whatsapp', 'push'])->default('email');

            // Content (for custom messages)
            $table->string('subject')->nullable();
            $table->text('content')->nullable();

            // Tracking
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->string('failure_reason')->nullable();

            $table->timestamps();

            $table->index(['tenant_id', 'status', 'scheduled_for']);
            $table->index(['booking_id', 'sequence']);
        });

        // Automation settings per tenant
        Schema::create('automation_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');

            // Pre-trip sequence settings
            $table->boolean('pre_trip_enabled')->default(true);
            $table->json('pre_trip_schedule')->nullable(); // Custom schedule

            // Abandoned cart settings
            $table->boolean('abandoned_cart_enabled')->default(true);
            $table->integer('cart_abandon_minutes')->default(60); // Consider abandoned after X mins
            $table->integer('first_reminder_hours')->default(1);
            $table->integer('second_reminder_hours')->default(24);
            $table->integer('final_reminder_hours')->default(48);
            $table->boolean('offer_discount')->default(true);
            $table->decimal('discount_percent', 5, 2)->default(10);
            $table->integer('discount_on_reminder')->default(3); // Which reminder gets discount

            // Review request settings
            $table->boolean('review_request_enabled')->default(true);
            $table->integer('review_request_hours')->default(2); // Hours after trip
            $table->integer('review_reminder_days')->default(3); // Days for reminder
            $table->string('google_review_link')->nullable();
            $table->string('tripadvisor_link')->nullable();
            $table->string('facebook_page_link')->nullable();

            // Communication preferences
            $table->boolean('sms_enabled')->default(false);
            $table->boolean('whatsapp_enabled')->default(false);
            $table->string('whatsapp_number')->nullable();

            // Quiet hours (don't send during these times)
            $table->time('quiet_start')->default('21:00');
            $table->time('quiet_end')->default('08:00');
            $table->string('timezone')->default('UTC');

            $table->timestamps();

            $table->unique('tenant_id');
        });

        // Add tracking fields to bookings
        Schema::table('bookings', function (Blueprint $table) {
            // Pre-trip completion tracking
            $table->boolean('medical_form_completed')->default(false);
            $table->timestamp('medical_form_completed_at')->nullable();
            $table->boolean('waiver_signed')->default(false);
            $table->timestamp('waiver_signed_at')->nullable();
            $table->boolean('pre_trip_info_sent')->default(false);
            $table->boolean('check_in_reminder_sent')->default(false);

            // Post-trip tracking
            $table->boolean('review_requested')->default(false);
            $table->timestamp('review_requested_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'medical_form_completed', 'medical_form_completed_at',
                'waiver_signed', 'waiver_signed_at',
                'pre_trip_info_sent', 'check_in_reminder_sent',
                'review_requested', 'review_requested_at',
            ]);
        });

        Schema::dropIfExists('automation_settings');
        Schema::dropIfExists('automation_messages');
        Schema::dropIfExists('review_requests');
        Schema::dropIfExists('abandoned_carts');
    }
};
