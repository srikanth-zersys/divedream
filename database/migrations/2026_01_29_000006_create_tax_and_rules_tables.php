<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Comprehensive Tax & Business Rules System
     *
     * Industry Best Practices for Dive Shops:
     * - Multi-jurisdiction tax support (different rates by location)
     * - Tax-inclusive vs tax-exclusive pricing
     * - Product/service tax exemptions
     * - Tiered cancellation policies
     * - Certification and age requirements
     * - Weather cancellation rules
     */
    public function up(): void
    {
        // Tax Rates table - supports multiple jurisdictions
        Schema::create('tax_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name'); // e.g., "VAT", "Sales Tax", "GST"
            $table->string('code', 20)->nullable(); // e.g., "VAT-20", "GST"
            $table->decimal('rate', 5, 3); // Up to 99.999%
            $table->enum('type', ['percentage', 'fixed'])->default('percentage');
            $table->decimal('fixed_amount', 10, 2)->nullable(); // For fixed-amount taxes

            // Applicability
            $table->enum('applies_to', ['all', 'products', 'services', 'equipment_rental'])->default('all');
            $table->boolean('is_compound')->default(false); // Tax on tax
            $table->integer('priority')->default(0); // Order of application for compound taxes

            // Display options
            $table->boolean('included_in_price')->default(false); // Tax-inclusive pricing
            $table->boolean('show_on_invoice')->default(true);

            // Legal requirements
            $table->string('registration_number')->nullable(); // VAT/GST registration
            $table->string('jurisdiction')->nullable(); // Country/State/Region

            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['tenant_id', 'is_active']);
            $table->index(['tenant_id', 'location_id']);
        });

        // Tax exemptions - for B2B customers, certain products
        Schema::create('tax_exemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('tax_rate_id')->constrained()->onDelete('cascade');

            // What is exempt
            $table->string('exemptable_type'); // Member, Product, etc.
            $table->unsignedBigInteger('exemptable_id');

            // Exemption details
            $table->string('reason')->nullable();
            $table->string('exemption_certificate')->nullable(); // Document reference
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['exemptable_type', 'exemptable_id']);
        });

        // Business Rules - Configurable rules engine
        Schema::create('business_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();

            $table->string('rule_type'); // cancellation, refund, booking, safety, weather
            $table->string('name');
            $table->text('description')->nullable();

            // Rule configuration stored as JSON for flexibility
            $table->json('conditions'); // When the rule applies
            $table->json('actions'); // What happens when triggered

            $table->integer('priority')->default(0); // Higher = evaluated first
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['tenant_id', 'rule_type', 'is_active']);
        });

        // Cancellation Policies - Tiered, time-based
        Schema::create('cancellation_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['flexible', 'moderate', 'strict', 'custom'])->default('moderate');

            // Tiered refund schedule stored as JSON
            // Format: [{"hours_before": 72, "refund_percent": 100}, {"hours_before": 24, "refund_percent": 50}, ...]
            $table->json('refund_tiers');

            // No-show policy
            $table->decimal('no_show_fee_percent', 5, 2)->default(100);
            $table->boolean('allow_reschedule')->default(true);
            $table->integer('reschedule_fee_percent')->default(0);

            // Weather/Force Majeure
            $table->boolean('weather_cancellation_allowed')->default(true);
            $table->decimal('weather_refund_percent', 5, 2)->default(100);
            $table->text('weather_policy_text')->nullable();

            // Communication
            $table->text('customer_facing_text')->nullable(); // Shown to customers
            $table->text('internal_notes')->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);

            $table->timestamps();

            $table->index(['tenant_id', 'is_active']);
        });

        // Product Requirements - Certification, age, health
        Schema::create('product_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');

            $table->enum('requirement_type', [
                'certification',    // Diving certification required
                'age_minimum',      // Minimum age
                'age_maximum',      // Maximum age
                'health',           // Health requirements
                'experience',       // Experience level
                'equipment',        // Required equipment
                'documents',        // Required documents (ID, medical form)
                'skill',            // Skill requirements
                'physical',         // Physical requirements
            ]);

            // Requirement details
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('value'); // Flexible storage for requirement specifics

            // Enforcement
            $table->boolean('is_mandatory')->default(true);
            $table->boolean('can_override')->default(false); // Staff can override
            $table->boolean('requires_verification')->default(false); // Needs staff check
            $table->boolean('block_booking')->default(true); // Prevent booking if not met

            // Customer messaging
            $table->text('customer_message')->nullable();
            $table->text('verification_instructions')->nullable();

            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['product_id', 'requirement_type']);
        });

        // Certification Types - Standard diving certifications
        Schema::create('certification_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name'); // e.g., "Open Water Diver", "Advanced Open Water"
            $table->string('code', 50); // e.g., "PADI-OW", "SSI-AOW"
            $table->string('organization')->nullable(); // PADI, SSI, NAUI, etc.
            $table->integer('level')->default(1); // Hierarchy level
            $table->text('description')->nullable();

            // Depth limits
            $table->integer('max_depth_meters')->nullable();

            // Prerequisites
            $table->json('prerequisites')->nullable(); // Array of certification codes

            // Global or tenant-specific
            $table->boolean('is_global')->default(false);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
            $table->index('organization');
        });

        // Booking Rules - Cut-off times, capacity, etc.
        Schema::create('booking_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name');

            // Timing rules
            $table->integer('booking_cutoff_hours')->default(24); // Hours before activity
            $table->integer('max_advance_days')->default(90); // Max days in advance
            $table->time('same_day_cutoff_time')->nullable(); // e.g., 18:00 for next day

            // Capacity rules
            $table->integer('min_participants')->default(1);
            $table->integer('max_participants')->nullable();
            $table->boolean('allow_single_bookings')->default(true);
            $table->boolean('allow_group_bookings')->default(true);
            $table->integer('group_min_size')->default(6);

            // Overbooking
            $table->boolean('allow_overbooking')->default(false);
            $table->integer('overbooking_limit_percent')->default(0);
            $table->boolean('waitlist_enabled')->default(true);

            // Confirmation
            $table->boolean('auto_confirm')->default(true);
            $table->boolean('require_manual_review')->default(false);
            $table->json('require_review_conditions')->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['tenant_id', 'is_active']);
        });

        // Add tax fields to existing tables
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('tax_rate_id')->nullable()->after('tax_amount')->constrained()->nullOnDelete();
            $table->boolean('tax_exempt')->default(false)->after('tax_rate_id');
            $table->string('tax_exemption_reason')->nullable()->after('tax_exempt');
            $table->foreignId('cancellation_policy_id')->nullable()->after('cancellation_reason')->constrained()->nullOnDelete();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('cancellation_policy_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('tax_exempt')->default(false);
            $table->foreignId('default_tax_rate_id')->nullable()->constrained('tax_rates')->nullOnDelete();
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->string('tax_registration_number')->nullable();
            $table->string('legal_business_name')->nullable();
            $table->boolean('prices_include_tax')->default(false);
            $table->foreignId('default_cancellation_policy_id')->nullable()->constrained('cancellation_policies')->nullOnDelete();
        });

        // Seed standard certification types
        $this->seedCertificationTypes();
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropConstrainedForeignId('default_cancellation_policy_id');
            $table->dropColumn(['tax_registration_number', 'legal_business_name', 'prices_include_tax']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cancellation_policy_id');
            $table->dropConstrainedForeignId('default_tax_rate_id');
            $table->dropColumn('tax_exempt');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('tax_rate_id');
            $table->dropConstrainedForeignId('cancellation_policy_id');
            $table->dropColumn(['tax_exempt', 'tax_exemption_reason']);
        });

        Schema::dropIfExists('booking_rules');
        Schema::dropIfExists('certification_types');
        Schema::dropIfExists('product_requirements');
        Schema::dropIfExists('cancellation_policies');
        Schema::dropIfExists('business_rules');
        Schema::dropIfExists('tax_exemptions');
        Schema::dropIfExists('tax_rates');
    }

    private function seedCertificationTypes(): void
    {
        $certifications = [
            // PADI Certifications
            ['name' => 'PADI Open Water Diver', 'code' => 'PADI-OW', 'organization' => 'PADI', 'level' => 1, 'max_depth_meters' => 18, 'is_global' => true],
            ['name' => 'PADI Advanced Open Water', 'code' => 'PADI-AOW', 'organization' => 'PADI', 'level' => 2, 'max_depth_meters' => 30, 'is_global' => true, 'prerequisites' => ['PADI-OW']],
            ['name' => 'PADI Rescue Diver', 'code' => 'PADI-RD', 'organization' => 'PADI', 'level' => 3, 'max_depth_meters' => 30, 'is_global' => true, 'prerequisites' => ['PADI-AOW']],
            ['name' => 'PADI Divemaster', 'code' => 'PADI-DM', 'organization' => 'PADI', 'level' => 4, 'max_depth_meters' => 40, 'is_global' => true, 'prerequisites' => ['PADI-RD']],
            ['name' => 'PADI Instructor', 'code' => 'PADI-INST', 'organization' => 'PADI', 'level' => 5, 'max_depth_meters' => 40, 'is_global' => true, 'prerequisites' => ['PADI-DM']],
            ['name' => 'PADI Nitrox Diver', 'code' => 'PADI-EAN', 'organization' => 'PADI', 'level' => 2, 'is_global' => true],
            ['name' => 'PADI Deep Diver', 'code' => 'PADI-DEEP', 'organization' => 'PADI', 'level' => 2, 'max_depth_meters' => 40, 'is_global' => true, 'prerequisites' => ['PADI-AOW']],

            // SSI Certifications
            ['name' => 'SSI Open Water Diver', 'code' => 'SSI-OW', 'organization' => 'SSI', 'level' => 1, 'max_depth_meters' => 18, 'is_global' => true],
            ['name' => 'SSI Advanced Adventurer', 'code' => 'SSI-AA', 'organization' => 'SSI', 'level' => 2, 'max_depth_meters' => 30, 'is_global' => true],
            ['name' => 'SSI Divemaster', 'code' => 'SSI-DM', 'organization' => 'SSI', 'level' => 4, 'max_depth_meters' => 40, 'is_global' => true],

            // NAUI Certifications
            ['name' => 'NAUI Scuba Diver', 'code' => 'NAUI-SD', 'organization' => 'NAUI', 'level' => 1, 'max_depth_meters' => 18, 'is_global' => true],
            ['name' => 'NAUI Advanced Scuba Diver', 'code' => 'NAUI-ASD', 'organization' => 'NAUI', 'level' => 2, 'max_depth_meters' => 40, 'is_global' => true],

            // Generic/Equivalent
            ['name' => 'Discover Scuba (No Certification)', 'code' => 'DSD', 'organization' => null, 'level' => 0, 'max_depth_meters' => 12, 'is_global' => true],
            ['name' => 'Freediver Level 1', 'code' => 'FREEDIVER-1', 'organization' => null, 'level' => 1, 'is_global' => true],
            ['name' => 'Freediver Level 2', 'code' => 'FREEDIVER-2', 'organization' => null, 'level' => 2, 'is_global' => true],
        ];

        foreach ($certifications as $cert) {
            $prerequisites = $cert['prerequisites'] ?? null;
            unset($cert['prerequisites']);

            \DB::table('certification_types')->insert([
                ...$cert,
                'prerequisites' => $prerequisites ? json_encode($prerequisites) : null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
};
