<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Location;
use App\Models\Member;
use App\Models\Schedule;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingCheckInOutTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;
    protected User $user;
    protected Location $location;
    protected Member $member;
    protected Schedule $schedule;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->location = Location::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->member = Member::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->schedule = Schedule::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'date' => now()->addDay(),
        ]);
    }

    public function test_user_can_check_in_confirmed_booking(): void
    {
        $booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'schedule_id' => $this->schedule->id,
            'member_id' => $this->member->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('admin.bookings.check-in', $booking));

        $response->assertRedirect();
        $booking->refresh();

        $this->assertEquals('checked_in', $booking->status);
        $this->assertNotNull($booking->checked_in_at);
    }

    public function test_cannot_check_in_pending_booking(): void
    {
        $booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'schedule_id' => $this->schedule->id,
            'member_id' => $this->member->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('admin.bookings.check-in', $booking));

        // Should fail or have error - pending bookings need confirmation first
        $booking->refresh();
        $this->assertNotEquals('checked_in', $booking->status);
    }

    public function test_user_can_check_out_checked_in_booking(): void
    {
        $booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'schedule_id' => $this->schedule->id,
            'member_id' => $this->member->id,
            'status' => 'checked_in',
            'checked_in_at' => now()->subHours(2),
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('admin.bookings.check-out', $booking));

        $response->assertRedirect();
        $booking->refresh();

        $this->assertEquals('completed', $booking->status);
    }

    public function test_cannot_check_out_confirmed_booking(): void
    {
        $booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'schedule_id' => $this->schedule->id,
            'member_id' => $this->member->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('admin.bookings.check-out', $booking));

        // Should fail - booking must be checked in first
        $booking->refresh();
        $this->assertNotEquals('completed', $booking->status);
    }

    public function test_booking_cancellation_frees_schedule_spots(): void
    {
        $booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'schedule_id' => $this->schedule->id,
            'member_id' => $this->member->id,
            'participant_count' => 5,
            'status' => 'confirmed',
        ]);

        // Update schedule booked count
        $this->schedule->update(['booked_count' => 5]);

        $response = $this->actingAs($this->user)
            ->post(route('admin.bookings.cancel', $booking), [
                'cancellation_reason' => 'Customer requested cancellation',
            ]);

        $response->assertRedirect();
        $booking->refresh();
        $this->schedule->refresh();

        $this->assertEquals('cancelled', $booking->status);
        // The booked_count should be decremented
        $this->assertEquals(0, $this->schedule->booked_count);
    }

    public function test_booking_model_check_in_method(): void
    {
        $booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'schedule_id' => $this->schedule->id,
            'member_id' => $this->member->id,
            'status' => 'confirmed',
        ]);

        $booking->checkIn($this->user->id);
        $booking->refresh();

        $this->assertEquals('checked_in', $booking->status);
        $this->assertNotNull($booking->checked_in_at);
    }

    public function test_booking_model_check_out_method(): void
    {
        $booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'schedule_id' => $this->schedule->id,
            'member_id' => $this->member->id,
            'status' => 'checked_in',
            'checked_in_at' => now()->subHours(2),
        ]);

        $booking->checkOut($this->user->id);
        $booking->refresh();

        $this->assertEquals('completed', $booking->status);
    }

    public function test_check_out_requires_checked_in_status(): void
    {
        $booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'schedule_id' => $this->schedule->id,
            'member_id' => $this->member->id,
            'status' => 'confirmed', // Not checked in
        ]);

        $this->expectException(\InvalidArgumentException::class);

        $booking->checkOut($this->user->id);
    }

    public function test_cancelled_booking_cannot_be_checked_in(): void
    {
        $booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'schedule_id' => $this->schedule->id,
            'member_id' => $this->member->id,
            'status' => 'cancelled',
        ]);

        $this->expectException(\InvalidArgumentException::class);

        $booking->checkIn($this->user->id);
    }

    public function test_no_show_booking_cannot_be_checked_in(): void
    {
        $booking = Booking::factory()->create([
            'tenant_id' => $this->tenant->id,
            'location_id' => $this->location->id,
            'schedule_id' => $this->schedule->id,
            'member_id' => $this->member->id,
            'status' => 'no_show',
        ]);

        $this->expectException(\InvalidArgumentException::class);

        $booking->checkIn($this->user->id);
    }
}
