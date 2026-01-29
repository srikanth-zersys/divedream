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
        // Lead sources - track where leads come from
        Schema::create('lead_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g., "Google Ads", "Facebook", "Referral"
            $table->string('type'); // paid, organic, referral, direct, partner
            $table->string('channel')->nullable(); // search, social, email, display
            $table->decimal('cost_per_lead', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('tracking_params')->nullable(); // UTM parameters to match
            $table->timestamps();

            $table->index(['tenant_id', 'type']);
            $table->index(['tenant_id', 'is_active']);
        });

        // Main leads table
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('lead_source_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // If converted to user
            $table->foreignId('referred_by_id')->nullable()->constrained('leads')->onDelete('set null');

            // Contact info
            $table->string('email');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('country')->nullable();
            $table->string('city')->nullable();

            // Lead status and qualification
            $table->string('status')->default('new'); // new, engaged, qualified, converted, lost
            $table->string('qualification')->default('unknown'); // unknown, cold, warm, hot
            $table->integer('score')->default(0); // Calculated lead score
            $table->json('score_breakdown')->nullable(); // Detailed scoring factors

            // Source tracking
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();
            $table->string('utm_term')->nullable();
            $table->string('referrer_url')->nullable();
            $table->string('landing_page')->nullable();

            // Engagement tracking
            $table->integer('page_views')->default(0);
            $table->integer('email_opens')->default(0);
            $table->integer('email_clicks')->default(0);
            $table->integer('form_submissions')->default(0);
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('first_visit_at')->nullable();

            // Interest indicators
            $table->json('interested_products')->nullable(); // Product IDs they viewed
            $table->json('interested_locations')->nullable(); // Location IDs they viewed
            $table->string('certification_level')->nullable(); // Self-reported
            $table->integer('experience_dives')->nullable(); // Self-reported

            // Conversion tracking
            $table->foreignId('converted_booking_id')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->decimal('conversion_value', 10, 2)->nullable();

            // Nurture sequence
            $table->string('nurture_sequence')->nullable(); // Current sequence
            $table->integer('nurture_step')->default(0);
            $table->timestamp('nurture_paused_until')->nullable();
            $table->boolean('unsubscribed')->default(false);
            $table->timestamp('unsubscribed_at')->nullable();

            // Additional data
            $table->json('custom_fields')->nullable();
            $table->json('tags')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'email']);
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'qualification']);
            $table->index(['tenant_id', 'score']);
            $table->index(['tenant_id', 'nurture_sequence']);
            $table->index(['tenant_id', 'created_at']);
            $table->index('utm_source');
            $table->index('utm_campaign');
        });

        // Lead activities - track all interactions
        Schema::create('lead_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->onDelete('cascade');
            $table->string('type'); // page_view, email_open, email_click, form_submit, product_view, etc.
            $table->string('description')->nullable();
            $table->json('properties')->nullable(); // Additional data about the activity
            $table->integer('score_change')->default(0); // Points gained/lost
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['lead_id', 'type']);
            $table->index(['lead_id', 'created_at']);
        });

        // Referral program
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('referrer_id')->constrained('leads')->onDelete('cascade'); // The person referring
            $table->foreignId('referred_lead_id')->nullable()->constrained('leads')->onDelete('set null');
            $table->foreignId('referred_booking_id')->nullable(); // If directly to booking

            $table->string('referral_code')->unique();
            $table->string('status')->default('pending'); // pending, clicked, converted, rewarded, expired

            // Reward tracking
            $table->string('referrer_reward_type')->nullable(); // discount, credit, cash
            $table->decimal('referrer_reward_value', 10, 2)->nullable();
            $table->string('referred_reward_type')->nullable(); // discount for the new customer
            $table->decimal('referred_reward_value', 10, 2)->nullable();
            $table->boolean('referrer_rewarded')->default(false);
            $table->timestamp('referrer_rewarded_at')->nullable();

            // Tracking
            $table->integer('click_count')->default(0);
            $table->timestamp('first_clicked_at')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->decimal('conversion_value', 10, 2)->nullable();

            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'referral_code']);
            $table->index(['tenant_id', 'referrer_id']);
            $table->index(['tenant_id', 'status']);
        });

        // Referral program settings per tenant
        Schema::create('referral_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');

            $table->boolean('is_enabled')->default(false);

            // Referrer rewards
            $table->string('referrer_reward_type')->default('credit'); // discount, credit, cash
            $table->decimal('referrer_reward_value', 10, 2)->default(20);
            $table->integer('referrer_reward_percent')->nullable(); // If percentage-based
            $table->decimal('referrer_max_reward', 10, 2)->nullable();

            // Referred customer rewards
            $table->string('referred_reward_type')->default('discount'); // discount, credit
            $table->decimal('referred_reward_value', 10, 2)->default(15);
            $table->integer('referred_reward_percent')->nullable();

            // Requirements
            $table->decimal('min_booking_value', 10, 2)->default(0);
            $table->integer('referral_expiry_days')->default(30);
            $table->integer('max_referrals_per_customer')->nullable();
            $table->boolean('require_booking_complete')->default(true); // Wait for trip completion

            // Messages
            $table->string('share_message')->nullable();
            $table->text('terms_and_conditions')->nullable();

            $table->timestamps();

            $table->unique('tenant_id');
        });

        // Nurture sequences configuration
        Schema::create('nurture_sequences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');

            $table->string('name');
            $table->string('slug')->unique();
            $table->string('trigger'); // signup, abandoned_browse, post_booking, birthday, re_engagement
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);

            // Targeting
            $table->json('target_segments')->nullable(); // Lead qualifications to target
            $table->json('exclude_segments')->nullable(); // Lead qualifications to exclude

            $table->integer('priority')->default(0); // Higher = takes precedence
            $table->timestamps();

            $table->index(['tenant_id', 'trigger']);
            $table->index(['tenant_id', 'is_active']);
        });

        // Individual steps in nurture sequences
        Schema::create('nurture_sequence_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nurture_sequence_id')->constrained()->onDelete('cascade');

            $table->integer('step_number');
            $table->string('name');
            $table->string('type')->default('email'); // email, sms, wait, condition

            // Timing
            $table->integer('delay_days')->default(0);
            $table->integer('delay_hours')->default(0);
            $table->string('send_time')->nullable(); // Preferred time of day (HH:MM)
            $table->json('send_days')->nullable(); // Days of week to send [1,2,3,4,5]

            // Email content
            $table->string('email_template')->nullable();
            $table->string('email_subject')->nullable();
            $table->string('email_preview')->nullable();

            // Conditions for branching
            $table->json('conditions')->nullable(); // e.g., if opened previous, if score > X
            $table->integer('branch_to_step')->nullable(); // Skip to step if condition met

            // Goals
            $table->string('goal_action')->nullable(); // booking, page_view, etc.
            $table->boolean('end_on_goal')->default(true);

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['nurture_sequence_id', 'step_number']);
        });

        // Lead scoring rules
        Schema::create('lead_scoring_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');

            $table->string('name');
            $table->string('category'); // engagement, profile, behavior, decay
            $table->string('event_type'); // page_view, email_open, form_submit, etc.

            $table->integer('points'); // Can be negative for decay
            $table->integer('max_points_per_day')->nullable(); // Limit daily scoring

            // Conditions
            $table->json('conditions')->nullable(); // e.g., page contains "pricing"
            $table->boolean('one_time')->default(false); // Only score once

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['tenant_id', 'event_type']);
            $table->index(['tenant_id', 'is_active']);
        });

        // Add lead tracking to bookings
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('lead_id')->nullable()->after('user_id');
            $table->string('referral_code')->nullable()->after('lead_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['lead_id', 'referral_code']);
        });

        Schema::dropIfExists('lead_scoring_rules');
        Schema::dropIfExists('nurture_sequence_steps');
        Schema::dropIfExists('nurture_sequences');
        Schema::dropIfExists('referral_settings');
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('lead_activities');
        Schema::dropIfExists('leads');
        Schema::dropIfExists('lead_sources');
    }
};
