<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('avatar')->nullable()->after('email');
            $table->string('job_title')->nullable();
            $table->text('bio')->nullable();
            $table->json('notification_preferences')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();

            $table->index('tenant_id');
        });

        // Pivot table for user-location access
        Schema::create('location_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->unique(['location_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_user');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn([
                'tenant_id',
                'avatar',
                'job_title',
                'bio',
                'notification_preferences',
                'last_login_at',
                'last_login_ip',
            ]);
        });
    }
};
