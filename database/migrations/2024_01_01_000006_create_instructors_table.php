<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Link to user account

            // Basic Info
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('avatar')->nullable();
            $table->text('bio')->nullable();
            $table->json('languages')->nullable(); // Languages spoken

            // Employment
            $table->enum('employment_type', ['full_time', 'part_time', 'contractor', 'freelance'])->default('full_time');
            $table->date('hire_date')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->decimal('daily_rate', 10, 2)->nullable();
            $table->decimal('commission_percentage', 5, 2)->nullable();

            // Certifications (instructor-level)
            $table->string('instructor_number')->nullable(); // PADI/SSI instructor number
            $table->string('instructor_agency')->nullable();
            $table->string('instructor_level')->nullable(); // OWSI, MSDT, IDC Staff, Course Director
            $table->date('instructor_cert_expiry')->nullable();
            $table->json('teaching_certifications')->nullable(); // What they can teach

            // Specialty certifications
            $table->json('specialty_certifications')->nullable();

            // Insurance
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_policy_number')->nullable();
            $table->date('insurance_expiry')->nullable();

            // Emergency Contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();

            // Color for calendar display
            $table->string('calendar_color', 7)->default('#3B82F6');

            // Settings
            $table->json('availability_settings')->nullable();
            $table->json('notification_preferences')->nullable();

            $table->enum('status', ['active', 'inactive', 'on_leave'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
        });

        // Instructor-Location assignment
        Schema::create('instructor_location', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->unique(['instructor_id', 'location_id']);
        });

        // Instructor availability
        Schema::create('instructor_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();

            // Recurring availability
            $table->enum('type', ['recurring', 'override', 'time_off'])->default('recurring');
            $table->tinyInteger('day_of_week')->nullable(); // 0=Sunday, 6=Saturday (for recurring)
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            // For specific dates (override/time_off)
            $table->date('date')->nullable();
            $table->boolean('is_available')->default(true);
            $table->string('reason')->nullable();

            $table->timestamps();

            $table->index(['instructor_id', 'type']);
            $table->index(['instructor_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_availabilities');
        Schema::dropIfExists('instructor_location');
        Schema::dropIfExists('instructors');
    }
};
