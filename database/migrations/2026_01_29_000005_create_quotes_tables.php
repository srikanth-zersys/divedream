<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Quote/Proposal system for B2B and group bookings
     */
    public function up(): void
    {
        // Main quotes table
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            // Quote identification
            $table->string('quote_number')->unique();
            $table->enum('status', [
                'draft',
                'sent',
                'viewed',
                'accepted',
                'rejected',
                'expired',
                'converted'
            ])->default('draft');

            // Customer information
            $table->enum('customer_type', [
                'individual',
                'corporate',
                'travel_agent',
                'group',
                'resort',
                'school'
            ])->default('individual');
            $table->string('company_name')->nullable();
            $table->string('contact_name');
            $table->string('contact_email');
            $table->string('contact_phone')->nullable();

            // Quote details
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('valid_until');
            $table->json('proposed_dates')->nullable(); // Array of possible dates
            $table->integer('expected_participants')->default(1);

            // Pricing
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('USD');

            // Payment terms
            $table->boolean('deposit_required')->default(false);
            $table->decimal('deposit_percent', 5, 2)->default(0);
            $table->decimal('deposit_amount', 12, 2)->default(0);
            $table->text('payment_terms')->nullable();

            // Terms and policies
            $table->text('terms_and_conditions')->nullable();
            $table->text('cancellation_policy')->nullable();
            $table->text('notes')->nullable(); // Internal notes
            $table->text('customer_notes')->nullable(); // Customer-visible notes

            // Tracking
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('viewed_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('expires_at')->nullable();

            // Conversion tracking
            $table->foreignId('converted_booking_id')->nullable()->constrained('bookings')->nullOnDelete();
            $table->timestamp('converted_at')->nullable();

            // Token for public access
            $table->string('access_token', 64)->unique();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'created_at']);
            $table->index('contact_email');
            $table->index('access_token');
        });

        // Quote line items
        Schema::create('quote_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();

            // Item details
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->decimal('total_price', 12, 2);

            // Metadata
            $table->text('notes')->nullable();
            $table->integer('sort_order')->default(0);

            $table->timestamps();

            $table->index(['quote_id', 'sort_order']);
        });

        // Quote activity/audit log
        Schema::create('quote_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('type'); // created, updated, sent, viewed, accepted, rejected, etc.
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Additional data like old/new values

            // Tracking info
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();

            $table->timestamps();

            $table->index(['quote_id', 'created_at']);
            $table->index(['quote_id', 'type']);
        });

        // Quote templates for quick creation
        Schema::create('quote_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');

            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('customer_type', [
                'individual',
                'corporate',
                'travel_agent',
                'group',
                'resort',
                'school'
            ])->nullable();

            // Default content
            $table->string('default_title')->nullable();
            $table->text('default_description')->nullable();
            $table->integer('default_validity_days')->default(14);
            $table->text('default_terms')->nullable();
            $table->text('default_cancellation_policy')->nullable();

            // Default pricing
            $table->decimal('default_discount_percent', 5, 2)->default(0);
            $table->boolean('default_deposit_required')->default(false);
            $table->decimal('default_deposit_percent', 5, 2)->default(0);

            // Template items (stored as JSON for flexibility)
            $table->json('default_items')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['tenant_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quote_templates');
        Schema::dropIfExists('quote_activities');
        Schema::dropIfExists('quote_items');
        Schema::dropIfExists('quotes');
    }
};
