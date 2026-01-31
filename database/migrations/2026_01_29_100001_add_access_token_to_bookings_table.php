<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\Booking;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('access_token', 64)->unique()->nullable()->after('booking_number');
        });

        // Generate access tokens for existing bookings
        Booking::whereNull('access_token')->each(function ($booking) {
            $booking->update(['access_token' => Str::random(64)]);
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('access_token');
        });
    }
};
