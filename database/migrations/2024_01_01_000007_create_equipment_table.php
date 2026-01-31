<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Equipment categories
        Schema::create('equipment_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // BCD, Regulator, Wetsuit, Fins, Mask, Tank, etc.
            $table->string('slug');
            $table->text('description')->nullable();
            $table->boolean('track_sizes')->default(false);
            $table->json('available_sizes')->nullable(); // XS, S, M, L, XL, etc.
            $table->boolean('requires_service')->default(false);
            $table->integer('service_interval_months')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Equipment items
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->foreignId('equipment_category_id')->constrained()->cascadeOnDelete();

            // Identification
            $table->string('name'); // BCD #1, Wetsuit Medium #3
            $table->string('code')->nullable(); // Internal tracking code
            $table->string('serial_number')->nullable();
            $table->string('barcode')->nullable();

            // Details
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('size')->nullable();
            $table->string('color')->nullable();
            $table->year('manufacture_year')->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 10, 2)->nullable();

            // Rental pricing
            $table->decimal('rental_price_per_dive', 10, 2)->nullable();
            $table->decimal('rental_price_per_day', 10, 2)->nullable();
            $table->boolean('is_available_for_rental')->default(true);

            // Condition & Maintenance
            $table->enum('condition', ['excellent', 'good', 'fair', 'poor', 'retired'])->default('good');
            $table->date('last_service_date')->nullable();
            $table->date('next_service_due')->nullable();
            $table->integer('total_uses')->default(0);
            $table->text('notes')->nullable();

            // Status
            $table->enum('status', ['available', 'in_use', 'maintenance', 'retired'])->default('available');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'location_id', 'status']);
            $table->index(['equipment_category_id', 'size']);
        });

        // Equipment maintenance log
        Schema::create('equipment_maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('type', ['inspection', 'service', 'repair', 'replacement'])->default('service');
            $table->date('performed_at');
            $table->date('next_due_date')->nullable();
            $table->text('description')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->string('service_provider')->nullable();
            $table->json('parts_replaced')->nullable();
            $table->json('attachments')->nullable(); // Service receipts, etc.

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment_maintenance_logs');
        Schema::dropIfExists('equipment');
        Schema::dropIfExists('equipment_categories');
    }
};
