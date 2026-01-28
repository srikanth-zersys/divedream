<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Optional linked user account

            // Basic Info
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('whatsapp')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])->nullable();
            $table->string('nationality')->nullable();
            $table->string('preferred_language', 5)->default('en');

            // Address
            $table->string('address_line_1')->nullable();
            $table->string('address_line_2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country', 2)->nullable();

            // Emergency Contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relationship')->nullable();

            // Medical Info
            $table->boolean('has_medical_conditions')->default(false);
            $table->text('medical_conditions')->nullable();
            $table->text('medications')->nullable();
            $table->text('allergies')->nullable();
            $table->enum('medical_clearance_status', ['not_required', 'pending', 'approved', 'expired'])->default('not_required');
            $table->date('medical_clearance_date')->nullable();
            $table->date('medical_clearance_expiry')->nullable();

            // Diving Experience
            $table->integer('total_dives')->default(0);
            $table->date('last_dive_date')->nullable();
            $table->text('diving_notes')->nullable();

            // Equipment Preferences
            $table->string('wetsuit_size')->nullable();
            $table->string('bcd_size')->nullable();
            $table->string('fin_size')->nullable();
            $table->string('mask_prescription')->nullable();
            $table->boolean('owns_equipment')->default(false);
            $table->json('owned_equipment')->nullable();

            // Documents
            $table->boolean('waiver_signed')->default(false);
            $table->timestamp('waiver_signed_at')->nullable();
            $table->string('waiver_ip')->nullable();

            // Marketing
            $table->boolean('marketing_consent')->default(false);
            $table->string('referral_source')->nullable();

            // Internal
            $table->text('internal_notes')->nullable();
            $table->json('tags')->nullable();
            $table->enum('status', ['active', 'inactive', 'blacklisted'])->default('active');

            // Stripe
            $table->string('stripe_customer_id')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'email']);
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'last_name', 'first_name']);
        });

        // Track which locations a member has visited
        Schema::create('location_member', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->timestamp('first_visit_at')->nullable();
            $table->timestamp('last_visit_at')->nullable();
            $table->integer('visit_count')->default(0);
            $table->timestamps();

            $table->unique(['location_id', 'member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_member');
        Schema::dropIfExists('members');
    }
};
