<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();

            // Contact
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('whatsapp')->nullable();

            // Address
            $table->string('address_line_1')->nullable();
            $table->string('address_line_2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country', 2)->default('US');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Operating Hours (JSON for flexibility)
            $table->json('operating_hours')->nullable();

            // Media
            $table->string('logo')->nullable();
            $table->json('images')->nullable();

            // Booking Settings
            $table->integer('default_booking_buffer_minutes')->default(30);
            $table->integer('max_advance_booking_days')->default(90);
            $table->integer('min_advance_booking_hours')->default(24);
            $table->boolean('require_deposit')->default(false);
            $table->decimal('deposit_percentage', 5, 2)->default(25.00);
            $table->boolean('allow_reschedule')->default(true);
            $table->integer('reschedule_hours_before')->default(48);
            $table->boolean('allow_cancellation')->default(true);
            $table->integer('cancellation_hours_before')->default(48);
            $table->decimal('cancellation_fee_percentage', 5, 2)->default(0);

            // Safety
            $table->boolean('require_waiver')->default(true);
            $table->boolean('require_medical_form')->default(true);
            $table->text('waiver_text')->nullable();
            $table->text('medical_form_text')->nullable();

            // Settings
            $table->json('settings')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
