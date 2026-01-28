<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Documents storage
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();

            // Polymorphic relationship
            $table->string('documentable_type');
            $table->unsignedBigInteger('documentable_id');

            $table->string('name');
            $table->string('type'); // waiver, medical_form, certification_card, insurance, etc.
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');

            // For signed documents
            $table->boolean('requires_signature')->default(false);
            $table->boolean('is_signed')->default(false);
            $table->timestamp('signed_at')->nullable();
            $table->string('signature_ip')->nullable();
            $table->text('signature_data')->nullable(); // Base64 encoded signature

            // Expiry
            $table->date('expiry_date')->nullable();

            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['documentable_type', 'documentable_id']);
            $table->index(['tenant_id', 'type']);
        });

        // Waivers/Legal documents templates
        Schema::create('waiver_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name');
            $table->string('type'); // liability_waiver, medical_form, terms_conditions, etc.
            $table->string('language', 5)->default('en');
            $table->longText('content');
            $table->boolean('is_required')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('version')->default(1);

            $table->timestamps();
        });

        // Activity log
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // What happened
            $table->string('action'); // created, updated, deleted, viewed, etc.
            $table->string('description')->nullable();

            // What was affected
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();

            // Changes
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            // Context
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();

            $table->timestamps();

            $table->index(['tenant_id', 'created_at']);
            $table->index(['subject_type', 'subject_id']);
        });

        // Notifications
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();

            // Recipient
            $table->string('recipient_type'); // member, user, booking
            $table->unsignedBigInteger('recipient_id');
            $table->string('recipient_email')->nullable();
            $table->string('recipient_phone')->nullable();

            // Notification details
            $table->string('type'); // booking_confirmation, reminder, etc.
            $table->enum('channel', ['email', 'sms', 'push'])->default('email');
            $table->string('subject')->nullable();
            $table->text('content')->nullable();

            // Status
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed', 'bounced'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();

            // Provider info
            $table->string('provider')->nullable();
            $table->string('provider_message_id')->nullable();

            $table->timestamps();

            $table->index(['tenant_id', 'type']);
            $table->index(['recipient_type', 'recipient_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('waiver_templates');
        Schema::dropIfExists('documents');
    }
};
