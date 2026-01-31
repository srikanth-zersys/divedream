<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Boats
        Schema::create('boats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('registration_number')->nullable();
            $table->string('type')->nullable(); // Speedboat, Catamaran, etc.

            // Capacity
            $table->integer('max_passengers');
            $table->integer('max_divers');
            $table->integer('crew_count')->default(1);

            // Specifications
            $table->decimal('length_meters', 5, 2)->nullable();
            $table->integer('engine_count')->default(1);
            $table->string('engine_type')->nullable();

            // Amenities
            $table->json('amenities')->nullable(); // Toilet, shower, sun deck, etc.
            $table->boolean('has_toilet')->default(false);
            $table->boolean('has_shower')->default(false);
            $table->boolean('has_kitchen')->default(false);
            $table->boolean('has_air_conditioning')->default(false);

            // Safety equipment
            $table->json('safety_equipment')->nullable();
            $table->date('last_safety_inspection')->nullable();
            $table->date('next_safety_inspection')->nullable();

            // Insurance
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_policy_number')->nullable();
            $table->date('insurance_expiry')->nullable();

            // Media
            $table->string('image')->nullable();
            $table->json('gallery')->nullable();

            // Pricing (for charters)
            $table->decimal('charter_price_half_day', 10, 2)->nullable();
            $table->decimal('charter_price_full_day', 10, 2)->nullable();
            $table->boolean('available_for_charter')->default(false);

            $table->text('notes')->nullable();
            $table->enum('status', ['active', 'maintenance', 'retired'])->default('active');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'location_id', 'status']);
        });

        // Dive Sites
        Schema::create('dive_sites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();

            // Location
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('distance_from_shore_minutes')->nullable();

            // Dive characteristics
            $table->integer('min_depth_meters')->nullable();
            $table->integer('max_depth_meters')->nullable();
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced', 'expert'])->default('intermediate');
            $table->string('minimum_certification')->nullable();
            $table->json('dive_types')->nullable(); // Reef, wreck, wall, drift, night, etc.
            $table->json('marine_life')->nullable();
            $table->enum('current_strength', ['none', 'weak', 'moderate', 'strong', 'variable'])->default('moderate');
            $table->enum('visibility', ['poor', 'moderate', 'good', 'excellent', 'variable'])->default('good');

            // Best conditions
            $table->json('best_months')->nullable();
            $table->json('best_conditions')->nullable();

            // Media
            $table->string('image')->nullable();
            $table->json('gallery')->nullable();
            $table->string('video_url')->nullable();

            // Safety
            $table->text('hazards')->nullable();
            $table->text('emergency_notes')->nullable();

            // Ratings
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'location_id', 'slug']);
            $table->index(['tenant_id', 'location_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dive_sites');
        Schema::dropIfExists('boats');
    }
};
