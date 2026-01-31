<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Products (Dives, Courses, Experiences)
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();

            // Basic Info
            $table->string('name');
            $table->string('slug');
            $table->text('short_description')->nullable();
            $table->text('description')->nullable();

            // Type
            $table->enum('type', [
                'fun_dive',
                'course',
                'discover_scuba',
                'snorkeling',
                'private_trip',
                'boat_charter',
                'package',
                'add_on'
            ])->default('fun_dive');

            // Categorization
            $table->string('category')->nullable();
            $table->json('tags')->nullable();

            // Pricing
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->enum('price_type', ['per_person', 'per_group', 'flat_rate'])->default('per_person');
            $table->integer('min_participants')->default(1);
            $table->integer('max_participants')->nullable();

            // Duration
            $table->integer('duration_minutes')->nullable();
            $table->integer('duration_days')->nullable(); // For multi-day courses

            // Requirements
            $table->string('minimum_certification')->nullable();
            $table->integer('minimum_age')->nullable();
            $table->integer('minimum_dives')->nullable();
            $table->boolean('requires_medical_clearance')->default(false);
            $table->text('prerequisites')->nullable();

            // What's included
            $table->json('includes')->nullable(); // Equipment, lunch, transport, etc.
            $table->json('excludes')->nullable();
            $table->boolean('equipment_included')->default(true);

            // Scheduling
            $table->json('available_days')->nullable(); // Which days this is offered
            $table->json('available_times')->nullable();
            $table->integer('booking_buffer_hours')->nullable();
            $table->integer('cancellation_hours')->nullable();

            // For courses
            $table->json('curriculum')->nullable();
            $table->integer('pool_sessions')->nullable();
            $table->integer('open_water_dives')->nullable();
            $table->string('certification_issued')->nullable();

            // Media
            $table->string('image')->nullable();
            $table->json('gallery')->nullable();

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            // Display
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('show_on_website')->default(true);

            $table->enum('status', ['active', 'draft', 'archived'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'slug']);
            $table->index(['tenant_id', 'type', 'status']);
        });

        // Product-Location availability
        Schema::create('location_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();

            // Location-specific pricing override
            $table->decimal('price_override', 10, 2)->nullable();
            $table->boolean('is_available')->default(true);
            $table->json('available_times_override')->nullable();

            $table->timestamps();

            $table->unique(['location_id', 'product_id']);
        });

        // Product add-ons
        Schema::create('product_add_ons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('add_on_product_id')->constrained('products')->cascadeOnDelete();
            $table->decimal('price_override', 10, 2)->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->unique(['product_id', 'add_on_product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_add_ons');
        Schema::dropIfExists('location_product');
        Schema::dropIfExists('products');
    }
};
