<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Master list of certification types
        Schema::create('certification_types', function (Blueprint $table) {
            $table->id();
            $table->string('agency'); // PADI, SSI, NAUI, BSAC, etc.
            $table->string('name'); // Open Water Diver, Advanced Open Water, etc.
            $table->string('code')->nullable(); // OWD, AOW, etc.
            $table->text('description')->nullable();
            $table->integer('minimum_age')->nullable();
            $table->integer('minimum_dives')->nullable();
            $table->string('prerequisite_code')->nullable(); // Required cert before this
            $table->boolean('is_instructor_level')->default(false);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['agency', 'code']);
        });

        // Member certifications
        Schema::create('member_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('certification_type_id')->nullable()->constrained()->nullOnDelete();

            // If cert type not in our list
            $table->string('custom_agency')->nullable();
            $table->string('custom_name')->nullable();

            $table->string('certification_number')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable(); // Some certs expire

            // Verification
            $table->enum('verification_status', ['pending', 'verified', 'rejected', 'expired'])->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('verification_notes')->nullable();

            // Card image
            $table->string('card_front_image')->nullable();
            $table->string('card_back_image')->nullable();

            $table->timestamps();

            $table->index(['member_id', 'verification_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_certifications');
        Schema::dropIfExists('certification_types');
    }
};
