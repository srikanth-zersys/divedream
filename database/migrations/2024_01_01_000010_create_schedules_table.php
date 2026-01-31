<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Scheduled trips/activities (the actual calendar events)
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();

            // Basic Info
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', [
                'fun_dive',
                'course_session',
                'discover_scuba',
                'snorkeling',
                'private_trip',
                'boat_charter',
                'other'
            ])->default('fun_dive');

            // Date & Time
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->integer('check_in_minutes_before')->default(30);

            // Capacity
            $table->integer('max_participants');
            $table->integer('booked_count')->default(0);
            $table->integer('min_participants')->default(1);

            // Resources
            $table->foreignId('boat_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('dive_site_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('secondary_dive_site_id')->nullable()->constrained('dive_sites')->nullOnDelete();

            // Pricing (can override product price)
            $table->decimal('price_override', 10, 2)->nullable();

            // Lead instructor
            $table->foreignId('lead_instructor_id')->nullable()->constrained('instructors')->nullOnDelete();

            // Status
            $table->enum('status', [
                'scheduled',
                'confirmed',
                'in_progress',
                'completed',
                'cancelled',
                'weather_cancelled'
            ])->default('scheduled');
            $table->text('cancellation_reason')->nullable();

            // Weather & Conditions
            $table->json('weather_conditions')->nullable();
            $table->text('briefing_notes')->nullable();
            $table->text('post_trip_notes')->nullable();

            // Visibility settings
            $table->boolean('is_public')->default(true); // Show on booking page
            $table->boolean('allow_online_booking')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'location_id', 'date']);
            $table->index(['date', 'status']);
        });

        // Instructor assignments to schedules
        Schema::create('schedule_instructor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('instructor_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['lead', 'assistant', 'divemaster', 'trainee'])->default('assistant');
            $table->timestamps();

            $table->unique(['schedule_id', 'instructor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_instructor');
        Schema::dropIfExists('schedules');
    }
};
